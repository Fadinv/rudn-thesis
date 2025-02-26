from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine, text
import numpy as np
from scipy.optimize import minimize
from sklearn.covariance import LedoitWolf
import json
import os

print('check 1')
# Подключение к PostgreSQL
DATABASE_URL = "postgresql+psycopg2://postgres:password@postgres:5432/portfolio_db"
engine = create_engine(DATABASE_URL)

app = FastAPI()

def calculate_returns_matrix(stock_prices, tickers):
    """
    Формирует матрицу доходностей, корректно обрабатывая разные длины временных рядов.
    """
    returns_dict = {ticker: [] for ticker in tickers}

    # Группируем цены по тикеру
    prices_by_ticker = {ticker: [] for ticker in tickers}
    for sp in stock_prices:
        prices_by_ticker[sp[0]].append((sp[1], sp[2]))  # (date, close)

    # Вычисляем доходности
    for ticker, prices in prices_by_ticker.items():
        prices.sort()  # Сортируем по дате
        for i in range(1, len(prices)):
            prev_close = prices[i - 1][1]
            curr_close = prices[i][1]
            if prev_close > 0:
                returns_dict[ticker].append((curr_close - prev_close) / prev_close)
            else:
                returns_dict[ticker].append(0.0)

    # Преобразуем в массив
    max_length = max(len(r) for r in returns_dict.values())  # Длина самого длинного ряда
    for ticker in tickers:
        # Заполняем недостающие значения NaN
        while len(returns_dict[ticker]) < max_length:
            returns_dict[ticker].append(np.nan)

    # Создаём numpy-массив
    returns_matrix = np.array([returns_dict[ticker] for ticker in tickers], dtype=np.float64)

    # Заполняем NaN средними значениями
    returns_matrix = np.nan_to_num(returns_matrix, nan=0.0)

    return returns_matrix.T  # Транспонируем в формат (N дней, M активов)

def get_portfolio_data(report_id, additional_tickers):
    """Запрашивает данные о портфеле и объединяет их с дополнительными тикерами."""
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT p.id, p."isReadyForAnalysis", p."userId", p.name,
                   p_r."reportType", p_r.status, p_r.data, p_r."portfolioId"
            FROM portfolio_reports p_r
            JOIN portfolio p ON p_r."portfolioId" = p.id
            WHERE p_r.id = :report_id
        """), {"report_id": report_id}).fetchone()

        if not result:
            return None

        portfolio_id = result[0]

        # Получаем акции из портфеля
        stock_prices = conn.execute(text("""
            SELECT sp.ticker, sp.date, sp.close
            FROM stock_prices sp
            JOIN portfolio_stock ps ON ps."stockId" = (SELECT id FROM stock WHERE ticker = sp.ticker)
            WHERE ps."portfolioId" = :portfolio_id
            ORDER BY sp.date ASC
        """), {"portfolio_id": portfolio_id}).fetchall()

        if not stock_prices and not additional_tickers:
            return None

        # Добавляем дополнительные тикеры
        if additional_tickers:
            additional_prices = conn.execute(text("""
                SELECT sp.ticker, sp.date, sp.close
                FROM stock_prices sp
                WHERE sp.ticker IN :additional_tickers
                ORDER BY sp.date ASC
            """), {"additional_tickers": tuple(additional_tickers)}).fetchall()

            stock_prices.extend(additional_prices)

        # Преобразуем данные в нужный формат
        prices_dict = {}
        for row in stock_prices:
            ticker, date, close = row
            if ticker not in prices_dict:
                prices_dict[ticker] = []
            prices_dict[ticker].append(close)

        # Вычисляем доходности
        tickers = list(prices_dict.keys())
        returns_matrix = calculate_returns_matrix(stock_prices, tickers)

        return {
            "tickers": tickers,
            "returns": returns_matrix,
            "risk_free_rate": 0.02,  # Фиксируем безрисковую ставку
        }

def calculate_markowitz_efficient_frontier(returns: np.ndarray, tickers: list, risk_free_rate: float, num_portfolios: int = 10):
    """Выполняет оптимизацию портфеля по модели Марковица."""
    n_assets = returns.shape[1]
    mean_returns = np.mean(returns, axis=0)
    cov_matrix = LedoitWolf().fit(returns).covariance_

    target_risks = np.linspace(0.01, np.sqrt(np.max(np.diag(cov_matrix))), num_portfolios)
    efficient_frontier = []

    for target_risk in target_risks:
        initial_weights = np.ones(n_assets) / n_assets

        def objective(weights):
            port_return = np.dot(weights, mean_returns)
            port_volatility = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
            return -((port_return - risk_free_rate) / port_volatility)

        constraints = [
            {'type': 'eq', 'fun': lambda w: np.sum(w) - 1},
            {'type': 'eq', 'fun': lambda w: np.sqrt(np.dot(w.T, np.dot(cov_matrix, w))) - target_risk}
        ]
        bounds = tuple((0, 0.7) for _ in range(n_assets))

        result = minimize(objective, initial_weights, bounds=bounds, constraints=constraints)

        if result.success:
            port_return = np.dot(result.x, mean_returns)
            port_volatility = np.sqrt(np.dot(result.x.T, np.dot(cov_matrix, result.x)))
            sharpe_ratio = (port_return - risk_free_rate) / port_volatility if port_volatility > 0 else 0

            efficient_frontier.append({
                "risk": port_volatility,
                "return": port_return,
                "sharpe_ratio": sharpe_ratio,
                "weights": dict(zip(tickers, result.x.tolist()))
            })

    return efficient_frontier

@app.post("/optimize")
async def optimize_portfolio(request: dict):
    report_id = request["reportId"]
    additional_tickers = request.get("additionalTickers", [])

    print(f"🔍 Запускаем анализ отчёта {report_id} с дополнительными тикерами: {additional_tickers}")

    portfolio_data = get_portfolio_data(report_id, additional_tickers)
    if not portfolio_data:
        raise HTTPException(status_code=404, detail="Report not found")

    result = calculate_markowitz_efficient_frontier(
        portfolio_data["returns"], portfolio_data["tickers"], portfolio_data["risk_free_rate"]
    )

    # ✅ Обновляем отчет в БД
    with engine.connect() as conn:
        conn.execute(text("""
            UPDATE portfolio_reports
            SET data = :data, status = 'ready'
            WHERE id = :report_id
        """), {"data": json.dumps(result), "report_id": report_id})
        conn.commit()

    print(f"✅ Отчёт {report_id} обновлён!")
    return {"status": "ready"}

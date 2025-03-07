from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine, text
import numpy as np
from scipy.optimize import minimize
from sklearn.covariance import LedoitWolf
import json
import os

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


def calculate_markowitz_efficient_frontier(returns: np.ndarray, tickers: list, risk_free_rate: float, num_portfolios: int = 20):
    """Выполняет оптимизацию портфеля по модели Марковица с улучшенным фильтром неэффективных портфелей."""
    n_assets = returns.shape[1]
    mean_returns = np.mean(returns, axis=0)
    cov_matrix = LedoitWolf().fit(returns).covariance_

    # 1️⃣ Находим портфель с минимальным риском
    def min_risk_objective(weights):
        return np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))

    constraints = [{'type': 'eq', 'fun': lambda w: np.sum(w) - 1}]
    bounds = tuple((0, 1) for _ in range(n_assets))

    result_min_risk = minimize(min_risk_objective, np.ones(n_assets) / n_assets, bounds=bounds, constraints=constraints)

    min_risk_portfolio = {
        "risk": np.sqrt(np.dot(result_min_risk.x.T, np.dot(cov_matrix, result_min_risk.x))),
        "return": np.dot(result_min_risk.x, mean_returns),
        "weights": dict(zip(tickers, result_min_risk.x.tolist()))
    }

    # 2️⃣ Находим портфель с максимальной доходностью
    def max_return_objective(weights):
        return -np.dot(weights, mean_returns)  # Максимизируем доходность (отрицательный знак для минимизации)

    result_max_return = minimize(max_return_objective, np.ones(n_assets) / n_assets, bounds=bounds, constraints=constraints)

    max_return_portfolio = {
        "risk": np.sqrt(np.dot(result_max_return.x.T, np.dot(cov_matrix, result_max_return.x))),
        "return": np.dot(result_max_return.x, mean_returns),
        "weights": dict(zip(tickers, result_max_return.x.tolist()))
    }

    # 3️⃣ Строим эффективную границу, но исключаем неэффективные портфели
    min_risk = min_risk_portfolio["risk"]
    max_risk = max_return_portfolio["risk"]

    # Создаем более точную сетку уровней риска
    target_risks = np.linspace(min_risk, max_risk, num_portfolios)

    efficient_frontier = []
    prev_return = float('-inf')

    for target_risk in target_risks:
        initial_weights = np.ones(n_assets) / n_assets

        def sharpe_objective(weights):
            port_return = np.dot(weights, mean_returns)
            port_volatility = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
            return -((port_return - risk_free_rate) / port_volatility)

        constraints = [
            {'type': 'eq', 'fun': lambda w: np.sum(w) - 1},
            {'type': 'eq', 'fun': lambda w: np.sqrt(np.dot(w.T, np.dot(cov_matrix, w))) - target_risk}
        ]

        result = minimize(sharpe_objective, initial_weights, bounds=bounds, constraints=constraints)

        if result.success:
            port_return = np.dot(result.x, mean_returns)
            port_volatility = np.sqrt(np.dot(result.x.T, np.dot(cov_matrix, result.x)))
            sharpe_ratio = (port_return - risk_free_rate) / port_volatility if port_volatility > 0 else 0

            # ❌ Отбрасываем портфели, если их риск выше max_risk, но доходность ниже max_return
            if port_volatility > max_return_portfolio["risk"] and port_return < max_return_portfolio["return"]:
                continue

            # 🔥 Оставляем только растущие доходности
            if port_return > prev_return:
                efficient_frontier.append({
                    "risk": port_volatility,
                    "return": port_return,
                    "sharpe_ratio": sharpe_ratio,
                    "weights": dict(zip(tickers, result.x.tolist()))
                })
                prev_return = port_return

    # 4️⃣ Сортируем портфели по доходности перед возвратом
    efficient_frontier.sort(key=lambda x: x["return"])

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

    corrected_result = []
    risk_free_rate = portfolio_data["risk_free_rate"]  # Безрисковая ставка (годовая)
    daily_risk_free_rate = risk_free_rate / 252  # ✅ Перевод в дневную безрисковую ставку

    for portfolio in result:
        daily_return = portfolio["return"]
        daily_risk = portfolio["risk"]

        # Перевод в годовые значения
        annual_return = (1 + daily_return) ** 252 - 1
        annual_risk = daily_risk * np.sqrt(252)

        # ✅ Теперь Sharpe Ratio Daily рассчитывается правильно
        sharpe_ratio_daily = (daily_return - daily_risk_free_rate) / daily_risk if daily_risk > 0 else 0
        sharpe_ratio_annual = (annual_return - risk_free_rate) / annual_risk if annual_risk > 0 else 0

        corrected_result.append({
            "risk_daily": daily_risk,
            "return_daily": daily_return,
            "sharpe_ratio_daily": sharpe_ratio_daily,  # ✅ Исправленный расчет
            "risk_annual": annual_risk,
            "return_annual": annual_return,
            "sharpe_ratio_annual": sharpe_ratio_annual,
            "weights": portfolio["weights"]
        })

    # ✅ Обновляем отчет в БД с годовыми значениями
    with engine.connect() as conn:
        conn.execute(text("""
            UPDATE portfolio_reports
            SET data = :data, status = 'ready'
            WHERE id = :report_id
        """), {"data": json.dumps(corrected_result), "report_id": report_id})
        conn.commit()

    print(f"✅ Отчёт {report_id} обновлён с годовыми значениями!")
    return {"status": "ready", "message": "Report saved with annualized values"}


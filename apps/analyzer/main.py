from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine, text
import numpy as np
from scipy.optimize import minimize
from sklearn.covariance import LedoitWolf
from datetime import datetime, timedelta
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


def get_market_returns(start_date: str, end_date: str, ticker="SPY"):
    """
    Получает дневные доходности рыночного индекса (например, SPY) из базы данных.
    :param start_date: Начальная дата (YYYY-MM-DD)
    :param end_date: Конечная дата (YYYY-MM-DD)
    :param ticker: Тикер рыночного индекса (по умолчанию SPY)
    :return: numpy массив доходностей (N дней)
    """
    with engine.connect() as conn:
        stock_prices = conn.execute(text("""
            SELECT date, close FROM stock_prices
            WHERE ticker = :ticker
            AND date BETWEEN :start_date AND :end_date
            ORDER BY date ASC
        """), {"ticker": ticker, "start_date": start_date, "end_date": end_date}).fetchall()

    if not stock_prices:
        raise ValueError(f"Нет данных по {ticker} за период {start_date} - {end_date}")

    closes = [row[1] for row in stock_prices]  # Берем только цены закрытия

    # Вычисляем логарифмические доходности
    returns = np.diff(np.log(closes))  # log(P_t / P_t-1)

    return returns

def calculate_sortino_ratio(portfolio_returns: np.ndarray, portfolio_weights: np.ndarray, risk_free_rate=0.04):
    """
    Рассчитывает коэффициент Sortino для конкретного портфеля.

    :param portfolio_returns: Матрица доходностей активов (N дней, M активов).
    :param portfolio_weights: Вектор весов активов в портфеле.
    :param risk_free_rate: Безрисковая ставка (годовая).
    :return: Sortino Ratio (ежедневный и годовой).
    """
    daily_risk_free_rate = risk_free_rate / 252  # Приводим безрисковую ставку к дневному формату

    # 1️⃣ Вычисляем среднюю доходность портфеля с учетом весов
    weighted_returns = np.dot(portfolio_returns, portfolio_weights)  # Взвешенные доходности
    avg_daily_return = np.mean(weighted_returns)

    # 2️⃣ Отбираем только отрицательные доходности портфеля
    negative_returns = weighted_returns[weighted_returns < 0]

    # 3️⃣ Стандартное отклонение отрицательных доходностей (downside risk)
    downside_risk_daily = np.std(negative_returns) if negative_returns.size > 0 else 0

    # 4️⃣ Переводим downside risk в годовой формат
    downside_risk_annual = downside_risk_daily * np.sqrt(252)

    # 5️⃣ Рассчитываем Sortino Ratio
    sortino_ratio_daily = (avg_daily_return - daily_risk_free_rate) / downside_risk_daily if downside_risk_daily > 0 else 0
    sortino_ratio_annual = (np.power(1 + avg_daily_return, 252) - 1 - risk_free_rate) / downside_risk_annual if downside_risk_annual > 0 else 0

    return sortino_ratio_daily, sortino_ratio_annual

def classify_risk_levels(sortino_ratios):
    """
    Определяет границы для классификации портфелей на Консервативные, Сбалансированные и Агрессивные.

    :param sortino_ratios: Список значений Sortino Ratio по портфелям.
    :return: Границы для разделения.
    """
    mean_sortino = np.mean(sortino_ratios)
    std_sortino = np.std(sortino_ratios)

    conservative_threshold = mean_sortino - 0.5 * std_sortino
    balanced_threshold = mean_sortino + 0.5 * std_sortino

    return conservative_threshold, balanced_threshold


def get_portfolio_data(report_id, additional_tickers, start_date, end_date):
    """Запрашивает данные о портфеле и объединяет их с дополнительными тикерами в указанном диапазоне дат."""
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

        # Получаем акции из портфеля ТОЛЬКО за нужный диапазон дат
        stock_prices = conn.execute(text("""
            SELECT sp.ticker, sp.date, sp.close
            FROM stock_prices sp
            JOIN portfolio_stock ps ON ps."stockId" = (SELECT id FROM stock WHERE ticker = sp.ticker)
            WHERE ps."portfolioId" = :portfolio_id
            AND sp.date BETWEEN :start_date AND :end_date
            ORDER BY sp.date ASC
        """), {"portfolio_id": portfolio_id, "start_date": start_date, "end_date": end_date}).fetchall()

        if not stock_prices and not additional_tickers:
            return None

        # Добавляем дополнительные тикеры (в том же диапазоне)
        if additional_tickers:
            additional_prices = conn.execute(text("""
                SELECT sp.ticker, sp.date, sp.close
                FROM stock_prices sp
                WHERE sp.ticker IN :additional_tickers
                AND sp.date BETWEEN :start_date AND :end_date
                ORDER BY sp.date ASC
            """), {"additional_tickers": tuple(additional_tickers), "start_date": start_date, "end_date": end_date}).fetchall()

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
            "risk_free_rate": 0.04,  # Фиксируем безрисковую ставку
        }


def calculate_beta(portfolio_returns: np.ndarray, market_returns: np.ndarray, weights: np.ndarray):
    """
    Рассчитывает средневзвешенный коэффициент Beta портфеля, учитывая веса активов.

    :param portfolio_returns: Матрица доходностей портфеля (N дней, M активов)
    :param market_returns: Вектор доходностей рыночного индекса (N дней)
    :param weights: Вектор весов активов в портфеле (M активов)
    :return: Взвешенный коэффициент Beta портфеля
    """
    asset_betas = []

    for i in range(portfolio_returns.shape[1]):  # Для каждой акции в портфеле
        cov_matrix = np.cov(portfolio_returns[:, i], market_returns)  # Ковариация акции с рынком
        beta_i = cov_matrix[0, 1] / cov_matrix[1, 1]  # Beta = Cov(Акция, Индекс) / Var(Индекс)
        asset_betas.append(beta_i)

    asset_betas = np.array(asset_betas)  # Преобразуем в массив
    portfolio_beta = np.dot(weights, asset_betas)  # Взвешенная сумма бета-коэффициентов активов

    return portfolio_beta


@app.post("/optimize")
async def optimize_portfolio(request: dict):
    report_id = request["reportId"]
    additional_tickers = request.get("additionalTickers", [])

    print(f"🔍 Запускаем анализ отчёта {report_id} с дополнительными тикерами: {additional_tickers}")

    # Определяем диапазон времени (например, 3 года назад)
    start_date = (datetime.today() - timedelta(days=365 * 3)).strftime("%Y-%m-%d")
    end_date = datetime.today().strftime("%Y-%m-%d")

    # Получаем данные портфеля ТОЛЬКО за этот диапазон дат
    portfolio_data = get_portfolio_data(report_id, additional_tickers, start_date, end_date)
    if not portfolio_data:
        raise HTTPException(status_code=404, detail="Report not found")

    # Получаем рыночные доходности (например, S&P 500)
    market_returns = get_market_returns(start_date, end_date)

    result = calculate_markowitz_efficient_frontier(
        portfolio_data["returns"], portfolio_data["tickers"], portfolio_data["risk_free_rate"]
    )

    corrected_result = []
    risk_free_rate = portfolio_data["risk_free_rate"]
    daily_risk_free_rate = risk_free_rate / 252

    # Список Sortino Ratio для всех портфелей (нужен для границ)
    sortino_ratios_list = []

    for portfolio in result:
        daily_return = portfolio["return"]
        daily_risk = portfolio["risk"]

        # Перевод в годовые значения
        annual_return = (1 + daily_return) ** 252 - 1
        annual_risk = daily_risk * np.sqrt(252)

        weights_array = np.array(list(portfolio["weights"].values()))

        # Рассчитываем Beta
        portfolio_mean_returns = portfolio_data["returns"].mean(axis=1)
        beta = calculate_beta(portfolio_data["returns"], market_returns, weights_array)

        # Рассчитываем Treynor Ratio
        treynor_ratio_daily = (daily_return - daily_risk_free_rate) / beta if beta > 0 else 0
        treynor_ratio_annual = (annual_return - risk_free_rate) / beta if beta > 0 else 0

        # Вычисляем Sortino Ratio
        sortino_ratio_daily, sortino_ratio_annual = calculate_sortino_ratio(
            portfolio_data["returns"], weights_array
        )

        # Добавляем Sortino Ratio в список для расчета границ
        sortino_ratios_list.append(sortino_ratio_annual)

        corrected_result.append({
            "risk_daily": daily_risk,
            "return_daily": daily_return,
            "sharpe_ratio_daily": (daily_return - daily_risk_free_rate) / daily_risk if daily_risk > 0 else 0,
            "beta": beta,
            "sortino_ratio_daily": sortino_ratio_daily,
            "treynor_ratio_daily": treynor_ratio_daily,
            "risk_annual": annual_risk,
            "return_annual": annual_return,
            "sharpe_ratio_annual": (annual_return - risk_free_rate) / annual_risk if annual_risk > 0 else 0,
            "sortino_ratio_annual": sortino_ratio_annual,
            "treynor_ratio_annual": treynor_ratio_annual,
            "weights": portfolio["weights"]
        })

    # 1️⃣ **Вычисляем границы категорий риска**
    conservative_threshold, balanced_threshold = classify_risk_levels(sortino_ratios_list)



    # 2️⃣ **Добавляем код категории риска**
    for portfolio in corrected_result:
        sortino_ratio = portfolio["sortino_ratio_annual"]

        if sortino_ratio < conservative_threshold:
            portfolio["risk_category"] = 'conservative'  # Консервативный
        elif sortino_ratio < balanced_threshold:
            portfolio["risk_category"] = 'standard'  # Сбалансированный
        else:
            portfolio["risk_category"] = 'aggressive'  # Агрессивный

    # Обновляем отчет в БД с новыми коэффициентами
    with engine.connect() as conn:
        conn.execute(text("""
            UPDATE portfolio_reports
            SET data = :data, status = 'ready'
            WHERE id = :report_id
        """), {"data": json.dumps(corrected_result), "report_id": report_id})
        conn.commit()

    print(f"✅ Отчёт {report_id} обновлён с Beta и Treynor Ratio!")
    return {"status": "ready", "message": "Report updated with Beta and Treynor Ratio"}

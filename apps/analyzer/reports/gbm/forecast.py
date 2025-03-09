import numpy as np
import pandas_market_calendars as mcal
from datetime import datetime, timedelta

def generate_gbm_forecast(tickers, returns, quantities, last_prices, selected_percentiles, forecast_horizons):
    """
    Генерирует прогноз цен акций и стоимости портфеля на основе модели GBM.

    :param tickers: Список тикеров в портфеле.
    :param returns: Матрица доходностей (N дней, M активов).
    :param quantities: Количество акций в портфеле {ticker: quantity}.
    :param last_prices: Последние известные цены акций {ticker: last_price}.
    :param selected_percentiles: Выбранные пользователем перцентили (например, [10, 50, 90]).
    :param forecast_horizons: Горизонты прогнозирования (например, [30, 60, 90, 180, 365]).
    :return: JSON с прогнозами по акциям и портфелю.
    """

    def get_trading_days(start_date, num_days):
        """Конвертирует календарные дни в торговые дни"""
        nyse = mcal.get_calendar('NYSE')
        trading_days = nyse.valid_days(start_date=start_date, end_date=start_date + timedelta(days=num_days * 2))
        return trading_days[:num_days] if len(trading_days) >= num_days else trading_days

    today = datetime.today().date()
    forecast_dates = {
        horizon: get_trading_days(today, horizon)[-1].date()
        for horizon in forecast_horizons
        if len(get_trading_days(today, horizon)) > 0  # ✅ Исправлена ошибка проверки
    }

    forecast_data = {
        "portfolioForecast": {},
        "stocksForecast": {}
    }

    # Корректный расчет доходностей и волатильностей (учитываем весь доступный период)
    if returns.shape[0] > 0:
        yearly_mu = np.mean(returns, axis=0) * 252  # Преобразуем среднюю дневную доходность в годовую
        yearly_sigma = np.std(returns, axis=0) * np.sqrt(252)  # Преобразуем дневную волатильность в годовую
    else:
        yearly_mu = np.zeros(len(tickers))
        yearly_sigma = np.zeros(len(tickers))

    # Устанавливаем минимальный уровень волатильности, чтобы избежать деления на 0
    yearly_sigma = np.where(yearly_sigma < 1e-4, 1e-4, yearly_sigma)

    for ticker, mu, sigma in zip(tickers, yearly_mu, yearly_sigma):
        S0 = last_prices.get(ticker, 0)
        quantity = quantities.get(ticker, 0)

        # Если цена 0, пропускаем тикер
        if S0 == 0:
            continue

        future_prices = {}
        for horizon, date in forecast_dates.items():
            dt = horizon / 252  # Преобразуем дни в доли года

            random_shocks = np.random.normal(0, 1, 10000)
            gbm_returns = np.exp((mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * random_shocks)
            simulated_prices = S0 * gbm_returns

            future_prices[str(date)] = {
                f"p{percentile}": np.percentile(simulated_prices, percentile) for percentile in selected_percentiles
            }

        forecast_data["stocksForecast"][ticker] = future_prices

    # Рассчитываем прогноз стоимости портфеля
    for date in forecast_dates.values():
        portfolio_values = [
            {key: value * quantities[ticker] for key, value in forecast_data["stocksForecast"][ticker][str(date)].items()}
            for ticker in tickers if ticker in forecast_data["stocksForecast"]
        ]

        if not portfolio_values:
            continue

        forecast_data["portfolioForecast"][str(date)] = {
            f"p{percentile}": sum(stock[f"p{percentile}"] for stock in portfolio_values)
            for percentile in selected_percentiles
        }

    return forecast_data

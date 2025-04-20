import pandas_market_calendars as mcal
from datetime import datetime, timedelta, date
import numpy as np

def get_forecast_dates(horizons: list[int], today: datetime.date = None) -> dict[int, datetime.date]:
    if today is None:
        today = datetime.today().date()

    def get_trading_days(start_date, num_days):
        nyse = mcal.get_calendar('NYSE')
        trading_days = nyse.valid_days(start_date=start_date, end_date=start_date + timedelta(days=num_days * 2))
        return trading_days[:num_days] if len(trading_days) >= num_days else trading_days

    return {
        horizon: get_trading_days(today, horizon)[-1].date()
        for horizon in horizons
        if len(get_trading_days(today, horizon)) > 0
    }


def calculate_annualized_metrics(returns: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    if returns.shape[0] == 0:
        return np.zeros(returns.shape[1]), np.ones(returns.shape[1]) * 1e-4

    mu = np.mean(returns, axis=0) * 252
    sigma = np.std(returns, axis=0) * np.sqrt(252)
    sigma = np.where(sigma < 1e-4, 1e-4, sigma)
    return mu, sigma

def simulate_gbm_prices(S0: float, mu: float, sigma: float, dt: float, n_simulations: int = 10000) -> np.ndarray:
    random_shocks = np.random.normal(0, 1, n_simulations)
    gbm_returns = np.exp((mu - 0.5 * sigma**2) * dt + sigma * np.sqrt(dt) * random_shocks)
    return S0 * gbm_returns

def generate_gbm_forecast(
    tickers: list[str],
    returns: np.ndarray,
    quantities: dict[str, float],
    last_prices: dict[str, float],
    selected_percentiles: list[int],
    forecast_horizons: list[int]
) -> dict:

    from .forecast import get_forecast_dates, calculate_annualized_metrics, simulate_gbm_prices

    forecast_dates = get_forecast_dates(forecast_horizons)
    forecast_data = {
        "portfolioForecast": {},
        "stocksForecast": {}
    }

    mu_values, sigma_values = calculate_annualized_metrics(returns)
    print('LAST_PRICES', last_prices, mu_values, sigma_values)

    for ticker, mu, sigma in zip(tickers, mu_values, sigma_values):
        S0 = last_prices.get(ticker, 0)
        quantity = quantities.get(ticker, 0)

        if S0 == 0:
            continue

        future_prices = {}
        for horizon, date in forecast_dates.items():
            dt = horizon / 252
            simulated_prices = simulate_gbm_prices(S0, mu, sigma, dt)
            future_prices[str(date)] = {
                f"p{p}": float(np.percentile(simulated_prices, p)) for p in selected_percentiles
            }

        forecast_data["stocksForecast"][ticker] = future_prices

    for date in forecast_dates.values():
        portfolio_values = [
            {key: value * quantities[ticker]
             for key, value in forecast_data["stocksForecast"][ticker][str(date)].items()}
            for ticker in tickers if ticker in forecast_data["stocksForecast"]
        ]

        if not portfolio_values:
            continue

        forecast_data["portfolioForecast"][str(date)] = {
            f"p{p}": sum(stock[f"p{p}"] for stock in portfolio_values)
            for p in selected_percentiles
        }

    return forecast_data

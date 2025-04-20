from datetime import datetime, timedelta
from nest_api.nest_api import get_portfolio_data_with_history
from reports.gbm.forecast import generate_gbm_forecast
from reports.utils.utils import get_date_range

def process_gbm_report(
    report_id: str,
    selected_percentiles: list[int],
    forecast_horizons: list[int],
    date_range: str = "3y",
    target_currency: str = 'usd',
) -> dict:
    # 1. Определяем диапазон дат
    start_date, end_date = get_date_range(date_range)

    portfolio_data = get_portfolio_data_with_history(report_id, [], start_date, end_date, target_currency)
    if not portfolio_data:
        raise ValueError(f"Report {report_id} not found or no data available")

    forecast_result = generate_gbm_forecast(
        portfolio_data["tickers"],
        portfolio_data["returns"],
        portfolio_data["quantities"],
        portfolio_data["last_prices"],
        selected_percentiles,
        forecast_horizons
    )

    forecast_result["portfolioHistory"] = portfolio_data["portfolio_history"]
    forecast_result["targetCurrency"] = target_currency

    return forecast_result

from datetime import datetime, timedelta
from nest_api.nest_api import get_portfolio_data_with_history
from reports.gbm.forecast import generate_gbm_forecast

def process_gbm_report(report_id: str, selected_percentiles: list[int], forecast_horizons: list[int]) -> dict:
    start_date = (datetime.today() - timedelta(days=365 * 3)).strftime("%Y-%m-%d")
    end_date = datetime.today().strftime("%Y-%m-%d")

    portfolio_data = get_portfolio_data_with_history(report_id, [], start_date, end_date)
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
    return forecast_result

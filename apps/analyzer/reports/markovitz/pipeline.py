from datetime import datetime, timedelta
from nest_api.nest_api import get_portfolio_data, get_market_returns
from reports.markovitz.optimizer import calculate_markowitz_efficient_frontier
from reports.markovitz.risk_metrics import calculate_sortino_ratio, calculate_beta
from reports.utils.utils import classify_risk_levels, get_date_range
import numpy as np

EXCHANGE_INDEX_MAP = {
    "NASDAQ": "SPY",
    "MOEX": "IMOEX"
}

def process_markovitz_report(
    report_id: str,
    additional_tickers: list[str],
    date_range: str = "3y",
    risk_free_rate: float = 0.04,
    num_portfolios: int = 20,
    cov_method: str = "ledoit",  # или 'standard'
    target_currency: str = 'usd'
) -> list[dict]:
    # 1. Определяем диапазон дат
    start_date, end_date = get_date_range(date_range)

    # 2. Получаем данные портфеля
    portfolio_data = get_portfolio_data(report_id, additional_tickers, start_date, end_date, target_currency)
    if not portfolio_data:
        raise ValueError("Report not found")

    # 3. Получаем рыночные доходности
    exchange_set = portfolio_data.get("exchange_set")
    if not exchange_set or len(exchange_set) != 1:
        market_returns = None
    else:
        exchange = next(iter(exchange_set))
        index_ticker = EXCHANGE_INDEX_MAP.get(exchange)

        if index_ticker:
            market_returns = get_market_returns(start_date, end_date, index_ticker, target_currency)
        else:
            market_returns = None

    # 4. Расчёт эффективной границы
    raw_result = calculate_markowitz_efficient_frontier(
        portfolio_data["returns"],
        portfolio_data["tickers"],
        risk_free_rate,
        num_portfolios=num_portfolios,
        cov_method=cov_method
    )

    # 5. Постобработка результатов
    portfolio_data["risk_free_rate"] = risk_free_rate
    return postprocess_markovitz_results(raw_result, portfolio_data, market_returns, date_range, target_currency)


def postprocess_markovitz_results(
    result: list[dict],
    portfolio_data: dict,
    market_returns: np.ndarray | None,
    date_range: str = "3y",
    cov_method: str = "ledoit",
    target_currency: str = 'usd',
) -> list[dict]:
    print('--- postprocess_markovitz_results ---')
    corrected_result = []
    risk_free_rate = portfolio_data["risk_free_rate"]
    daily_risk_free_rate = risk_free_rate / 252

    for portfolio in result:
        daily_return_log = portfolio["return"]
        daily_return = np.exp(daily_return_log) - 1
        daily_risk = portfolio["risk"]

        annual_return = (1 + daily_return) ** 252 - 1
        annual_risk = daily_risk * np.sqrt(252)

        weights_array = np.array(list(portfolio["weights"].values()))

        # Опционально считаем beta и treynor только если есть рыночные доходности
        if market_returns is not None:
            beta = calculate_beta(portfolio_data["returns"], market_returns, weights_array)
            treynor_ratio_daily = (daily_return - daily_risk_free_rate) / beta if beta > 0 else 0
            treynor_ratio_annual = (annual_return - risk_free_rate) / beta if beta > 0 else 0
        else:
            beta = None
            treynor_ratio_daily = None
            treynor_ratio_annual = None

        sortino_ratio_daily, sortino_ratio_annual = calculate_sortino_ratio(
            portfolio_data["returns"], weights_array
        )

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
            "date_range": date_range,
            "cov_method": cov_method,
            "target_currency": target_currency,
            "weights": portfolio["weights"]
        })

    # Категоризация риска
    risk_annual_list = [p["risk_annual"] for p in corrected_result]
    conservative_threshold, balanced_threshold = classify_risk_levels(risk_annual_list)

    for portfolio in corrected_result:
        risk = portfolio["risk_annual"]
        if risk < conservative_threshold:
            portfolio["risk_category"] = "conservative"
        elif risk < balanced_threshold:
            portfolio["risk_category"] = "standard"
        else:
            portfolio["risk_category"] = "aggressive"

    print('---', corrected_result, '---')
    return corrected_result
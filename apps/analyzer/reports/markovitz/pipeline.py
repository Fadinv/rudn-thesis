from datetime import datetime, timedelta
from nest_api.nest_api import get_portfolio_data, get_market_returns
from reports.markovitz.optimizer import calculate_markowitz_efficient_frontier
from reports.markovitz.risk_metrics import calculate_sortino_ratio, calculate_beta
from reports.utils.utils import classify_risk_levels
import numpy as np


def process_markovitz_report(report_id: str, additional_tickers: list[str]) -> list[dict]:
    # 1. Определяем диапазон дат
    start_date = (datetime.today() - timedelta(days=365 * 3)).strftime("%Y-%m-%d")
    end_date = datetime.today().strftime("%Y-%m-%d")

    # 2. Получаем данные портфеля
    portfolio_data = get_portfolio_data(report_id, additional_tickers, start_date, end_date)
    if not portfolio_data:
        raise ValueError("Report not found")

    # 3. Получаем рыночные доходности
    market_returns = get_market_returns(start_date, end_date)

    # 4. Расчёт эффективной границы
    raw_result = calculate_markowitz_efficient_frontier(
        portfolio_data["returns"], portfolio_data["tickers"], portfolio_data["risk_free_rate"]
    )

    # 5. Постобработка результатов
    return postprocess_markovitz_results(raw_result, portfolio_data, market_returns)


def postprocess_markovitz_results(result: list[dict], portfolio_data: dict, market_returns: np.ndarray) -> list[dict]:
    corrected_result = []
    risk_free_rate = portfolio_data["risk_free_rate"]
    daily_risk_free_rate = risk_free_rate / 252

    for portfolio in result:
        daily_return = portfolio["return"]
        daily_risk = portfolio["risk"]

        # Перевод в годовые значения
        annual_return = (1 + daily_return) ** 252 - 1
        annual_risk = daily_risk * np.sqrt(252)

        weights_array = np.array(list(portfolio["weights"].values()))

        # Метрики риска и доходности
        beta = calculate_beta(portfolio_data["returns"], market_returns, weights_array)
        treynor_ratio_daily = (daily_return - daily_risk_free_rate) / beta if beta > 0 else 0
        treynor_ratio_annual = (annual_return - risk_free_rate) / beta if beta > 0 else 0
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
            "weights": portfolio["weights"]
        })

    # 6. Категоризация риска
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

    return corrected_result
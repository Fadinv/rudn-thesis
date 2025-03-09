from fastapi import APIRouter, HTTPException
from database import engine
from nest_api.nest_api import get_portfolio_data, get_market_returns, get_portfolio_data_with_history
from reports.markovitz.optimizer import calculate_markowitz_efficient_frontier
from reports.markovitz.risk_metrics import calculate_sortino_ratio, calculate_beta
from reports.gbm.forecast import generate_gbm_forecast
from reports.utils.utils import classify_risk_levels
import numpy as np
import json
from sqlalchemy import text
from datetime import datetime, timedelta

router = APIRouter()


@router.post("/markovitz")
async def create_markovitz_report(request: dict):
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

    #⃣ Вычисляем границы категорий риска
    risk_annual_list = [portfolio["risk_annual"] for portfolio in corrected_result]
    conservative_threshold, balanced_threshold = classify_risk_levels(risk_annual_list)

    # Добавляем код категории риска
    for portfolio in corrected_result:
        sortino_ratio = portfolio["risk_annual"]

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


@router.post("/future_value_gbm")
async def create_gbm_report(request: dict):
    try:
        report_id = request["reportId"]
        selected_percentiles = request.get("selectedPercentiles", [10, 50, 90])
        forecast_horizons = request.get("forecastHorizons", [30, 60, 90, 180, 365, 730, 1095])  # Дни

        print(f"🔍 Запускаем GBM прогноз для отчёта {report_id}")

        start_date = (datetime.today() - timedelta(days=365 * 3)).strftime("%Y-%m-%d")
        end_date = datetime.today().strftime("%Y-%m-%d")

        portfolio_data = get_portfolio_data_with_history(report_id, [], start_date, end_date)
        if not portfolio_data:
            raise HTTPException(status_code=404, detail="Report not found")

        forecast_result = generate_gbm_forecast(
            portfolio_data["tickers"],
            portfolio_data["returns"],
            portfolio_data["quantities"],
            portfolio_data["last_prices"],  # ✅ Теперь передаем последние цены акций
            selected_percentiles,
            forecast_horizons
        )

        # Добавляем историческую стоимость портфеля в отчет
        forecast_result["portfolioHistory"] = portfolio_data["portfolio_history"]

        with engine.connect() as conn:
            conn.execute(text("""
                UPDATE portfolio_reports
                SET data = :data, status = 'ready'
                WHERE id = :report_id
            """), {"data": json.dumps(forecast_result), "report_id": report_id})
            conn.commit()

        print(f"✅ Отчёт {report_id} обновлён с GBM прогнозом и историей портфеля!")
        return {"status": "ready", "message": "Report updated with GBM forecast and portfolio history"}

    except Exception as e:
        print(f"❌ Ошибка при создании GBM отчёта: {e}")
        raise HTTPException(status_code=500, detail=str(e))


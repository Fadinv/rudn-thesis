from fastapi import APIRouter, HTTPException
from database import engine
from nest_api.nest_api import get_portfolio_data, get_market_returns, get_portfolio_data_with_history
from reports.markovitz.optimizer import calculate_markowitz_efficient_frontier
from reports.markovitz.risk_metrics import calculate_sortino_ratio, calculate_beta
from reports.markovitz.pipeline import process_markovitz_report
from reports.gbm.pipeline import process_gbm_report
from reports.gbm.forecast import generate_gbm_forecast
from reports.utils.utils import classify_risk_levels, allocate_capital
import numpy as np
import json
from sqlalchemy import text

router = APIRouter()

@router.post("/markovitz")
async def create_markovitz_report(request: dict):
    report_id = request["reportId"]
    additional_tickers = request.get("additionalTickers", [])
    date_range = request["date_range"]
    risk_free_rate = request["risk_free_rate"]
    num_portfolios = request["num_portfolios"]
    cov_method = request["cov_method"]
    print('report_id', report_id)
    print('additional_tickers', additional_tickers)
    print('date_range', date_range)
    print('risk_free_rate', risk_free_rate)
    print('num_portfolios', num_portfolios)
    print('cov_method', cov_method)

    print(f"🔍 Запускаем анализ отчёта {report_id} с дополнительными тикерами: {additional_tickers}")

    try:
        result = process_markovitz_report(
            report_id,
            additional_tickers,
            date_range,
            risk_free_rate,
            num_portfolios,
            cov_method
        )

        with engine.connect() as conn:
            conn.execute(text("""
                UPDATE portfolio_reports
                SET data = :data, status = 'ready'
                WHERE id = :report_id
            """), {"data": json.dumps(result), "report_id": report_id})
            conn.commit()

        print(f"✅ Отчёт {report_id} обновлён!")
        return {"status": "ready", "message": "Report updated successfully"}

    except Exception as e:
        print(f"❌ Ошибка при обработке отчёта {report_id}: {e}")
        raise HTTPException(status_code=500, detail="Ошибка при расчёте отчёта")


@router.post("/future_value_gbm")
async def create_gbm_report(request: dict):
    try:
        report_id = request["reportId"]
        selected_percentiles = request.get("selectedPercentiles", [10, 50, 90])
        forecast_horizons = request.get("forecastHorizons", [30, 60, 90, 180, 365, 730, 1095])
        date_range = request.get("date_range", "3y")

        print(f"🔍 Запускаем GBM прогноз для отчёта {report_id}")

        result = process_gbm_report(report_id, selected_percentiles, forecast_horizons, date_range)

        with engine.connect() as conn:
            conn.execute(text("""
                UPDATE portfolio_reports
                SET data = :data, status = 'ready'
                WHERE id = :report_id
            """), {"data": json.dumps(result), "report_id": report_id})
            conn.commit()

        print(f"✅ Отчёт {report_id} обновлён с GBM прогнозом и историей портфеля!")
        return {"status": "ready", "message": "Report updated with GBM forecast and portfolio history"}

    except Exception as e:
        print(f"❌ Ошибка при создании GBM отчёта: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/allocate_assets")
async def allocate_assets(request: dict):
    """
    Эндпоинт для расчета распределения капитала по активам.
    """
    try:
        capital = request["capital"]
        prices = request["prices"]
        weights = request["weights"]

        if not capital or not prices or not weights:
            raise HTTPException(status_code=400, detail="Missing required parameters")

        allocation = allocate_capital(capital, prices, weights)

        return {"allocation": allocation}

    except Exception as e:
        print(f"❌ Ошибка при распределении капитала по активам: {e}")
        raise HTTPException(status_code=500, detail=str(e))
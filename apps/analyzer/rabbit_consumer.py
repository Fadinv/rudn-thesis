import aio_pika
import asyncio
import json
import os
from rabbitmq import RabbitPublisher
from reports.markovitz.pipeline import process_markovitz_report
from reports.gbm.pipeline import process_gbm_report
from sqlalchemy import text
from database import engine
import numpy as np

async def handle_report_created(payload):
    print(f"📥 Получено событие report.created: {payload}", flush=True)

    data = payload.get("data", payload)  # поддержка как обёрнутого, так и голого payload
    report_id = data["id"]
    report_type = data["reportType"]
    input_params = data.get("inputParams", {})
    publisher = RabbitPublisher()

    try:
        if report_type == "markowitz":
            result = process_markovitz_report(
                report_id=report_id,
                additional_tickers=input_params.get("additionalTickers", []),
                date_range=input_params.get("date_range") or input_params.get("dateRange", "3y"),
                risk_free_rate=input_params.get("risk_free_rate") or input_params.get("riskFreeRate"),
                num_portfolios=input_params.get("num_portfolios") or input_params.get("numPortfolios"),
                cov_method=input_params.get("cov_method") or input_params.get("covMethod"),
                target_currency=input_params.get("target_currency") or input_params.get("currency", "usd"),
            )

        elif report_type == "future_returns_forecast_gbm":
            result = process_gbm_report(
                report_id=report_id,
                selected_percentiles=input_params.get("selectedPercentiles", [10, 50, 90]),
                forecast_horizons=input_params.get("forecastHorizons", [30, 60, 90, 180, 365]),
                date_range=input_params.get("date_range") or input_params.get("dateRange", "3y"),
                target_currency=input_params.get("target_currency") or input_params.get("currency", "usd"),
            )

        else:
            raise ValueError(f"Неподдерживаемый тип отчёта: {report_type}")

        # Обновляем статус в БД
        with engine.connect() as conn:
            conn.execute(text("""
                UPDATE portfolio_reports
                SET data = :data, status = 'ready', "errorMessage" = NULL
                WHERE id = :report_id
            """), {
                "data": json.dumps(result),
                "report_id": report_id
            })
            conn.commit()

        def clean_floats(obj):
            if isinstance(obj, dict):
                return {k: clean_floats(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [clean_floats(v) for v in obj]
            elif isinstance(obj, np.float64):
                return float(obj)
            return obj
        result_clean = clean_floats(result)

        # Отправляем событие об успешном обновлении
        await publisher.send_event("report.updated", {
            "id": report_id,
            "status": "ready",
            "data": result_clean,
        })

        print(f"✅ Отчёт {report_id} успешно рассчитан и обновлён", flush=True)

    except Exception as e:
        error_message = str(e)
        print(f"❌ Ошибка при расчёте отчёта {report_id}: {error_message}", flush=True)

        try:
            with engine.connect() as conn:
                conn.execute(text("""
                    UPDATE portfolio_reports
                    SET status = 'error', "errorMessage" = :msg
                    WHERE id = :report_id
                """), {
                    "msg": error_message,
                    "report_id": report_id
                })
                conn.commit()
        except Exception as db_error:
            print(f"❌ Failed to update report {report_id} status: {db_error}", flush=True)

        # Отправляем событие об ошибке
        await publisher.send_event("report.updated", {
            "id": report_id,
            "status": "error",
            "errorMessage": error_message,
        })



async def consume():
    print('start to conntent: rmq ...', flush=True)
    connection = await aio_pika.connect_robust(os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq/"))
    channel = await connection.channel()
    queue = await channel.declare_queue("analyzer_events_queue", durable=True)
    exchange = await channel.declare_exchange("reports_exchange", aio_pika.ExchangeType.DIRECT, durable=True)
    await queue.bind(exchange, routing_key="report.created")

    print('rmq successfully connected', flush=True)

    async with queue.iterator() as queue_iter:
        async for message in queue_iter:
            async with message.process():  # ✅ автоматически ack + requeue on error
                try:
                    payload = json.loads(message.body.decode())

                    # ⚠️ payload — это уже тело, а не {'data': payload}
                    if message.routing_key == "report.created":
                        await handle_report_created(payload)

                except Exception as e:
                    print(f"❌ Error processing message: {e}", flush=True)

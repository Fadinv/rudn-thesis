import aio_pika
import asyncio
import json
from rabbitmq import RabbitPublisher
from reports.markovitz.pipeline import process_markovitz_report
from reports.gbm.pipeline import process_gbm_report
from sqlalchemy import text
from database import engine

async def handle_report_created(payload):
    print(f"📥 Получено событие report.created: {payload}", flush=True)

    report_id = payload["id"]
    report_type = payload["reportType"]
    input_params = payload.get("inputParams", {})
    publisher = RabbitPublisher()

    try:
        if report_type == "markowitz":
            result = process_markovitz_report(
                report_id=report_id,
                additional_tickers=input_params.get("additionalTickers", []),
                date_range=input_params["date_range"],
                risk_free_rate=input_params["risk_free_rate"],
                num_portfolios=input_params["num_portfolios"],
                cov_method=input_params["cov_method"],
                target_currency=input_params.get("target_currency", "usd"),
            )

        elif report_type == "future_returns_forecast_gbm":
            result = process_gbm_report(
                report_id=report_id,
                selected_percentiles=input_params.get("selectedPercentiles", [10, 50, 90]),
                forecast_horizons=input_params.get("forecastHorizons", [30, 60, 90, 180, 365]),
                date_range=input_params.get("date_range", "3y"),
                target_currency=input_params.get("target_currency", "usd"),
            )

        else:
            raise ValueError(f"Неподдерживаемый тип отчёта: {report_type}")

        with engine.connect() as conn:
            conn.execute(text("""
                UPDATE portfolio_reports
                SET data = :data, status = 'ready', error_message = NULL
                WHERE id = :report_id
            """), {
                "data": json.dumps(result),
                "report_id": report_id
            })
            conn.commit()

        await publisher.send_event("report.updated", {
            "id": report_id,
            "status": "ready",
            "result": result,
        })

        print(f"✅ Отчёт {report_id} успешно рассчитан и обновлён", flush=True)

    except Exception as e:
        error_message = str(e)
        print(f"❌ Ошибка при расчёте отчёта {report_id}: {error_message}", flush=True)

        with engine.connect() as conn:
            conn.execute(text("""
                UPDATE portfolio_reports
                SET status = 'error', error_message = :msg
                WHERE id = :report_id
            """), {
                "msg": error_message,
                "report_id": report_id
            })
            conn.commit()

        await publisher.send_event("report.updated", {
            "id": report_id,
            "status": "error",
            "errorMessage": error_message,
        })


async def consume():
    print('start to conntent: rmq ...', flush=True)
    connection = await aio_pika.connect_robust("amqp://guest:guest@rabbitmq/")
    channel = await connection.channel()
    queue = await channel.declare_queue("portfolio_events_queue", durable=True)
    exchange = await channel.declare_exchange("reports_exchange", aio_pika.ExchangeType.DIRECT, durable=True)
    await queue.bind(exchange, routing_key="report.created")

    print('rmq successfully connected', flush=True)

    async with queue.iterator() as queue_iter:
        async for message in queue_iter:
            async with message.process():
                payload = json.loads(message.body.decode())
                print(f'message {message}', flush=True)
                if message.routing_key == "report.created":
                    await handle_report_created(payload)

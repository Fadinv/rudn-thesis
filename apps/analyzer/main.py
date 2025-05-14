from fastapi import FastAPI
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from prometheus_client import PROCESS_COLLECTOR, PLATFORM_COLLECTOR
from starlette.responses import Response
from routers.optimization_routes import router as optimization_router
from rabbit_consumer import consume
import asyncio

app = FastAPI()

# Включаем сбор системных метрик (CPU, память и т.п.)
PROCESS_COLLECTOR.collect()
PLATFORM_COLLECTOR.collect()

@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

app.include_router(optimization_router)

@app.on_event("startup")
async def startup_event():
    async def start_consumer_with_retry():
        import time
        while True:
            try:
                print("🔄 Подключаюсь к RabbitMQ...", flush=True)
                await consume()
            except Exception as e:
                print(f"❌ Ошибка подключения к RabbitMQ: {e}. Повтор через 5 секунд.", flush=True)
                time.sleep(5)  # sync sleep, можно и asyncio.sleep(5), если всё async
    asyncio.create_task(start_consumer_with_retry())

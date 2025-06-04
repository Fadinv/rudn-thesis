import aio_pika
import asyncio
import json
import os
from typing import Any

class RabbitPublisher:
    def __init__(self, url: str | None = None):
        self.url = url or os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq/")
        self.connection: aio_pika.RobustConnection | None = None

    async def connect(self):
        self.connection = await aio_pika.connect_robust(self.url)

    async def send_event(self, routing_key: str, payload: Any):
        if not self.connection:
            await self.connect()

        channel = await self.connection.channel()
        exchange = await channel.declare_exchange(
            "reports_exchange", aio_pika.ExchangeType.DIRECT, durable=True
        )
        try:
            await exchange.publish(
                aio_pika.Message(body=json.dumps(payload).encode()), routing_key=routing_key
            )
        except Exception as e:
            print(f"❌ Failed to publish event: {e}", flush=True)

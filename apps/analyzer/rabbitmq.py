import aio_pika
import asyncio
import json
import os
from typing import Any, Optional


class RabbitPublisher:
    def __init__(self, url: Optional[str] = None):
        self.url = url or os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq/")
        self.connection: Optional[aio_pika.RobustConnection] = None
        self.channel: Optional[aio_pika.Channel] = None
        self.exchange: Optional[aio_pika.Exchange] = None

    async def connect(self):
        if not self.connection:
            self.connection = await aio_pika.connect_robust(self.url)

        if not self.channel:
            self.channel = await self.connection.channel()

        if not self.exchange:
            self.exchange = await self.channel.declare_exchange(
                "reports_exchange", aio_pika.ExchangeType.DIRECT, durable=True
            )

    async def send_event(self, routing_key: str, payload: Any):
        print('send_event ---!!!', flush=True)
        await self.connect()

        message = {
            "pattern": routing_key,
            "data": payload,
        }

        body = json.dumps(message).encode()

        try:
            await self.exchange.publish(
                aio_pika.Message(
                    body=body,
                    content_type="application/json"
                ),
                routing_key=routing_key
            )
            print(f"📤 Событие отправлено: {routing_key} → {payload}", flush=True)

        except Exception as e:
            print(f"❌ Failed to publish event '{routing_key}': {e}", flush=True)

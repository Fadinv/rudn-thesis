import aio_pika
import asyncio
import json
from typing import Any

class RabbitPublisher:
    def __init__(self, url: str = "amqp://guest:guest@rabbitmq/"):
        self.url = url
        self.connection: aio_pika.RobustConnection | None = None

    async def connect(self):
        self.connection = await aio_pika.connect_robust(self.url)

    async def send_event(self, routing_key: str, payload: Any):
        if not self.connection:
            await self.connect()

        channel = await self.connection.channel()
        await channel.default_exchange.publish(
            aio_pika.Message(body=json.dumps(payload).encode()),
            routing_key=routing_key,
        )

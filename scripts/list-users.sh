#!/bin/bash

CONTAINER=$(docker ps --filter "name=backend" --format "{{.Names}}" | head -n 1)

if [ -z "$CONTAINER" ]; then
  echo "❌ Контейнер с именем, содержащим 'backend', не найден."
  exit 1
fi

echo "📦 Используем контейнер: $CONTAINER"
docker exec -it "$CONTAINER" sh -c "npx ts-node -r tsconfig-paths/register src/scripts/list-users.ts"

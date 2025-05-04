#!/bin/bash

USER_ID=$1

if [ -z "$USER_ID" ]; then
  echo "❌ Укажите ID пользователя, которого нужно удалить."
  echo "Пример: ./delete-user.sh 5"
  exit 1
fi

CONTAINER=$(docker ps --filter "name=backend" --format "{{.Names}}" | head -n 1)

if [ -z "$CONTAINER" ]; then
  echo "❌ Контейнер с именем, содержащим 'backend', не найден."
  exit 1
fi

echo "🗑 Удаление пользователя с ID $USER_ID через контейнер $CONTAINER"
docker exec -it "$CONTAINER" sh -c "USER_ID=$USER_ID npx ts-node -r tsconfig-paths/register src/scripts/delete-user.ts"

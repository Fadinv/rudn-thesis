FROM node:20-alpine

WORKDIR /app

# Копируем только frontend package.json
COPY ./apps/frontend/package.json ./

# Устанавливаем зависимости только для frontend
RUN npm install --omit=dev

# Копируем все файлы из папки frontend
COPY ./apps/frontend ./

# Запускаем приложение в dev-режиме
CMD ["npm", "run", "dev"]

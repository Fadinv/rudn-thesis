FROM node:20-alpine

WORKDIR /app

# Копируем package.json
COPY ./apps/backend/package.json ./
RUN npm install

# Копируем все файлы из проекта
COPY ./apps/backend ./

# Запуск приложения с использованием npx
CMD ["npx", "nest", "start:dev"]

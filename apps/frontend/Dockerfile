FROM node:20-alpine

# Установим рабочую директорию как корень монорепо
WORKDIR /monorepo

# Копируем package.json и lock
COPY package.json package-lock.json ./

# Копируем весь monorepo (чтобы попасть в workspaces)
COPY . .

# Установим все зависимости
RUN npm ci

# Перейдём в frontend
WORKDIR /monorepo/apps/frontend

# Экспонируем порт
EXPOSE 3000

# Запускаем dev-режим
CMD ["npm", "run", "dev"]

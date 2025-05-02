FROM node:20-alpine

# Переход в корень монорепы
WORKDIR /monorepo

# Копируем зависимости и код
COPY package.json package-lock.json ./
COPY . .

# Установка зависимостей для всех workspaces
RUN npm ci

# Переход в папку бота
WORKDIR /monorepo/apps/invite-bot

# Сборка TypeScript
RUN npm run build

# Запуск
CMD ["npm", "run", "start"]

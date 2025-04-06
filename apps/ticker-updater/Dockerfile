FROM node:20-alpine

# Переходим в корень монорепо
WORKDIR /monorepo

# Копируем корневые package.json и lock
COPY package.json package-lock.json ./

# Копируем весь монорепозиторий (включая workspaces)
COPY . .

# Устанавливаем зависимости один раз для всех workspaces
RUN npm ci

# Переходим в директорию ticker-updater
WORKDIR /monorepo/apps/ticker-updater

# Собираем TypeScript код
RUN npm run build

# Запуск сервиса
CMD ["npm", "run", "start"]
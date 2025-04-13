FROM node:20-alpine

WORKDIR /monorepo

# Копируем только package.json и lock-файл для кэширования
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем весь монорепозиторий (после установки — для кэширования зависимостей)
COPY . .

WORKDIR /monorepo/apps/backend

EXPOSE 4000

CMD ["npm", "run", "start:dev"]

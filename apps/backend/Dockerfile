FROM node:20-alpine

# Рабочая директория — корень монорепо
WORKDIR /monorepo

# Копируем package.json и lock-файл из корня
COPY package.json package-lock.json ./

# Копируем весь monorepo (нужно для workspaces и сборки)
COPY . .

# Устанавливаем зависимости (в том числе для backend)
RUN npm ci

# Переход в backend директорию
WORKDIR /monorepo/apps/backend

# Прокидываем порт, если нужно (например, 4000)
EXPOSE 4000

# Запуск Nest.js в режиме разработки
CMD ["npm", "run", "start:dev"]

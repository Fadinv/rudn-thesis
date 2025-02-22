FROM node:20-alpine

WORKDIR /app

# Копируем package.json
COPY ./apps/ticker-updater/package.json ./
RUN npm install

# Копируем все файлы из проекта
COPY ./apps/ticker-updater ./

RUN npm run build
CMD ["npm", "run", "start"]

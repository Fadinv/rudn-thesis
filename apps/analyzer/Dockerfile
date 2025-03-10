# Используем легковесный образ Python
FROM python:3.10
ENV PYTHONPATH="/app"

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем только requirements.txt для кеширования зависимостей
COPY requirements.txt requirements.txt

# Устанавливаем зависимости (если они не менялись, Docker кеширует этот слой)
RUN pip install --no-cache-dir -r requirements.txt

# Теперь копируем код после установки зависимостей
COPY . /app

# Открываем порт 8001 (не обязательно, но полезно)
EXPOSE 8001

# Запускаем сервер FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]

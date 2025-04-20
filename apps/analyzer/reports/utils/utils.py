import numpy as np
import pandas_market_calendars as mcal
from datetime import datetime, timedelta


def calculate_returns_matrix(stock_prices, tickers):
    """
    Формирует матрицу доходностей, корректно обрабатывая разные длины временных рядов.
    """
    returns_dict = {ticker: [] for ticker in tickers}

    # Группируем цены по тикеру
    prices_by_ticker = {ticker: [] for ticker in tickers}
    for sp in stock_prices:
        prices_by_ticker[sp[0]].append((sp[1], sp[2]))  # (date, close)

    # Вычисляем доходности
    for ticker, prices in prices_by_ticker.items():
        prices.sort()  # Сортируем по дате
        for i in range(1, len(prices)):
            prev_close = prices[i - 1][1]
            curr_close = prices[i][1]
            if prev_close > 0:
                returns_dict[ticker].append((curr_close - prev_close) / prev_close)
            else:
                returns_dict[ticker].append(0.0)

    # Преобразуем в массив
    max_length = max(len(r) for r in returns_dict.values())  # Длина самого длинного ряда
    for ticker in tickers:
        # Заполняем недостающие значения NaN
        while len(returns_dict[ticker]) < max_length:
            returns_dict[ticker].append(np.nan)

    # Создаём numpy-массив
    returns_matrix = np.array([returns_dict[ticker] for ticker in tickers], dtype=np.float64)

    # Заполняем NaN средними значениями
    returns_matrix = np.nan_to_num(returns_matrix, nan=0.0)

    return returns_matrix.T  # Транспонируем в формат (N дней, M активов)


def classify_risk_levels(risks):
    """
    Определяет границы для классификации портфелей по уровню риска.

    :param risks: Список значений годового риска (волатильности) по портфелям.
    :return: Границы для разделения.
    """
    mean_risk = np.mean(risks)
    std_risk = np.std(risks)

    conservative_threshold = mean_risk - 0.5 * std_risk
    balanced_threshold = mean_risk + 0.5 * std_risk

    return conservative_threshold, balanced_threshold


def get_trading_days(start_date, num_days):
    """Конвертирует календарные дни в торговые дни"""
    nyse = mcal.get_calendar('NYSE')  # Можно заменить на нужную биржу
    trading_days = nyse.valid_days(start_date=start_date, end_date=start_date + timedelta(days=num_days*2))
    return trading_days[:num_days]  # Берем только нужное количество дней


def allocate_capital(capital, prices, weights):
    """
    Распределяет капитал по акциям, учитывая их цены и заданные веса.

    :param capital: Общая сумма капитала (float)
    :param prices: Словарь {тикер: цена акции} (dict)
    :param weights: Словарь {тикер: вес в портфеле} (dict)
    :return: Объект {тикер: {"quantity": int, "price": float}}, остаток капитала (float)
    """

    # Рассчитываем доступные средства для каждого актива согласно весам
    allocated_funds = {ticker: capital * weight for ticker, weight in weights.items()}

    # Рассчитываем начальное количество акций (округляем вниз, чтобы не выйти за бюджет)
    portfolio = {
        ticker: {"quantity": int(allocated_funds[ticker] // prices[ticker]), "price": prices[ticker]}
        for ticker in prices
    }

    # Рассчитываем оставшиеся средства
    remaining_capital = capital - sum(portfolio[t]["quantity"] * portfolio[t]["price"] for t in portfolio)

    # Сортируем активы по весу, чтобы перераспределять остаток приоритезированно
    sorted_tickers = sorted(weights.keys(), key=lambda x: weights[x], reverse=True)

    # Перераспределяем оставшиеся средства, покупая дополнительные акции при возможности
    for ticker in sorted_tickers:
        while remaining_capital >= portfolio[ticker]["price"]:
            portfolio[ticker]["quantity"] += 1
            remaining_capital -= portfolio[ticker]["price"]

    return portfolio, remaining_capital


def get_date_range(date_range: str) -> tuple[str, str]:
    """Преобразует date_range в формат ('start_date', 'end_date')"""
    end_date = datetime.today()
    if date_range == "1m":
        delta = timedelta(days=30)
    elif date_range == "3m":
        delta = timedelta(days=90)
    elif date_range == "6m":
        delta = timedelta(days=180)
    elif date_range == "1y":
        delta = timedelta(days=365)
    elif date_range == "2y":
        delta = timedelta(days=730)
    elif date_range == "3y":
        delta = timedelta(days=1095)
    else:
        raise ValueError(f"Неподдерживаемый диапазон: {date_range}")

    start_date = end_date - delta
    return start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d")

from datetime import date, timedelta
from sqlalchemy import text
from database import engine

# Кеш для хранения данных
_cached_usd_rub_prices = None


def fill_missing_fx_rates(fx_data: dict[str, float]) -> dict[str, float]:
    """Заполняет пропущенные даты, используя последнее доступное значение."""
    if not fx_data:
        return {}

    sorted_dates = sorted(fx_data.keys())
    start = date.fromisoformat(sorted_dates[0])
    end = date.fromisoformat(sorted_dates[-1])

    filled_data = {}
    last_value = None
    current = start

    while current <= end:
        iso = current.isoformat()
        if iso in fx_data:
            last_value = fx_data[iso]
        filled_data[iso] = last_value
        current += timedelta(days=1)

    return filled_data

import numpy as np
import pandas_market_calendars as mcal

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
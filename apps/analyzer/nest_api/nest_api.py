import numpy as np
from database import engine
from sqlalchemy import text
from reports.utils.utils import calculate_returns_matrix
from nest_api.load_usd_rub_prices import get_usd_rub_prices_in_range
from datetime import datetime, timedelta, date
from collections import defaultdict
import pandas_market_calendars as mcal
import traceback


def _fetch_report_data(conn, report_id):
    return conn.execute(text("""
        SELECT p.id, p."isReadyForAnalysis", p."userId", p.name,
               p_r."reportType", p_r.status, p_r.data, p_r."portfolioId"
        FROM portfolio_reports p_r
        JOIN portfolio p ON p_r."portfolioId" = p.id
        WHERE p_r.id = :report_id
    """), {"report_id": report_id}).fetchone()


def _fetch_stock_prices(conn, portfolio_id, start_date, end_date):
    return conn.execute(text("""
        SELECT sp.ticker, sp.date, sp.close, s.exchange, s.currency_name
        FROM stock_prices sp
        JOIN stock s ON s.ticker = sp.ticker
        JOIN portfolio_stock ps ON ps."stockId" = s.id
        WHERE ps."portfolioId" = :portfolio_id
        AND sp.date BETWEEN :start_date AND :end_date
        ORDER BY sp.date ASC
    """), {"portfolio_id": portfolio_id, "start_date": start_date, "end_date": end_date}).fetchall()


def _fetch_additional_prices(conn, additional_tickers, start_date, end_date):
    if not additional_tickers:
        return []
    return conn.execute(text("""
        SELECT sp.ticker, sp.date, sp.close, s.exchange, s.currency_name
        FROM stock_prices sp
        JOIN stock s ON s.ticker = sp.ticker
        WHERE sp.ticker IN :additional_tickers
        AND sp.date BETWEEN :start_date AND :end_date
        ORDER BY sp.date ASC
    """), {"additional_tickers": tuple(additional_tickers), "start_date": start_date, "end_date": end_date}).fetchall()


def get_portfolio_data(report_id, additional_tickers, start_date, end_date, target_currency='usd'):
    """Главная функция: собирает и возвращает данные портфеля с учётом валюты."""
    with engine.connect() as conn:
        report_data = _fetch_report_data(conn, report_id)

        if not report_data:
            return None
        portfolio_id = report_data[0]

        start_date = _adjust_start_date_by_availability(conn, portfolio_id, additional_tickers, start_date)
        if date.fromisoformat(start_date) >= date.fromisoformat(end_date):
            print(f"❌ Диапазон дат некорректен: start_date {start_date} >= end_date {end_date}")
            return None

        stock_prices = _fetch_stock_prices(conn, portfolio_id, start_date, end_date)
        if not stock_prices and not additional_tickers:
            return None

        additional_prices = _fetch_additional_prices(conn, additional_tickers, start_date, end_date)
        stock_prices.extend(additional_prices)

        currency_by_ticker = _build_currency_map(stock_prices)
        exchange_set, currency_set = _build_sets(stock_prices)

        print("exchange_set:", exchange_set)
        print("currency_set:", currency_set)

        stock_prices = _convert_currencies(
            stock_prices, currency_by_ticker, currency_set, target_currency, start_date, end_date
        )

        prices_dict = _build_prices_dict(stock_prices)
        stock_prices = _remove_duplicates(stock_prices)

        tickers = list(prices_dict.keys())
        returns_matrix = calculate_returns_matrix(stock_prices, tickers)

        return {
            "tickers": tickers,
            "returns": returns_matrix,
            "exchange_set": exchange_set,
            "currency": target_currency,
            "risk_free_rate": 0.04,
            "start_date": start_date,
        }

def _adjust_start_date_by_availability(conn, portfolio_id, additional_tickers, start_date: str) -> str:
    """Ограничивает start_date самой поздней из earliest доступных дат по тикерам."""
    base_query = """
        SELECT s.ticker, MIN(sp.date) AS first_date
        FROM stock_prices sp
        JOIN stock s ON s.ticker = sp.ticker
        JOIN portfolio_stock ps ON ps."stockId" = s.id
        WHERE ps."portfolioId" = :portfolio_id
        GROUP BY s.ticker
    """
    result = conn.execute(text(base_query), {"portfolio_id": portfolio_id}).fetchall()

    if additional_tickers:
        add_query = """
            SELECT s.ticker, MIN(sp.date) AS first_date
            FROM stock_prices sp
            JOIN stock s ON s.ticker = sp.ticker
            WHERE s.ticker IN :additional_tickers
            GROUP BY s.ticker
        """
        additional_result = conn.execute(text(add_query), {"additional_tickers": tuple(additional_tickers)}).fetchall()
        result.extend(additional_result)

    if not result:
        return start_date

    latest_earliest_date = max(row[1] for row in result)  # max(MIN(date))
    print(f"📅 Проверка дат: start_date={start_date}, latest available={latest_earliest_date}")

    if date.fromisoformat(start_date) < latest_earliest_date:
        print(f"⚠️ start_date ограничена с {start_date} до {latest_earliest_date}")
        return latest_earliest_date.isoformat()

    return start_date

def _build_currency_map(stock_prices):
    currency_by_ticker = {}
    for row in stock_prices:
        ticker = row[0]
        currency = row[4]
        currency_by_ticker[ticker] = currency.upper()
    return currency_by_ticker

def _build_sets(stock_prices):
    exchange_set = set()
    currency_set = set()
    for row in stock_prices:
        exchange_set.add(row[3])
        currency_set.add(row[4].upper())
    return exchange_set, currency_set

def _convert_currencies(stock_prices, currency_by_ticker, currency_set, target_currency, start_date, end_date):
    if target_currency == 'usd' and 'SUR' in currency_set:
        print('🔁 Конвертация SUR → USD')
        fx_rates = get_usd_rub_prices_in_range(start_date, end_date)

        converted = []
        for ticker, date, close, exchange, _ in stock_prices:
            currency = currency_by_ticker[ticker]
            if currency == 'SUR':
                fx = fx_rates.get(str(date))
                if fx:
                    close = close / fx
            converted.append((ticker, date, close, exchange))
        return converted

    elif target_currency == 'sur' and 'USD' in currency_set:
        print('🔁 Конвертация USD → SUR')
        fx_rates = get_usd_rub_prices_in_range(start_date, end_date)

        converted = []
        for ticker, date, close, exchange, _ in stock_prices:
            currency = currency_by_ticker[ticker]
            if currency == 'USD':
                fx = fx_rates.get(str(date))
                if fx:
                    close = close * fx
            converted.append((ticker, date, close, exchange))
        return converted

    else:
        return [(ticker, date, close, exchange) for ticker, date, close, exchange, _ in stock_prices]

def _build_prices_dict(stock_prices):
    prices_dict = {}
    for ticker, date, close, exchange in stock_prices:
        prices_dict.setdefault(ticker, []).append(close)
    return prices_dict

def _remove_duplicates(stock_prices):
    seen = set()
    filtered = []
    for row in reversed(stock_prices):
        key = (row[0], row[1])  # (ticker, date)
        if key not in seen:
            seen.add(key)
            filtered.append(row)
    return list(reversed(filtered))


def get_market_returns(start_date: str, end_date: str, ticker="SPY", target_currency='usd'):
    """
    Получает дневные доходности рыночного индекса (например, SPY) из базы данных, с учётом валюты.
    :param start_date: Начальная дата (YYYY-MM-DD)
    :param end_date: Конечная дата (YYYY-MM-DD)
    :param ticker: Тикер рыночного индекса
    :param target_currency: Валюта результата ('usd' или 'sur')
    :return: numpy массив доходностей (N дней)
    """
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT sp.date, sp.close, s.currency_name
            FROM stock_prices sp
            JOIN stock s ON s.ticker = sp.ticker
            WHERE sp.ticker = :ticker
            AND sp.date BETWEEN :start_date AND :end_date
            ORDER BY sp.date ASC
        """), {"ticker": ticker, "start_date": start_date, "end_date": end_date}).fetchall()

    if not result:
        raise ValueError(f"Нет данных по {ticker} за период {start_date} - {end_date}")

    currency = result[0][2].upper()
    data = [(row[0], row[1]) for row in result]

    # Конвертация, если необходимо
    if target_currency == 'usd' and currency == 'SUR':
        print(f"🔁 Конвертация индекса {ticker} из SUR в USD")
        fx_rates = get_usd_rub_prices_in_range(start_date, end_date)
        data = [(d, c / fx_rates[str(d)]) for d, c in data if str(d) in fx_rates]

    elif target_currency == 'sur' and currency == 'USD':
        print(f"🔁 Конвертация индекса {ticker} из USD в SUR")
        fx_rates = get_usd_rub_prices_in_range(start_date, end_date)
        data = [(d, c * fx_rates[str(d)]) for d, c in data if str(d) in fx_rates]

    closes = [c for _, c in data]
    returns = np.diff(np.log(closes))

    return returns


def get_portfolio_data_with_history(report_id, additional_tickers, start_date, end_date, target_currency='usd'):
    """Запрашивает данные о портфеле и объединяет их с дополнительными тикерами в указанном диапазоне дат."""
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT p.id, p."isReadyForAnalysis", p."userId", p.name,
                   p_r."reportType", p_r.status, p_r.data, p_r."portfolioId"
            FROM portfolio_reports p_r
            JOIN portfolio p ON p_r."portfolioId" = p.id
            WHERE p_r.id = :report_id
        """), {"report_id": report_id}).fetchone()

        if not result:
            return None

        portfolio_id = result[0]

        start_date = _adjust_start_date_by_availability(conn, portfolio_id, additional_tickers, start_date)
        if date.fromisoformat(start_date) >= date.fromisoformat(end_date):
            print(f"❌ Диапазон дат некорректен: start_date {start_date} >= end_date {end_date}")
            return None

        quantities = _get_portfolio_quantities(conn, portfolio_id)

        stock_prices = _get_all_prices_with_currency(conn, portfolio_id, additional_tickers, start_date, end_date)

        if not stock_prices:
            return None

        currency_by_ticker = {row[0]: row[4].upper() for row in stock_prices}

        exchange_set, currency_set = _build_sets(stock_prices)

        stock_prices = _convert_currencies_general(stock_prices, currency_by_ticker, currency_set, target_currency, start_date, end_date)

        prices_dict = defaultdict(dict)
        for ticker, date_, close, *_ in stock_prices:
            prices_dict[ticker][str(date_)] = close

        all_dates = sorted(set(date for ticker_data in prices_dict.values() for date in ticker_data))

        # определяем даты для анализа (первая доступная дата каждого месяца по любому тикеру)
        first_business_days = _get_available_month_starts(all_dates)

        # рассчитываем историю портфеля
        portfolio_history = _calculate_portfolio_history(first_business_days, prices_dict, quantities)

        tickers = list(prices_dict.keys())
        stock_prices_filtered = _remove_duplicates(stock_prices)
        returns_matrix = calculate_returns_matrix(stock_prices_filtered, tickers)

        last_prices = {
            ticker: prices_dict[ticker][sorted(prices_dict[ticker].keys())[-1]]
            for ticker in tickers if prices_dict[ticker]
        }

        return {
            "tickers": tickers,
            "returns": returns_matrix,
            "currency": target_currency,
            "quantities": quantities,
            "last_prices": last_prices,
            "exchange_set": exchange_set,
            "portfolio_history": portfolio_history,
            "risk_free_rate": 0.04,
            "start_date": start_date,
        }


def _get_portfolio_quantities(conn, portfolio_id):
    result = conn.execute(text("""
        SELECT s.ticker, ps.quantity
        FROM portfolio_stock ps
        JOIN stock s ON ps."stockId" = s.id
        WHERE ps."portfolioId" = :portfolio_id
    """), {"portfolio_id": portfolio_id}).fetchall()
    quantities = defaultdict(float)
    for ticker, quantity in result:
        quantities[ticker] += quantity
    return dict(quantities)


def _get_all_prices_with_currency(conn, portfolio_id, additional_tickers, start_date, end_date):
    base_prices = conn.execute(text("""
        SELECT sp.ticker, sp.date, sp.close, s.exchange, s.currency_name
        FROM stock_prices sp
        JOIN stock s ON s.ticker = sp.ticker
        JOIN portfolio_stock ps ON ps."stockId" = s.id
        WHERE ps."portfolioId" = :portfolio_id
        AND sp.date BETWEEN :start_date AND :end_date
        ORDER BY sp.date ASC
    """), {"portfolio_id": portfolio_id, "start_date": start_date, "end_date": end_date}).fetchall()

    if additional_tickers:
        extra_prices = conn.execute(text("""
            SELECT sp.ticker, sp.date, sp.close, s.exchange, s.currency_name
            FROM stock_prices sp
            JOIN stock s ON s.ticker = sp.ticker
            WHERE sp.ticker IN :additional_tickers
            AND sp.date BETWEEN :start_date AND :end_date
            ORDER BY sp.date ASC
        """), {"additional_tickers": tuple(additional_tickers), "start_date": start_date, "end_date": end_date}).fetchall()
        return base_prices + extra_prices

    return base_prices


def _convert_currencies_general(stock_prices, currency_by_ticker, currency_set, target_currency, start_date, end_date):
    fx_rates = get_usd_rub_prices_in_range(start_date, end_date)
    converted = []

    for ticker, date_, close, exchange, *_ in stock_prices:
        currency = currency_by_ticker[ticker]
        rate = fx_rates.get(str(date_))
        if target_currency == 'usd' and currency == 'SUR' and rate:
            close /= rate
        elif target_currency == 'rub' and currency == 'USD' and rate:
            close *= rate
        converted.append((ticker, date_, close, exchange))

    return converted


def _build_sets(stock_prices):
    exchange_set = set()
    currency_set = set()
    for row in stock_prices:
        exchange_set.add(row[3])
        currency_set.add(row[4].upper())
    return exchange_set, currency_set


def _get_available_month_starts(all_dates):
    month_starts = {}
    for d in all_dates:
        y, m = d[:4], d[5:7]
        key = f"{y}-{m}"
        if key not in month_starts:
            month_starts[key] = d
    return list(month_starts.values())


def _calculate_portfolio_history(dates, prices_dict, quantities):
    history = {}
    last_known_price = defaultdict(float)

    for date_ in dates:
        total = 0
        for ticker, qty in quantities.items():
            price = prices_dict.get(ticker, {}).get(date_)
            if price is not None:
                last_known_price[ticker] = price
            total += last_known_price[ticker] * qty  # используем последнюю известную цену
        history[date_] = total
    return history


def _remove_duplicates(stock_prices):
    seen = set()
    filtered = []
    for row in reversed(stock_prices):
        key = (row[0], row[1])
        if key not in seen:
            seen.add(key)
            filtered.append(row)
    return list(reversed(filtered))

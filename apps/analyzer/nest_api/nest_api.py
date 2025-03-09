import numpy as np
from database import engine
from sqlalchemy import text
from reports.utils.utils import calculate_returns_matrix

def get_portfolio_data(report_id, additional_tickers, start_date, end_date):
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

        # Получаем акции из портфеля ТОЛЬКО за нужный диапазон дат
        stock_prices = conn.execute(text("""
            SELECT sp.ticker, sp.date, sp.close
            FROM stock_prices sp
            JOIN portfolio_stock ps ON ps."stockId" = (SELECT id FROM stock WHERE ticker = sp.ticker)
            WHERE ps."portfolioId" = :portfolio_id
            AND sp.date BETWEEN :start_date AND :end_date
            ORDER BY sp.date ASC
        """), {"portfolio_id": portfolio_id, "start_date": start_date, "end_date": end_date}).fetchall()

        if not stock_prices and not additional_tickers:
            return None

        # Добавляем дополнительные тикеры (в том же диапазоне)
        if additional_tickers:
            additional_prices = conn.execute(text("""
                SELECT sp.ticker, sp.date, sp.close
                FROM stock_prices sp
                WHERE sp.ticker IN :additional_tickers
                AND sp.date BETWEEN :start_date AND :end_date
                ORDER BY sp.date ASC
            """), {"additional_tickers": tuple(additional_tickers), "start_date": start_date, "end_date": end_date}).fetchall()

            stock_prices.extend(additional_prices)

        # Преобразуем данные в нужный формат
        prices_dict = {}
        for row in stock_prices:
            ticker, date, close = row
            if ticker not in prices_dict:
                prices_dict[ticker] = []
            prices_dict[ticker].append(close)

        # Вычисляем доходности
        tickers = list(prices_dict.keys())
        returns_matrix = calculate_returns_matrix(stock_prices, tickers)

        return {
            "tickers": tickers,
            "returns": returns_matrix,
            "risk_free_rate": 0.04,  # Фиксируем безрисковую ставку
        }


def get_market_returns(start_date: str, end_date: str, ticker="SPY"):
    """
    Получает дневные доходности рыночного индекса (например, SPY) из базы данных.
    :param start_date: Начальная дата (YYYY-MM-DD)
    :param end_date: Конечная дата (YYYY-MM-DD)
    :param ticker: Тикер рыночного индекса (по умолчанию SPY)
    :return: numpy массив доходностей (N дней)
    """
    with engine.connect() as conn:
        stock_prices = conn.execute(text("""
            SELECT date, close FROM stock_prices
            WHERE ticker = :ticker
            AND date BETWEEN :start_date AND :end_date
            ORDER BY date ASC
        """), {"ticker": ticker, "start_date": start_date, "end_date": end_date}).fetchall()

    if not stock_prices:
        raise ValueError(f"Нет данных по {ticker} за период {start_date} - {end_date}")

    closes = [row[1] for row in stock_prices]  # Берем только цены закрытия

    # Вычисляем логарифмические доходности
    returns = np.diff(np.log(closes))  # log(P_t / P_t-1)

    return returns


import pandas_market_calendars as mcal

def get_portfolio_data_with_history(report_id, additional_tickers, start_date, end_date):
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

        # Получаем количество акций в портфеле
        quantities_result = conn.execute(text("""
            SELECT s.ticker, ps.quantity
            FROM portfolio_stock ps
            JOIN stock s ON ps."stockId" = s.id
            WHERE ps."portfolioId" = :portfolio_id
        """), {"portfolio_id": portfolio_id}).fetchall()

        # Преобразуем в словарь {ticker: quantity}
        quantities = {row[0]: row[1] for row in quantities_result}

        # Получаем исторические цены акций
        stock_prices = conn.execute(text("""
            SELECT sp.ticker, sp.date, sp.close
            FROM stock_prices sp
            JOIN portfolio_stock ps ON ps."stockId" = (SELECT id FROM stock WHERE ticker = sp.ticker)
            WHERE ps."portfolioId" = :portfolio_id
            AND sp.date BETWEEN :start_date AND :end_date
            ORDER BY sp.date ASC
        """), {"portfolio_id": portfolio_id, "start_date": start_date, "end_date": end_date}).fetchall()

        if not stock_prices and not additional_tickers:
            return None

        # Добавляем дополнительные тикеры
        if additional_tickers:
            additional_prices = conn.execute(text("""
                SELECT sp.ticker, sp.date, sp.close
                FROM stock_prices sp
                WHERE sp.ticker IN :additional_tickers
                AND sp.date BETWEEN :start_date AND :end_date
                ORDER BY sp.date ASC
            """), {"additional_tickers": tuple(additional_tickers), "start_date": start_date, "end_date": end_date}).fetchall()

            stock_prices.extend(additional_prices)

        # Преобразуем данные в словарь {ticker: {date: price}}
        prices_dict = {}
        for row in stock_prices:
            ticker, date, close = row
            if ticker not in prices_dict:
                prices_dict[ticker] = {}
            prices_dict[ticker][str(date)] = close

        # Определяем первый рабочий день каждого месяца
        nyse = mcal.get_calendar("NYSE")
        all_dates = sorted(set(date for ticker_data in prices_dict.values() for date in ticker_data))
        start_year, start_month = int(all_dates[0][:4]), int(all_dates[0][5:7])
        end_year, end_month = int(all_dates[-1][:4]), int(all_dates[-1][5:7])

        first_business_days = []
        for year in range(start_year, end_year + 1):
            for month in range(1, 13):
                if year == start_year and month < start_month:
                    continue
                if year == end_year and month > end_month:
                    break
                first_of_month = f"{year}-{month:02d}-01"
                schedule = nyse.valid_days(start_date=first_of_month, end_date=f"{year}-{month:02d}-07")
                if len(schedule) > 0:
                    first_business_days.append(str(schedule[0].date()))

        # Рассчитываем историческую стоимость портфеля только для первых рабочих дней месяца
        portfolio_history = {}
        for date in first_business_days:
            total_value = 0
            for ticker, quantity in quantities.items():
                price = prices_dict.get(ticker, {}).get(date, 0)
                total_value += price * quantity
            portfolio_history[date] = total_value

        # Вычисляем доходности
        tickers = list(prices_dict.keys())
        returns_matrix = calculate_returns_matrix(stock_prices, tickers)

        # Получаем последние доступные цены для каждой акции
        last_prices = {ticker: max(prices_dict[ticker].values()) for ticker in tickers if prices_dict[ticker]}


        return {
            "tickers": tickers,
            "returns": returns_matrix,
            "quantities": quantities,
            "last_prices": last_prices,
            "portfolio_history": portfolio_history,
            "risk_free_rate": 0.04,
        }

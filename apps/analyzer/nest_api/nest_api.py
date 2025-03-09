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
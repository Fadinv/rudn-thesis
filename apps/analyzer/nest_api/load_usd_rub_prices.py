from database import engine
from sqlalchemy import text
from datetime import date
from reports.utils.utils import fill_missing_fx_rates

# Кеш для хранения данных
_cached_usd_rub_prices = None

def load_usd_rub_prices() -> dict[str, float]:
    """Загружает и кеширует данные по USD/RUB с автозаполнением пропущенных дат."""
    global _cached_usd_rub_prices

    if _cached_usd_rub_prices is not None:
        return _cached_usd_rub_prices

    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT date, close
            FROM stock_prices
            WHERE ticker = 'C:USDRUB'
            ORDER BY date ASC
        """)).fetchall()

    raw_data = {
        row[0].isoformat(): row[1] for row in result if row[1] is not None
    }

    _cached_usd_rub_prices = fill_missing_fx_rates(raw_data)
    return _cached_usd_rub_prices


def get_usd_rub_prices_in_range(start_date: str, end_date: str) -> dict[str, float]:
    """Возвращает данные по USD/RUB за указанный диапазон, с заполнением пропущенных дат."""
    fx_data = load_usd_rub_prices()

    start = date.fromisoformat(start_date)
    end = date.fromisoformat(end_date)

    filtered = {
        d: fx_data[d]
        for d in fx_data
        if start <= date.fromisoformat(d) <= end
    }

    return filtered
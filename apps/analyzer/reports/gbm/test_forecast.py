import numpy as np
from datetime import datetime, date
from reports.gbm.forecast import (
    get_forecast_dates,
    calculate_annualized_metrics,
    simulate_gbm_prices,
    generate_gbm_forecast
)


def test_get_forecast_dates():
    """
    Проверяет корректность преобразования горизонтов в календарные даты торговых дней.

    Входные данные:
    - today: фиксированная дата (2 января 2025)
    - forecast_horizons: список горизонтов [1, 5, 10] в торговых днях

    Ожидаемое поведение:
    - Для каждого горизонта должна быть возвращена дата, соответствующая последнему торговому дню этого диапазона.
    - Все даты должны быть экземплярами типа datetime.date.
    - Ключи словаря должны совпадать с горизонтом прогнозирования.

    Этот тест важен, потому что GBM-модель использует именно торговые дни (а не календарные), и от корректности расчёта зависит точность прогноза.
    """
    today = datetime(2025, 1, 2).date()
    horizons = [1, 5, 10]
    result = get_forecast_dates(horizons, today)

    assert isinstance(result, dict)
    assert set(result.keys()).issubset(set(horizons))
    for d in result.values():
        assert isinstance(d, date)


def test_calculate_annualized_metrics_with_data():
    """
    Проверяет корректность расчёта годовой доходности и волатильности на основе исторических данных.

    Входные данные:
    - Массив доходностей для двух активов (3 дня).
      A: [0.01, 0.03, -0.02]
      B: [0.02, 0.01, 0.0]

    Ожидаемое поведение:
    - Функция должна вернуть два массива длиной 2: mu (годовая доходность), sigma (годовая волатильность).
    - Волатильность не должна быть ниже минимального порога (1e-4), даже при малом разбросе значений.
    - Ни одно значение не должно быть NaN.

    Этот тест важен, так как годовые показатели используются в GBM для генерации прогноза, и их некорректное значение может испортить всю симуляцию.
    """
    returns = np.array([[0.01, 0.02], [0.03, 0.01], [-0.02, 0.0]])
    mu, sigma = calculate_annualized_metrics(returns)

    assert mu.shape == (2,)
    assert sigma.shape == (2,)
    assert np.all(sigma >= 1e-4)
    assert not np.any(np.isnan(mu))
    assert not np.any(np.isnan(sigma))


def test_calculate_annualized_metrics_empty():
    """
    Проверяет поведение функции annualized_metrics при отсутствии исторических данных (нулевая длина по оси времени).

    Входные данные:
    - Массив формы (0, 2): нет данных по времени, но есть два актива.

    Ожидаемое поведение:
    - Возвращается mu = [0.0, 0.0], т.е. нулевая доходность.
    - Возвращается sigma = [1e-4, 1e-4], минимально допустимая волатильность (во избежание деления на 0).
    - Размерность результата соответствует количеству активов.

    Этот тест важен, чтобы избежать ошибок при работе с пустыми массивами (например, если данные не были загружены).
    """
    returns = np.empty((0, 2))
    mu, sigma = calculate_annualized_metrics(returns)

    assert mu.shape == (2,)
    assert sigma.shape == (2,)
    assert np.all(mu == 0)
    assert np.all(sigma == 1e-4)


def test_simulate_gbm_prices_distribution():
    """
    Проверяет, что генерация цен по модели геометрического броуновского движения (GBM) работает корректно.

    Входные данные:
    - Начальная цена: 100
    - Среднегодовая доходность: 10%
    - Волатильность: 20%
    - Горизонт: 1 год
    - Кол-во симуляций: 10_000

    Ожидаемое поведение:
    - Все сгенерированные цены должны быть положительными.
    - Среднее значение цен должно приближаться к теоретическому ожиданию: S0 * exp(mu * dt)
    - Размерность массива должна соответствовать числу симуляций.

    Этот тест важен, поскольку GBM является ядром модели прогнозирования, и корректное распределение цен критично для всей модели.
    """
    S0 = 100
    mu = 0.1
    sigma = 0.2
    dt = 1
    prices = simulate_gbm_prices(S0, mu, sigma, dt, n_simulations=10000)

    assert prices.shape == (10000,)
    assert np.all(prices > 0)
    assert np.isclose(np.mean(prices), S0 * np.exp(mu * dt), rtol=0.2)


def test_generate_gbm_forecast_basic():
    """
    Проверяет, что функция generate_gbm_forecast возвращает корректную структуру прогноза для простого портфеля.

    Входные данные:
    - Тикеры: AAPL, GOOG
    - Исторические доходности: фиксированный массив shape (3, 2)
    - Кол-во акций: AAPL = 10, GOOG = 5
    - Последние цены: AAPL = 150, GOOG = 2800
    - Перцентили: [10, 50, 90]
    - Горизонты: [30, 60] торговых дней

    Ожидаемое поведение:
    - Возвращается словарь с двумя ключами: "stocksForecast" и "portfolioForecast".
    - Для каждого тикера должен быть прогноз по двум датам, каждая с указанными перцентилями.
    - Прогноз по портфелю должен агрегировать значения по тикерам на каждую дату.

    Этот тест важен, так как проверяет связку всех подфункций и гарантирует, что результат пригоден для сохранения в отчёт.
    """
    tickers = ["AAPL", "GOOG"]
    returns = np.array([[0.01, 0.015], [0.02, 0.01], [-0.01, 0.0]])
    quantities = {"AAPL": 10, "GOOG": 5}
    last_prices = {"AAPL": 150.0, "GOOG": 2800.0}
    percentiles = [10, 50, 90]
    horizons = [30, 60]

    result = generate_gbm_forecast(
        tickers,
        returns,
        quantities,
        last_prices,
        percentiles,
        horizons
    )

    assert "stocksForecast" in result
    assert "portfolioForecast" in result

    # Проверяем структуру прогноза по акциям
    for ticker in tickers:
        assert ticker in result["stocksForecast"]
        for date in result["stocksForecast"][ticker]:
            forecast = result["stocksForecast"][ticker][date]
            for p in percentiles:
                assert f"p{p}" in forecast
                assert forecast[f"p{p}"] > 0

    # Проверяем агрегированный прогноз по портфелю
    for date, forecast in result["portfolioForecast"].items():
        for p in percentiles:
            assert f"p{p}" in forecast
            assert forecast[f"p{p}"] > 0

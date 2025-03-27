import numpy as np
import pytest
from reports.markovitz.optimizer import (
    calculate_covariance_matrix,
    optimize_min_risk_portfolio,
    optimize_max_return_portfolio,
    generate_efficient_frontier,
    calculate_markowitz_efficient_frontier,
)

# Фикстура: тестовые данные
@pytest.fixture
def sample_data():
    """
    Генерирует случайные тестовые данные для портфельного анализа.

    Возвращает:
    - returns: матрица доходностей (100 дней × 3 актива)
    - tickers: список тикеров ['A', 'B', 'C']
    - mean_returns: средние доходности активов
    - cov_matrix: ковариационная матрица
    - bounds: ограничения на веса (от 0 до 1)
    - constraints: сумма весов = 1 (полная инвестиция)
    - risk_free_rate: безрисковая ставка (0.01)
    """
    np.random.seed(42)
    returns = np.random.randn(100, 3)
    tickers = ["A", "B", "C"]
    mean_returns = np.mean(returns, axis=0)
    cov_matrix = calculate_covariance_matrix(returns)
    bounds = tuple((0, 1) for _ in range(len(tickers)))
    constraints = [{'type': 'eq', 'fun': lambda w: np.sum(w) - 1}]
    risk_free_rate = 0.01
    return returns, tickers, mean_returns, cov_matrix, bounds, constraints, risk_free_rate


def test_calculate_covariance_matrix_shape(sample_data):
    """
    Тест: Проверяет форму и симметричность ковариационной матрицы.

    Что проверяется:
    - Размерность матрицы должна быть (N, N), где N — количество активов (в данном случае 3).
    - Матрица должна быть симметричной: cov[i][j] == cov[j][i].

    Входные данные:
    - returns: случайная матрица доходностей (100 дней × 3 актива), из фикстуры sample_data.
    """
    returns, *_ = sample_data
    cov = calculate_covariance_matrix(returns)

    # Проверка размерности
    assert cov.shape == (3, 3)

    # Проверка симметричности ковариационной матрицы
    assert np.allclose(cov, cov.T)


def test_optimize_min_risk_portfolio_output(sample_data):
    """
    Тест: Проверяет корректность результата функции optimize_min_risk_portfolio.

    Что проверяется:
    - В результате присутствует ключ "weights".
    - Сумма весов акций в портфеле должна быть равна 1 (условие полной инвестиции).
    - Риск (стандартное отклонение доходности портфеля) должен быть неотрицательным.

    Входные данные:
    - Средние доходности, ковариационная матрица, ограничения и тикеры из фикстуры sample_data.
    """
    _, tickers, mean, cov, bounds, constraints, _ = sample_data
    portfolio = optimize_min_risk_portfolio(mean, cov, bounds, constraints, tickers)

    # Проверка наличия ключа с весами
    assert "weights" in portfolio

    # Проверка суммы весов (должна быть ≈ 1)
    assert abs(sum(portfolio["weights"].values()) - 1) < 1e-6

    # Проверка неотрицательности риска
    assert portfolio["risk"] >= 0


def test_optimize_max_return_portfolio_output(sample_data):
    """
    Тест: Проверяет корректность результата функции optimize_max_return_portfolio.

    Что проверяется:
    - В результате присутствует ключ "weights".
    - Сумма весов акций в портфеле должна быть равна 1 (условие полной инвестиции).
    - Доходность портфеля должна быть отличной от нуля (для случайных данных).

    Входные данные:
    - Средние доходности, ковариационная матрица, ограничения и тикеры из фикстуры sample_data.
    """
    _, tickers, mean, cov, bounds, constraints, _ = sample_data
    portfolio = optimize_max_return_portfolio(mean, cov, bounds, constraints, tickers)

    # Проверка наличия ключа с весами
    assert "weights" in portfolio

    # Проверка суммы весов (должна быть ≈ 1)
    assert abs(sum(portfolio["weights"].values()) - 1) < 1e-6

    # Проверка, что доходность рассчитана и не равна нулю
    assert portfolio["return"] != 0


def test_generate_efficient_frontier_properties(sample_data):
    """
    Тест: Проверяет корректность генерации эффективной границы портфелей.

    Что проверяется:
    - Эффективная граница содержит хотя бы один портфель.
    - Каждый портфель содержит ключи "risk", "return" и "weights".
    - Сумма весов активов в каждом портфеле равна 1 (все средства инвестированы).

    Входные данные:
    - Средние доходности, ковариационная матрица, ограничения и тикеры из фикстуры sample_data.
    - Краевые значения риска берутся из портфелей с минимальным риском и максимальной доходностью.
    """
    _, tickers, mean, cov, bounds, constraints, rf = sample_data

    # Краевые портфели
    min_risk_portfolio = optimize_min_risk_portfolio(mean, cov, bounds, constraints, tickers)
    max_return_portfolio = optimize_max_return_portfolio(mean, cov, bounds, constraints, tickers)

    # Генерация эффективной границы по доходности (не по риску!)
    frontier = generate_efficient_frontier(
        mean, cov, tickers, rf,
        min_risk_portfolio["return"],
        max_return_portfolio["return"],
        10
    )

    # Проверки
    assert len(frontier) > 0
    assert all("risk" in p and "return" in p and "weights" in p for p in frontier)
    assert all(abs(sum(p["weights"].values()) - 1) < 1e-6 for p in frontier)


def test_efficient_frontier_is_sorted_and_valid():
    """
    Тест: Проверяет свойства эффективной границы:
    - Портфели отсортированы по доходности.
    - Портфели отсортированы по риску.
    - Вес активов в каждом портфеле суммируется до 1.
    """
    # Генерируем более стабильные данные: общая база + слабый шум
    rng = np.random.default_rng(42)
    base = rng.normal(0.001, 0.01, size=(100, 1))
    noise = rng.normal(0, 0.05, size=(100, 4))
    returns = base + noise

    tickers = ["X", "Y", "Z", "W"]
    rf = 0.04
    num_portfolios = 15

    frontier = calculate_markowitz_efficient_frontier(returns, tickers, rf, num_portfolios=num_portfolios)

    # Проверка: не меньше 3 портфелей (иначе мало смысла в анализе)
    assert len(frontier) >= 3, f"Получено слишком мало портфелей: {len(frontier)}"

    # Проверка: доходности не убывают
    returns_list = [p["return"] for p in frontier]
    assert all(earlier <= later + 1e-8 for earlier, later in zip(returns_list, returns_list[1:])), \
        "Доходности не отсортированы по возрастанию"

    # Проверка: риски не убывают
    risks_list = [p["risk"] for p in frontier]
    assert all(earlier <= later + 1e-8 for earlier, later in zip(risks_list, risks_list[1:])), \
        "Риски не отсортированы по возрастанию"

    # Проверка: веса нормализованы
    for p in frontier:
        total_weight = sum(p["weights"].values())
        assert np.isclose(total_weight, 1.0), f"Сумма весов портфеля != 1: {total_weight}"


def test_efficient_frontier_with_identical_assets():
    """
    Тест: Проверяет, что при наличии идентичных активов оптимизация даёт равномерное распределение весов.

    Условия:
    - Все активы имеют абсолютно одинаковые доходности.
    - Риск и доходность всех возможных портфелей одинаковы.

    Проверки:
    - Все веса примерно равны (0.33 на 3 актива).
    - Доходности и риски всех портфелей тоже одинаковы.
    """
    # Генерируем один временной ряд, копируем его 3 раза
    single_asset = np.random.randn(100)
    returns = np.stack([single_asset] * 3, axis=1)  # 3 идентичных актива
    tickers = ["AAA", "BBB", "CCC"]
    rf = 0.04
    num_portfolios = 5

    frontier = calculate_markowitz_efficient_frontier(returns, tickers, rf, num_portfolios=num_portfolios)

    for portfolio in frontier:
        weights = np.array(list(portfolio["weights"].values()))
        total_weight = weights.sum()

        # Проверка: сумма весов = 1
        assert np.isclose(total_weight, 1.0), f"Сумма весов {total_weight} != 1.0"

        # Проверка: веса примерно равны между собой (так как активы одинаковые)
        for i in range(1, len(weights)):
            assert np.isclose(weights[i], weights[i - 1], atol=0.05), \
                f"Веса не равны: {weights[i]} и {weights[i - 1]}"

    # Проверка: одинаковая доходность и риск
    first_return = frontier[0]["return"]
    first_risk = frontier[0]["risk"]

    for p in frontier[1:]:
        assert np.isclose(p["return"], first_return, atol=1e-6), "Доходности должны быть одинаковыми"
        assert np.isclose(p["risk"], first_risk, atol=1e-6), "Риски должны быть одинаковыми"


# Контролируемые данные для тестов
# Все доходности фиксированы и одинаковы по строкам (одинаковые периоды),
# что делает расчёты детерминированными и удобными для ручной проверки.
returns = np.array([
    [0.01, 0.02, 0.015],
    [0.01, 0.02, 0.015],
    [0.01, 0.02, 0.015],
    [0.01, 0.02, 0.015],
])
tickers = ["A", "B", "C"]
rf = 0.0  # Безрисковая ставка

def test_efficient_frontier_manual_case():
    """
    Тест проверяет корректность построения эффективной границы Марковица на контролируемых данных.

    Используются искусственные доходности:
    - Актив B всегда имеет наибольшую доходность (0.02),
    - Актив A — минимальную (0.01),
    - Актив C — среднюю (0.015),
    - Все ряды доходностей идентичны => ковариационная матрица нулевая (нулевой риск при любых весах).

    Проверяется:
    1. Наличие хотя бы двух портфелей в списке (минимум риска и максимум доходности).
    2. Первый портфель в списке должен иметь минимальный риск (≈ 0).
    3. Последний портфель должен быть полностью сосредоточен в активе B (максимум доходности),
       с доходностью 0.02 и нулевым риском.
    """
    frontier = calculate_markowitz_efficient_frontier(returns, tickers, rf, num_portfolios=3)

    assert len(frontier) >= 2, "Граница должна содержать хотя бы два портфеля"

    # Первый портфель — минимум риска, при полностью одинаковых доходностях риск должен быть ≈ 0
    assert frontier[0]["risk"] < 1e-6, "Риск минимального портфеля должен быть близок к нулю"

    # Последний портфель — максимум доходности, должен быть полностью в активе B
    max_return_portfolio = frontier[-1]
    assert max_return_portfolio["weights"]["B"] > 0.99, "Портфель максимальной доходности должен быть почти полностью в активе B"
    assert np.isclose(max_return_portfolio["return"], 0.02), "Доходность портфеля должна быть равна 0.02"
    assert np.isclose(max_return_portfolio["risk"], 0.0, atol=1e-6), "Риск при нулевой ковариации должен быть равен 0"


def test_min_risk_portfolio_zero_risk():
    """
    Проверяет, что портфель с минимальным риском действительно имеет риск, близкий к нулю,
    при условии, что все ряды доходностей идентичны.

    Входные данные:
    - Доходности активов одинаковы на каждом шаге времени, что означает полную корреляцию и нулевую дисперсию.
    - Ковариационная матрица будет состоять из нулей, а значит, любой портфель будет иметь нулевую волатильность.

    Ожидаемое поведение:
    - calculate_markowitz_efficient_frontier должен построить портфель с минимальным риском, у которого
      рассчитанный риск (стандартное отклонение) будет практически равен нулю.
    """
    frontier = calculate_markowitz_efficient_frontier(returns, tickers, rf, num_portfolios=3)
    min_risk_portfolio = frontier[0]

    assert min_risk_portfolio["risk"] < 1e-6, "Ожидается нулевой риск при полной корреляции активов"


def test_max_return_portfolio_single_asset_B():
    """
    Проверяет, что портфель с максимальной доходностью полностью сосредоточен в активе B,
    который имеет наибольшую доходность среди всех активов.

    Входные данные:
    - Актив B имеет доходность 0.02, тогда как A — 0.01, а C — 0.015.
    - Все ряды доходностей идентичны, следовательно, нет риска при любой комбинации активов.

    Ожидаемое поведение:
    - Портфель с максимальной доходностью должен состоять практически на 100% из актива B.
    - Общая доходность портфеля должна быть равна 0.02.
    - Риск (волатильность) должен быть близок к нулю, так как ковариационная матрица нулевая.
    """
    frontier = calculate_markowitz_efficient_frontier(returns, tickers, rf, num_portfolios=3)
    max_return_portfolio = frontier[-1]

    assert max_return_portfolio["weights"]["B"] > 0.99, "Максимально доходный портфель должен быть почти полностью в активе B"
    assert np.isclose(max_return_portfolio["return"], 0.02), "Доходность должна быть равна 0.02 (доходность актива B)"
    assert max_return_portfolio["risk"] < 1e-6, "Риск должен быть ≈ 0 при полной корреляции доходностей"


def test_frontier_sorted_by_return():
    """
    Проверяет, что портфели на эффективной границе отсортированы по возрастанию ожидаемой доходности.

    Входные данные:
    - Используются фиксированные доходности для трёх активов (A, B, C) и одинаковые значения во всех строках.
    - Доходность актива A = 0.01, C = 0.015, B = 0.02.

    Ожидаемое поведение:
    - calculate_markowitz_efficient_frontier должен вернуть список портфелей, отсортированных по доходности.
    - Каждый следующий портфель должен иметь доходность не меньше предыдущего.

    Эта проверка важна, так как корректное построение эффективной границы предполагает упорядоченность по доходности.
    """
    frontier = calculate_markowitz_efficient_frontier(returns, tickers, rf, num_portfolios=3)
    returns_list = [p["return"] for p in frontier]

    # Проверка монотонного возрастания доходности вдоль эффективной границы
    assert all(earlier <= later for earlier, later in zip(returns_list, returns_list[1:])), \
        "Портфели должны быть отсортированы по доходности в порядке возрастания"


def test_weights_sum_to_one():
    """
    Проверяет, что сумма весов активов в каждом портфеле на эффективной границе равна 1.

    Входные данные:
    - Искусственные доходности трёх активов с одинаковыми значениями по строкам.

    Ожидаемое поведение:
    - Каждый сгенерированный портфель должен представлять собой допустимое распределение активов,
      т.е. сумма всех весов должна быть равна 1 (100%).

    Эта проверка гарантирует корректность нормализации весов при построении эффективной границы.
    """
    frontier = calculate_markowitz_efficient_frontier(returns, tickers, rf, num_portfolios=3)

    for portfolio in frontier:
        total_weight = sum(portfolio["weights"].values())
        assert np.isclose(total_weight, 1.0), f"Weights sum = {total_weight}, expected 1.0"


def test_manual_portfolio_vs_computed():
    """
    Проверяет корректность расчёта доходности и риска портфеля:
    - сравниваются вручную посчитанные значения со значениями, полученными через функцию calculate_covariance_matrix.

    Описание:
    - Используются синтетические данные: доходности трёх активов за 4 периода.
    - Устанавливается фиксированный вектор весов активов.
    - Расчёт доходности производится двумя способами:
        1. Через скалярное произведение весов и среднего значения доходностей активов.
        2. Через построение временного ряда доходностей портфеля и взятие среднего.
    - Расчёт риска производится также двумя способами:
        1. Через ковариационную матрицу и формулу риска: sqrt(wᵗ Σ w)
        2. Через стандартное отклонение временного ряда доходностей портфеля.

    Ожидаемое поведение:
    - Оба способа расчёта доходности и риска должны давать совпадающие (или почти совпадающие) результаты.
    """

    # Доходности 3 активов за 4 дня
    returns = np.array([
        [0.01,  0.02,  0.03],
        [0.015, 0.018, 0.025],
        [0.012, 0.017, 0.02],
        [0.013, 0.016, 0.015]
    ])
    weights = np.array([0.5, 0.3, 0.2])  # Распределение капитала по активам

    # Средняя доходность каждого актива
    mean_returns = np.mean(returns, axis=0)

    # Доходность портфеля через скалярное произведение весов и средних доходностей
    manual_expected_return = np.dot(weights, mean_returns)

    # Ковариационная матрица и расчёт риска через неё
    computed_cov = calculate_covariance_matrix(returns, method="standard")
    computed_risk = np.sqrt(np.dot(weights.T, np.dot(computed_cov, weights)))

    # Портфельный временной ряд доходностей
    portfolio_returns = np.dot(returns, weights)

    # Доходность и риск через среднее и стандартное отклонение портфельных доходностей
    manual_avg_return = np.mean(portfolio_returns)
    manual_std_dev = np.std(portfolio_returns, ddof=1)

    # Сравнение результатов
    assert np.isclose(manual_expected_return, manual_avg_return, atol=1e-8), \
        "Доходность: ожидание и фактическое среднее не совпадают"
    assert np.isclose(computed_risk, manual_std_dev, atol=1e-6), \
        "Риск: расчёт через ковариационную матрицу не совпадает со std(portfolio)"


def test_max_return_known_solution():
    """
    Проверяет, что оптимизация портфеля на максимальную доходность
    возвращает 100% веса в актив с наибольшей доходностью.

    Входные данные:
    - Доходности заданы явно: актив C всегда имеет доходность 0.03, B — 0.02, A — 0.01.
    - Данные одинаковы в каждом периоде, значит, ковариация = 0, риска нет.

    Ожидаемое поведение:
    - Портфель с максимальной доходностью должен состоять почти полностью из актива C.
    - Доходность портфеля должна быть равна 0.03.
    """
    returns = np.array([
        [0.01, 0.02, 0.03],
        [0.01, 0.02, 0.03],
    ])
    tickers = ["A", "B", "C"]
    mean_returns = np.mean(returns, axis=0)  # [0.01, 0.02, 0.03]
    cov = calculate_covariance_matrix(returns, method="standard")
    bounds = tuple((0, 1) for _ in tickers)
    constraints = [{'type': 'eq', 'fun': lambda w: np.sum(w) - 1}]

    portfolio = optimize_max_return_portfolio(mean_returns, cov, bounds, constraints, tickers)

    assert portfolio["weights"]["C"] > 0.99, "Почти весь вес должен быть в активе C с максимальной доходностью"
    assert np.isclose(portfolio["return"], 0.03), "Доходность портфеля должна быть равна 0.03"

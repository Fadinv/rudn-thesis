import numpy as np
from scipy.optimize import minimize
from sklearn.covariance import LedoitWolf
from typing import Literal

def calculate_covariance_matrix(
    returns: np.ndarray,
    method: Literal["standard", "ledoit"] = "ledoit"
) -> np.ndarray:
    """
    Расчёт ковариационной матрицы:
    - 'ledoit': сглаженная оценка Ledoit-Wolf (по умолчанию)
    - 'standard': классическая ковариация через np.cov
    """
    if method == "standard":
        return np.cov(returns.T)  # Транспонируем, потому что np.cov ожидает features в строках
    elif method == "ledoit":
        return LedoitWolf().fit(returns).covariance_
    else:
        raise ValueError("method должен быть 'standard' или 'ledoit'")

def optimize_min_risk_portfolio(mean_returns, cov_matrix, bounds, constraints, tickers):
    """Оптимизация портфеля с минимальным риском."""
    def min_risk_objective(weights):
        return np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))

    result = minimize(min_risk_objective, np.ones(len(tickers)) / len(tickers), bounds=bounds, constraints=constraints)
    return {
        "risk": np.sqrt(np.dot(result.x.T, np.dot(cov_matrix, result.x))),
        "return": np.dot(result.x, mean_returns),
        "weights": dict(zip(tickers, result.x.tolist()))
    }

def optimize_max_return_portfolio(mean_returns, cov_matrix, bounds, constraints, tickers):
    """Оптимизация портфеля с максимальной доходностью."""
    def max_return_objective(weights):
        return -np.dot(weights, mean_returns)

    result = minimize(max_return_objective, np.ones(len(tickers)) / len(tickers), bounds=bounds, constraints=constraints)
    return {
        "risk": np.sqrt(np.dot(result.x.T, np.dot(cov_matrix, result.x))),
        "return": np.dot(result.x, mean_returns),
        "weights": dict(zip(tickers, result.x.tolist()))
    }

def generate_efficient_frontier(mean_returns, cov_matrix, tickers, risk_free_rate, min_ret, max_ret, num_portfolios):
    """
    Генерация эффективной границы по фиксированной доходности:
    - минимизируем риск
    - при заданной доходности (target_return)
    """

    bounds = tuple((0, 1) for _ in tickers)
    efficient_frontier = []

    target_returns = np.linspace(min_ret, max_ret, num_portfolios)

    for target_return in target_returns:
        initial_weights = np.ones(len(tickers)) / len(tickers)

        def portfolio_volatility(weights):
            return np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))

        constraints = [
            {'type': 'eq', 'fun': lambda w: np.sum(w) - 1},
            {'type': 'eq', 'fun': lambda w: np.dot(w, mean_returns) - target_return}
        ]

        result = minimize(portfolio_volatility, initial_weights, bounds=bounds, constraints=constraints, method='SLSQP')

        print('result.success = ', result.success)
        if result.success:
            weights = result.x
            risk = portfolio_volatility(weights)
            sharpe = (target_return - risk_free_rate) / risk if risk > 0 else 0

            efficient_frontier.append({
                "risk": risk,
                "return": target_return,
                "sharpe_ratio": sharpe,
                "weights": dict(zip(tickers, weights.tolist()))
            })

    efficient_frontier.sort(key=lambda x: x["return"])
    return efficient_frontier


def calculate_markowitz_efficient_frontier(
    returns: np.ndarray,
    tickers: list[str],
    risk_free_rate: float,
    num_portfolios: int = 20,
    cov_method: Literal["standard", "ledoit"] = "ledoit"
) -> list[dict]:
    """
    Полная реализация эффективной границы с учетом:
    - Безрисковой ставки
    - Методики оценки ковариационной матрицы
    - Количества портфелей

    :param returns: np.ndarray — матрица доходностей
    :param tickers: список тикеров активов
    :param risk_free_rate: безрисковая ставка (годовая)
    :param num_portfolios: количество портфелей на границе (включая граничные)
    :param cov_method: метод оценки ковариации: 'standard' или 'ledoit'
    """
    mean_returns = np.mean(returns, axis=0)
    cov_matrix = calculate_covariance_matrix(returns, method=cov_method)

    bounds = tuple((0, 1) for _ in tickers)
    constraints = [{'type': 'eq', 'fun': lambda w: np.sum(w) - 1}]

    # 1. Граничные портфели
    min_risk_portfolio = optimize_min_risk_portfolio(mean_returns, cov_matrix, bounds, constraints, tickers)
    max_return_portfolio = optimize_max_return_portfolio(mean_returns, cov_matrix, bounds, constraints, tickers)

    min_ret = min_risk_portfolio["return"]
    max_ret = max_return_portfolio["return"]
    print(min_risk_portfolio, max_return_portfolio, mean_returns, cov_matrix, tickers, risk_free_rate, min_ret, max_ret, num_portfolios)

    # 2. Генерация промежуточных портфелей
    intermediate_frontier = generate_efficient_frontier(
        mean_returns=mean_returns,
        cov_matrix=cov_matrix,
        tickers=tickers,
        risk_free_rate=risk_free_rate,
        min_ret=min_ret,
        max_ret=max_ret,
        num_portfolios=num_portfolios - 1  # исключаем крайние
    )

    # 3. Финальный список портфелей
    efficient_frontier = [min_risk_portfolio] + intermediate_frontier

    return efficient_frontier

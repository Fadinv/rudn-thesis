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

def generate_efficient_frontier(mean_returns, cov_matrix, tickers, risk_free_rate, min_risk, max_risk, num_portfolios):
    """Генерация эффективной границы портфелей."""
    bounds = tuple((0, 1) for _ in tickers)
    target_risks = np.linspace(min_risk, max_risk, num_portfolios + 2)[1:-1]
    efficient_frontier = []
    prev_return = float('-inf')

    print(target_risks)
    print(len(target_risks))
    for target_risk in target_risks:
        initial_weights = np.ones(len(tickers)) / len(tickers)

        def sharpe_objective(weights):
            port_return = np.dot(weights, mean_returns)
            port_volatility = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
            return -((port_return - risk_free_rate) / port_volatility)

        constraints = [
            {'type': 'eq', 'fun': lambda w: np.sum(w) - 1},
            {'type': 'eq', 'fun': lambda w: np.sqrt(np.dot(w.T, np.dot(cov_matrix, w))) - target_risk}
        ]

        result = minimize(sharpe_objective, initial_weights, bounds=bounds, constraints=constraints)

        if result.success:
            port_return = np.dot(result.x, mean_returns)
            port_volatility = np.sqrt(np.dot(result.x.T, np.dot(cov_matrix, result.x)))
            sharpe_ratio = (port_return - risk_free_rate) / port_volatility if port_volatility > 0 else 0

            if port_volatility > max_risk and port_return < mean_returns.max():
                continue
            print(port_return, prev_return, target_risk)

            efficient_frontier.append({
                "risk": port_volatility,
                "return": port_return,
                "sharpe_ratio": sharpe_ratio,
                "weights": dict(zip(tickers, result.x.tolist()))
            })
            prev_return = port_return

    efficient_frontier.sort(key=lambda x: x["return"])
    return efficient_frontier

def calculate_markowitz_efficient_frontier(
    returns: np.ndarray,
    tickers: list,
    risk_free_rate: float,
    num_portfolios: int = 20
):
    """Полная реализация эффективной границы с крайними портфелями"""
    mean_returns = np.mean(returns, axis=0)
    cov_matrix = calculate_covariance_matrix(returns)

    bounds = tuple((0, 1) for _ in range(len(tickers)))
    constraints = [{'type': 'eq', 'fun': lambda w: np.sum(w) - 1}]

    # 1. Граничные портфели
    min_risk_portfolio = optimize_min_risk_portfolio(mean_returns, cov_matrix, bounds, constraints, tickers)
    max_return_portfolio = optimize_max_return_portfolio(mean_returns, cov_matrix, bounds, constraints, tickers)

    min_risk = min_risk_portfolio["risk"]
    max_risk = max_return_portfolio["risk"]

    # 2. Строим промежуточные портфели
    intermediate_frontier = generate_efficient_frontier(
        mean_returns,
        cov_matrix,
        tickers,
        risk_free_rate,
        min_risk,
        max_risk,
        num_portfolios=num_portfolios - 2  # исключаем 2 крайних, которые мы уже посчитали
    )

    # 3. Собираем финальный список
    efficient_frontier = [min_risk_portfolio] + intermediate_frontier + [max_return_portfolio]
    return efficient_frontier

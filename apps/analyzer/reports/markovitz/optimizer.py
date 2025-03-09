import numpy as np
from scipy.optimize import minimize
from sklearn.covariance import LedoitWolf
from .risk_metrics import calculate_sortino_ratio, calculate_beta

def calculate_markowitz_efficient_frontier(returns: np.ndarray, tickers: list, risk_free_rate: float, num_portfolios: int = 20):
    """Выполняет оптимизацию портфеля по модели Марковица с улучшенным фильтром неэффективных портфелей."""
    n_assets = returns.shape[1]
    mean_returns = np.mean(returns, axis=0)
    cov_matrix = LedoitWolf().fit(returns).covariance_

    # 1️⃣ Находим портфель с минимальным риском
    def min_risk_objective(weights):
        return np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))

    constraints = [{'type': 'eq', 'fun': lambda w: np.sum(w) - 1}]
    bounds = tuple((0, 1) for _ in range(n_assets))

    result_min_risk = minimize(min_risk_objective, np.ones(n_assets) / n_assets, bounds=bounds, constraints=constraints)

    min_risk_portfolio = {
        "risk": np.sqrt(np.dot(result_min_risk.x.T, np.dot(cov_matrix, result_min_risk.x))),
        "return": np.dot(result_min_risk.x, mean_returns),
        "weights": dict(zip(tickers, result_min_risk.x.tolist()))
    }

    # 2️⃣ Находим портфель с максимальной доходностью
    def max_return_objective(weights):
        return -np.dot(weights, mean_returns)  # Максимизируем доходность (отрицательный знак для минимизации)

    result_max_return = minimize(max_return_objective, np.ones(n_assets) / n_assets, bounds=bounds, constraints=constraints)

    max_return_portfolio = {
        "risk": np.sqrt(np.dot(result_max_return.x.T, np.dot(cov_matrix, result_max_return.x))),
        "return": np.dot(result_max_return.x, mean_returns),
        "weights": dict(zip(tickers, result_max_return.x.tolist()))
    }

    # 3️⃣ Строим эффективную границу, но исключаем неэффективные портфели
    min_risk = min_risk_portfolio["risk"]
    max_risk = max_return_portfolio["risk"]

    # Создаем более точную сетку уровней риска
    target_risks = np.linspace(min_risk, max_risk, num_portfolios)

    efficient_frontier = []
    prev_return = float('-inf')

    for target_risk in target_risks:
        initial_weights = np.ones(n_assets) / n_assets

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

            # ❌ Отбрасываем портфели, если их риск выше max_risk, но доходность ниже max_return
            if port_volatility > max_return_portfolio["risk"] and port_return < max_return_portfolio["return"]:
                continue

            # 🔥 Оставляем только растущие доходности
            if port_return > prev_return:
                efficient_frontier.append({
                    "risk": port_volatility,
                    "return": port_return,
                    "sharpe_ratio": sharpe_ratio,
                    "weights": dict(zip(tickers, result.x.tolist()))
                })
                prev_return = port_return

    # 4️⃣ Сортируем портфели по доходности перед возвратом
    efficient_frontier.sort(key=lambda x: x["return"])

    return efficient_frontier

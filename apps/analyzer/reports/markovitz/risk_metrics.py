import numpy as np

def calculate_sortino_ratio(portfolio_returns: np.ndarray, portfolio_weights: np.ndarray, risk_free_rate=0.04):
    """
    Рассчитывает коэффициент Sortino для конкретного портфеля.
    """
    daily_risk_free_rate = risk_free_rate / 252

    weighted_returns = np.dot(portfolio_returns, portfolio_weights)
    avg_daily_return = np.mean(weighted_returns)

    negative_returns = weighted_returns[weighted_returns < 0]
    downside_risk_daily = np.std(negative_returns) if negative_returns.size > 0 else 0
    downside_risk_annual = downside_risk_daily * np.sqrt(252)

    sortino_ratio_daily = (avg_daily_return - daily_risk_free_rate) / downside_risk_daily if downside_risk_daily > 0 else 0
    sortino_ratio_annual = (np.power(1 + avg_daily_return, 252) - 1 - risk_free_rate) / downside_risk_annual if downside_risk_annual > 0 else 0

    return sortino_ratio_daily, sortino_ratio_annual


def calculate_beta(portfolio_returns: np.ndarray, market_returns: np.ndarray, weights: np.ndarray):
    """
    Рассчитывает средневзвешенный коэффициент Beta портфеля.
    """
    asset_betas = []

    for i in range(portfolio_returns.shape[1]):
        cov_matrix = np.cov(portfolio_returns[:, i], market_returns)
        beta_i = cov_matrix[0, 1] / cov_matrix[1, 1]
        asset_betas.append(beta_i)

    asset_betas = np.array(asset_betas)
    portfolio_beta = np.dot(weights, asset_betas)

    return portfolio_beta

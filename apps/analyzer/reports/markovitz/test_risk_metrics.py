import numpy as np
from reports.markovitz.risk_metrics import calculate_sortino_ratio, calculate_beta

def test_sortino_ratio_known_values():
    # 5 дней доходностей для 2 активов
    returns = np.array([
        [0.01, 0.02],
        [0.01, -0.03],
        [0.01, 0.04],
        [0.01, -0.01],
        [0.01, 0.03]
    ])

    # равные веса
    weights = np.array([0.5, 0.5])

    # вручную считаем среднюю доходность портфеля
    weighted_returns = np.dot(returns, weights)  # [0.015, -0.01, 0.025, 0.0, 0.02]
    avg_return = np.mean(weighted_returns)       # (0.015 - 0.01 + 0.025 + 0.0 + 0.02) / 5

    downside_returns = weighted_returns[weighted_returns < 0]  # [-0.01]
    downside_std = np.std(downside_returns) if len(downside_returns) > 0 else 0

    risk_free_rate = 0.04
    daily_risk_free_rate = risk_free_rate / 252
    # ожидаемое значение Sortino (дневное)
    expected_sortino_daily = (avg_return - daily_risk_free_rate) / downside_std if downside_std > 0 else 0

    sortino_daily, _ = calculate_sortino_ratio(returns, weights, risk_free_rate=0.04)

    assert np.isclose(sortino_daily, expected_sortino_daily, atol=1e-6)

def test_calculate_sortino_ratio_known_data():
    returns = np.array([
        [0.01],
        [-0.02],
        [0.03],
        [-0.01],
        [0.02]
    ])
    weights = np.array([1.0])
    risk_free_rate = 0.04

    weighted_returns = returns.flatten()
    avg_return = np.mean(weighted_returns)
    downside = weighted_returns[weighted_returns < 0]
    downside_std = np.std(downside)
    daily_rfr = risk_free_rate / 252

    expected_daily = (avg_return - daily_rfr) / downside_std
    expected_annual = ((1 + avg_return)**252 - 1 - risk_free_rate) / (downside_std * np.sqrt(252))

    actual_daily, actual_annual = calculate_sortino_ratio(returns, weights, risk_free_rate)

    assert np.isclose(actual_daily, expected_daily, atol=1e-6)
    assert np.isclose(actual_annual, expected_annual, atol=1e-6)

def test_calculate_beta_known_data():
    portfolio_returns = np.array([
        [0.01, 0.02],
        [0.02, 0.03],
        [-0.01, -0.02],
        [0.0, 0.01],
        [0.01, -0.01]
    ])
    market_returns = np.array([0.015, 0.025, -0.015, 0.005, 0.0])
    weights = np.array([0.5, 0.5])

    # 💡 Важно! Используем те же настройки np.cov как в основной функции (ddof=1)
    betas = []
    for i in range(portfolio_returns.shape[1]):
        cov = np.cov(portfolio_returns[:, i], market_returns, ddof=1)
        beta_i = cov[0, 1] / cov[1, 1]
        betas.append(beta_i)

    expected_beta = np.dot(weights, betas)
    actual_beta = calculate_beta(portfolio_returns, market_returns, weights)

    assert np.isclose(actual_beta, expected_beta, atol=1e-6)

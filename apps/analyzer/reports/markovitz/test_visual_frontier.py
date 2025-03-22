import os
import numpy as np
import matplotlib.pyplot as plt
from reports.markovitz.optimizer import calculate_markowitz_efficient_frontier

def test_plot_efficient_frontier():
    """
    Визуальный тест — построение эффективной границы на синтетических данных.
    """
    # Синтетические данные
    np.random.seed(42)
    base = np.random.normal(0.001, 0.01, size=(100, 1))
    noise = np.random.normal(0, 0.005, size=(100, 3))
    returns = base + noise
    tickers = ["A", "B", "C"]
    rf = 0.01

    # Генерация эффективной границы
    frontier = calculate_markowitz_efficient_frontier(returns, tickers, rf, num_portfolios=50)

    risks = [p["risk"] for p in frontier]
    returns_ = [p["return"] for p in frontier]

    # ✅ Создаём папку, если её нет
    os.makedirs("test_output", exist_ok=True)

    # 📊 Построение графика
    plt.figure(figsize=(8, 5))
    plt.plot(risks, returns_, marker='o', linestyle='-', color='blue', label="Efficient Frontier")
    plt.xlabel("Риск (std)")
    plt.ylabel("Доходность")
    plt.title("Визуальный тест: Эффективная граница")
    plt.grid(True)
    plt.legend()
    plt.tight_layout()
    plt.savefig("test_output/efficient_frontier.png")
    print("✅ График сохранён: test_output/efficient_frontier.png")

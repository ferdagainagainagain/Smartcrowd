import numpy as np
import pandas as pd
from sklearn.linear_model import RANSACRegressor, LinearRegression

# Log-Normal Shadowing Path Loss Optimization (RANSAC)
# Model: RSSI = -10 * n * log10(d) + A

DATASET_PATH = "data/room_rssi_measurements.csv"
RSSI_COLUMNS = ["AP1RSSI", "AP2RSSI", "AP3RSSI"]


# Load dataset

df = pd.read_csv(DATASET_PATH)

# Filter invalid distances
df = df[df["distance_m"] > 0].copy()

# Linearized feature
X = np.log10(df["distance_m"].values).reshape(-1, 1)


# RANSAC optimization per AP

results = {}

for ap in RSSI_COLUMNS:
    y = df[ap].values

    ransac = RANSACRegressor(
        estimator=LinearRegression(),
        min_samples=0.5,
        residual_threshold=3.0,
        max_trials=1000,
        random_state=42
    )

    ransac.fit(X, y)

    m = ransac.estimator_.coef_[0]
    c = ransac.estimator_.intercept_

    n = -m / 10
    A = c

    results[ap] = {"A": A, "n": n}

# Output optimal parameters 

for ap, params in results.items():
    print(f"{ap}: A = {params['A']:.4f}, n = {params['n']:.4f}")

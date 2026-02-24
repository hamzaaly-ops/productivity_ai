from __future__ import annotations

from statistics import mean, pstdev


def _zscore_fallback(values: list[float]) -> tuple[bool, float]:
    if len(values) < 3:
        return False, 0.0

    baseline = values[:-1]
    current = values[-1]
    baseline_mean = mean(baseline)
    baseline_std = pstdev(baseline)
    if baseline_std == 0:
        return False, 0.0
    zscore = (current - baseline_mean) / baseline_std
    return abs(zscore) >= 2.0, zscore


def detect_anomaly(feature_history: list[dict[str, float]], lookback_days: int) -> dict[str, object]:
    if len(feature_history) < 3:
        return {
            "is_anomaly": False,
            "method": "insufficient_data",
            "anomaly_score": 0.0,
            "details": "Need at least 3 daily vectors.",
            "lookback_days": lookback_days,
        }

    ordered_keys = [
        "deep_work_norm",
        "engagement_norm",
        "task_completion_norm",
        "switch_norm",
        "isolation_rate",
    ]
    matrix = [
        [float(day.get(key, 0.0)) for key in ordered_keys]
        for day in feature_history
    ]

    try:
        from sklearn.ensemble import IsolationForest

        if len(matrix) < 7:
            raise ValueError("Need at least 7 daily vectors for IsolationForest.")

        model = IsolationForest(contamination=0.15, random_state=42)
        model.fit(matrix[:-1])
        prediction = int(model.predict([matrix[-1]])[0])
        decision_score = float(model.decision_function([matrix[-1]])[0])

        return {
            "is_anomaly": prediction == -1,
            "method": "isolation_forest",
            "anomaly_score": round(decision_score, 4),
            "details": "Lower decision score means more anomalous behavior.",
            "lookback_days": lookback_days,
        }
    except Exception:
        score_values = [float(day.get("productivity_score", 0.0)) for day in feature_history]
        is_anomaly, zscore = _zscore_fallback(score_values)
        return {
            "is_anomaly": is_anomaly,
            "method": "zscore_fallback",
            "anomaly_score": round(zscore, 4),
            "details": "Fallback used due to limited history or unavailable sklearn.",
            "lookback_days": lookback_days,
        }

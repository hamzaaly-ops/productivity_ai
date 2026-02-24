from __future__ import annotations

from statistics import mean


def _linear_slope(values: list[float]) -> float:
    n = len(values)
    if n < 2:
        return 0.0
    x_values = list(range(n))
    x_mean = mean(x_values)
    y_mean = mean(values)
    numerator = sum((x - x_mean) * (y - y_mean) for x, y in zip(x_values, values))
    denominator = sum((x - x_mean) ** 2 for x in x_values)
    if denominator == 0:
        return 0.0
    return numerator / denominator


def detect_burnout(daily_summaries: list[dict[str, float]], lookback_days: int) -> dict[str, object]:
    if not daily_summaries:
        return {
            "risk_level": "low",
            "risk_score": 0,
            "factors": ["Not enough history yet."],
            "lookback_days": lookback_days,
        }

    late_night_avg = mean(float(day.get("late_night_minutes", 0.0)) for day in daily_summaries)
    weekend_work_days = sum(1 for day in daily_summaries if float(day.get("weekend_minutes", 0.0)) > 0)
    over_engaged_no_break_days = sum(
        1
        for day in daily_summaries
        if float(day.get("engagement_norm", 0.0)) >= 0.8
        and float(day.get("break_minutes", 0.0)) <= 15
        and float(day.get("tracked_minutes", 0.0)) >= 360
    )
    deep_work_slope = _linear_slope(
        [float(day.get("deep_work_minutes", 0.0)) for day in daily_summaries]
    )

    risk_score = 0
    factors: list[str] = []

    if late_night_avg >= 45:
        risk_score += 1
        factors.append("Consistent late-night activity detected.")

    if weekend_work_days >= 2:
        risk_score += 1
        factors.append("Frequent weekend activity detected.")

    if over_engaged_no_break_days >= 3:
        risk_score += 1
        factors.append("High engagement without enough breaks detected.")

    if deep_work_slope <= -5:
        risk_score += 1
        factors.append("Deep-work trend is declining.")

    if risk_score >= 3:
        risk_level = "high"
    elif risk_score == 2:
        risk_level = "medium"
    else:
        risk_level = "low"

    if not factors:
        factors.append("No strong burnout signals detected.")

    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "factors": factors,
        "lookback_days": lookback_days,
    }

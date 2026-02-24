from __future__ import annotations

from datetime import datetime


def clamp(value: float, minimum: float = 0.0, maximum: float = 1.0) -> float:
    return max(minimum, min(value, maximum))


def safe_divide(numerator: float, denominator: float) -> float:
    if denominator == 0:
        return 0.0
    return numerator / denominator


def minutes_between(start: datetime, end: datetime) -> float:
    seconds = (end - start).total_seconds()
    return max(0.0, seconds / 60.0)


def overlap_minutes(
    range_a_start: datetime,
    range_a_end: datetime,
    range_b_start: datetime,
    range_b_end: datetime,
) -> float:
    start = max(range_a_start, range_b_start)
    end = min(range_a_end, range_b_end)
    if end <= start:
        return 0.0
    return minutes_between(start, end)

from __future__ import annotations

import math
from typing import Literal

Trend = Literal["improved", "declined", "stable"]

TREND_THRESHOLD_PERCENTILE_POINTS: float = 5.0


def percentile_rank(value: float, population: list[float]) -> float:
    if not population:
        return float("nan")
    at_or_below = sum(1 for v in population if v <= value)
    return round(at_or_below / len(population) * 100, 1)


def classify_trend(previous_percentile: float, current_percentile: float) -> Trend:
    if math.isnan(previous_percentile) or math.isnan(current_percentile):
        return "stable"
    delta = current_percentile - previous_percentile
    if delta > TREND_THRESHOLD_PERCENTILE_POINTS:
        return "improved"
    if delta < -TREND_THRESHOLD_PERCENTILE_POINTS:
        return "declined"
    return "stable"

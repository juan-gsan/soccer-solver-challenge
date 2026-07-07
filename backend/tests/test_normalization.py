import math

from app.services.normalization import classify_trend, percentile_rank


def test_percentile_rank_matches_challenge_example() -> None:
    # From the brief: a player with 10 goals in a season where the average is 8.
    population = [4, 6, 8, 8, 10, 12]
    result = percentile_rank(10, population)
    assert result == round(5 / 6 * 100, 1)


def test_percentile_rank_is_bounded_0_to_100() -> None:
    population = [1, 2, 3, 4, 5]
    assert percentile_rank(0, population) == 0.0
    assert percentile_rank(5, population) == 100.0


def test_percentile_rank_empty_population_is_nan() -> None:
    assert math.isnan(percentile_rank(10, []))


def test_classify_trend_improved() -> None:
    assert classify_trend(40.0, 60.0) == "improved"


def test_classify_trend_declined() -> None:
    assert classify_trend(70.0, 50.0) == "declined"


def test_classify_trend_stable_within_threshold() -> None:
    assert classify_trend(50.0, 53.0) == "stable"


def test_classify_trend_nan_is_stable() -> None:
    assert classify_trend(float("nan"), 60.0) == "stable"

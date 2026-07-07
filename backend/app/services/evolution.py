from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from app.data.repository import PlayerRepository
from app.services.normalization import classify_trend, percentile_rank


@dataclass(frozen=True)
class MetricPoint:
    metric: str
    player_value: float
    position_average: Optional[float]
    percentile: Optional[float]
    trend: Optional[str]  # vs the previous season; None for the first season


@dataclass(frozen=True)
class SeasonEvolution:
    season: str
    metrics: list[MetricPoint]


def build_player_evolution(
    repo: PlayerRepository, player_id: int, metrics: list[str]
) -> list[SeasonEvolution]:
    player_seasons = repo.get_player_season_stats(player_id)
    if player_seasons.empty:
        return []

    results: list[SeasonEvolution] = []
    previous_percentiles: dict[str, float] = {}

    for _, row in player_seasons.iterrows():
        season = str(row["season"])
        position = str(row["position"])
        population = repo.get_position_season_population(position, season)

        metric_points: list[MetricPoint] = []
        for metric in metrics:
            player_value = float(row[metric])
            pop_values = population[metric].tolist()
            pct = percentile_rank(player_value, pop_values)
            avg = float(population[metric].mean()) if pop_values else None

            trend: Optional[str] = None
            if metric in previous_percentiles:
                trend = classify_trend(previous_percentiles[metric], pct)
            previous_percentiles[metric] = pct

            metric_points.append(
                MetricPoint(
                    metric=metric,
                    player_value=player_value,
                    position_average=avg,
                    percentile=None if pct != pct else pct,
                    trend=trend,
                )
            )
        results.append(SeasonEvolution(season=season, metrics=metric_points))

    return results

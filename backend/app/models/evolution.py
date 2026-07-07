from typing import Optional

from pydantic import BaseModel


class MetricPointResponse(BaseModel):
    metric: str
    player_value: float
    position_average: Optional[float]
    percentile: Optional[float]
    trend: Optional[str]


class SeasonEvolutionResponse(BaseModel):
    season: str
    metrics: list[MetricPointResponse]


class PlayerEvolutionResponse(BaseModel):
    player_id: int
    name: str
    position: str
    sub_position: str
    available_metrics: list[str]
    seasons: list[SeasonEvolutionResponse]

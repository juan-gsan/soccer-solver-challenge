from fastapi import APIRouter, HTTPException, Query

from app.data.repository import PlayerSummary, SEASON_METRICS, get_player_repository
from app.models.evolution import (
    MetricPointResponse,
    PlayerEvolutionResponse,
    SeasonEvolutionResponse,
)
from app.models.player import PlayerSearchResponse, PlayerSearchResult
from app.services.evolution import build_player_evolution

router = APIRouter(prefix="/players", tags=["players"])


def _to_response_model(summary: PlayerSummary) -> PlayerSearchResult:
    return PlayerSearchResult(
        player_id=summary.player_id,
        name=summary.name,
        position=summary.position,
        sub_position=summary.sub_position,
        current_club=summary.current_club,
        available_seasons=summary.available_seasons,
    )


@router.get("/search", response_model=PlayerSearchResponse)
def search_players(
    name: str = Query(..., min_length=2, description="Player name or partial name"),
    limit: int = Query(20, ge=1, le=100),
) -> PlayerSearchResponse:
    repo = get_player_repository()
    matches = repo.search_players(name, limit=limit)
    results = [_to_response_model(m) for m in matches]
    return PlayerSearchResponse(query=name, count=len(results), results=results)


@router.get("/top", response_model=PlayerSearchResponse)
def get_top_players(
    metric: str = Query(
        "matches_played",
        description=f"Metric to rank by. Available: {', '.join(SEASON_METRICS)}",
    ),
    limit: int = Query(5, ge=1, le=50),
) -> PlayerSearchResponse:
    if metric not in SEASON_METRICS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown metric '{metric}'. Available: {', '.join(SEASON_METRICS)}",
        )
    repo = get_player_repository()
    top = repo.get_top_players_by_metric(metric, limit=limit)
    results = [_to_response_model(p) for p in top]
    return PlayerSearchResponse(query="", count=len(results), results=results)


@router.get("/{player_id}", response_model=PlayerSearchResult)
def get_player(player_id: int) -> PlayerSearchResult:
    repo = get_player_repository()
    player = repo.get_player(player_id)
    if player is None:
        raise HTTPException(status_code=404, detail=f"Player {player_id} not found")
    return _to_response_model(player)


@router.get("/{player_id}/evolution", response_model=PlayerEvolutionResponse)
def get_player_evolution(
    player_id: int,
    metrics: str = Query(
        ",".join(SEASON_METRICS),
        description=f"Comma-separated metrics to include. Available: {', '.join(SEASON_METRICS)}",
    ),
) -> PlayerEvolutionResponse:
    repo = get_player_repository()
    player = repo.get_player(player_id)
    if player is None:
        raise HTTPException(status_code=404, detail=f"Player {player_id} not found")

    requested_metrics = [m.strip() for m in metrics.split(",") if m.strip()]
    invalid = [m for m in requested_metrics if m not in SEASON_METRICS]
    if invalid:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown metric(s): {', '.join(invalid)}. Available: {', '.join(SEASON_METRICS)}",
        )

    seasons = build_player_evolution(repo, player_id, requested_metrics)

    return PlayerEvolutionResponse(
        player_id=player.player_id,
        name=player.name,
        position=player.position,
        sub_position=player.sub_position,
        available_metrics=SEASON_METRICS,
        seasons=[
            SeasonEvolutionResponse(
                season=s.season,
                metrics=[
                    MetricPointResponse(
                        metric=m.metric,
                        player_value=m.player_value,
                        position_average=m.position_average,
                        percentile=m.percentile,
                        trend=m.trend,
                    )
                    for m in s.metrics
                ],
            )
            for s in seasons
        ],
    )

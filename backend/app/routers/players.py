from fastapi import APIRouter, HTTPException, Query

from app.data.repository import PlayerSummary, get_player_repository
from app.models.player import PlayerSearchResponse, PlayerSearchResult

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


@router.get("/{player_id}", response_model=PlayerSearchResult)
def get_player(player_id: int) -> PlayerSearchResult:
    repo = get_player_repository()
    player = repo.get_player(player_id)
    if player is None:
        raise HTTPException(status_code=404, detail=f"Player {player_id} not found")
    return _to_response_model(player)

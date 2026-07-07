from pydantic import BaseModel, Field


class PlayerSearchResult(BaseModel):
    player_id: int
    name: str
    position: str
    sub_position: str
    current_club: str
    available_seasons: list[str] = Field(
        description="Seasons with recorded appearances, e.g. ['2021/2022', '2022/2023']"
    )


class PlayerSearchResponse(BaseModel):
    query: str
    count: int
    results: list[PlayerSearchResult]

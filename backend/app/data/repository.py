from __future__ import annotations

import functools
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import pandas as pd

DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "raw"

SEASON_METRICS: list[str] = ["goals", "assists", "minutes_played", "matches_played", "goal_involvements"]


def _season_start_year(dates: pd.Series) -> pd.Series:
    years = dates.dt.year
    months = dates.dt.month
    return years.where(months >= 7, years - 1)


def _season_label(start_year: int) -> str:
    return f"{start_year}/{start_year + 1}"


@dataclass(frozen=True)
class PlayerSummary:
    player_id: int
    name: str
    position: str
    sub_position: str
    current_club: str
    available_seasons: list[str]


class PlayerRepository:

    def __init__(self, data_dir: Path = DATA_DIR) -> None:
        self._players: pd.DataFrame = self._load_players(data_dir)
        self._appearances: pd.DataFrame = self._load_appearances(data_dir)
        self._clubs: Optional[pd.DataFrame] = self._load_clubs(data_dir)
        self._season_stats: pd.DataFrame = self._build_season_stats(
            self._appearances, self._players
        )

    @staticmethod
    def _load_players(data_dir: Path) -> pd.DataFrame:
        path = data_dir / "players.csv"
        if not path.exists():
            raise FileNotFoundError(
                f"players.csv not found at {path}. Did you run scripts/download_data.py?"
            )
        return pd.read_csv(path)

    @staticmethod
    def _load_appearances(data_dir: Path) -> pd.DataFrame:
        path = data_dir / "appearances.csv"
        if not path.exists():
            raise FileNotFoundError(
                f"appearances.csv not found at {path}. Did you run scripts/download_data.py?"
            )
        df = pd.read_csv(path, parse_dates=["date"])
        start_years = _season_start_year(df["date"])
        df["season"] = start_years.map(_season_label)
        return df

    @staticmethod
    def _load_clubs(data_dir: Path) -> Optional[pd.DataFrame]:
        path = data_dir / "clubs.csv"
        return pd.read_csv(path) if path.exists() else None

    def _resolve_club_name(self, player_row: "pd.Series[object]") -> str:
        if "current_club_name" in player_row.index and pd.notna(player_row.get("current_club_name")):
            return str(player_row["current_club_name"])
        if self._clubs is not None and "current_club_id" in player_row.index:
            club_id = player_row["current_club_id"]
            match = self._clubs.loc[self._clubs["club_id"] == club_id]
            if not match.empty and "name" in match.columns:
                return str(match.iloc[0]["name"])
        return "Unknown"

    @staticmethod
    def _build_season_stats(appearances: pd.DataFrame, players: pd.DataFrame) -> pd.DataFrame:
        merged = appearances.merge(
            players[["player_id", "position", "sub_position"]], on="player_id", how="left"
        )
        grouped = (
            merged.groupby(["player_id", "season"], as_index=False)
            .agg(
                goals=("goals", "sum"),
                assists=("assists", "sum"),
                minutes_played=("minutes_played", "sum"),
                matches_played=("game_id", "count"),
                position=("position", "first"),
                sub_position=("sub_position", "first"),
            )
        )
        grouped["goal_involvements"] = grouped["goals"] + grouped["assists"]
        return grouped

    def get_player_season_stats(self, player_id: int) -> pd.DataFrame:
        rows = self._season_stats[self._season_stats["player_id"] == player_id]
        return rows.sort_values("season")

    def get_position_season_population(self, position: str, season: str) -> pd.DataFrame:
        return self._season_stats[
            (self._season_stats["position"] == position) & (self._season_stats["season"] == season)
        ]

    def _seasons_for_player(self, player_id: int) -> list[str]:
        player_apps = self._appearances[self._appearances["player_id"] == player_id]
        if player_apps.empty:
            return []
        return sorted(player_apps["season"].unique().tolist())

    def _row_to_summary(self, row: "pd.Series[object]") -> PlayerSummary:
        player_id = int(row["player_id"])
        return PlayerSummary(
            player_id=player_id,
            name=str(row["name"]),
            position=str(row.get("position", "Unknown")),
            sub_position=str(row.get("sub_position", "Unknown")),
            current_club=self._resolve_club_name(row),
            available_seasons=self._seasons_for_player(player_id),
        )

    def search_players(self, name_query: str, limit: int = 20) -> list[PlayerSummary]:
        query = name_query.strip().lower()
        if not query:
            return []

        matches = self._players[self._players["name"].str.lower().str.contains(query, na=False)]
        matches = matches.head(limit)

        summaries = [self._row_to_summary(row) for _, row in matches.iterrows()]
        return [s for s in summaries if s.available_seasons]

    def get_player(self, player_id: int) -> Optional[PlayerSummary]:
        row = self._players[self._players["player_id"] == player_id]
        if row.empty:
            return None
        return self._row_to_summary(row.iloc[0])

    def get_top_players_by_metric(self, metric: str, limit: int = 5) -> list[PlayerSummary]:
        totals = self._season_stats.groupby("player_id")[metric].sum()
        top_ids = totals.sort_values(ascending=False).head(limit).index.tolist()

        summaries = [self.get_player(pid) for pid in top_ids]
        return [s for s in summaries if s is not None]


@functools.lru_cache(maxsize=1)
def get_player_repository() -> PlayerRepository:
    return PlayerRepository()

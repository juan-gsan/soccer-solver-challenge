from pathlib import Path

import pandas as pd

RAW_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"

# Restrict to a handful of "Big 5" European leagues, if the dataset exposes
TARGET_COMPETITIONS = {"GB1", "ES1", "IT1", "L1", "FR1"} 

# Keep the most recent N seasons. The challenge requires >= 3, we keep a
SEASONS_TO_KEEP = 4

# Only get top players
TOP_N_PLAYERS = 300


def _season_start_year(dates: pd.Series) -> pd.Series:
    years = dates.dt.year
    months = dates.dt.month
    return years.where(months >= 7, years - 1)


def main() -> None:
    players = pd.read_csv(RAW_DIR / "players.csv")
    appearances = pd.read_csv(RAW_DIR / "appearances.csv", parse_dates=["date"])
    clubs_path = RAW_DIR / "clubs.csv"
    clubs = pd.read_csv(clubs_path) if clubs_path.exists() else None

    print(f"Before filtering: {len(players)} players, {len(appearances)} appearances")

    # 1. Restrict to target competitions, if that column is available.
    if "competition_id" in appearances.columns:
        before = len(appearances)
        appearances = appearances[appearances["competition_id"].isin(TARGET_COMPETITIONS)]
        print(f"After competition filter: {len(appearances)} appearances (was {before})")

    # 2. Restrict to the most recent N seasons.
    season_start = _season_start_year(appearances["date"])
    cutoff = season_start.max() - (SEASONS_TO_KEEP - 1)
    appearances = appearances[season_start >= cutoff]
    print(f"After season filter (last {SEASONS_TO_KEEP} seasons): {len(appearances)} appearances")

    # 3. Keep only the TOP_N_PLAYERS with the most appearances in
    appearance_counts = appearances.groupby("player_id").size().sort_values(ascending=False)
    top_player_ids = set(appearance_counts.head(TOP_N_PLAYERS).index)
    appearances = appearances[appearances["player_id"].isin(top_player_ids)]
    players = players[players["player_id"].isin(top_player_ids)]

    # 4. Keep only clubs actually referenced by the players above
    if clubs is not None:
        referenced_club_ids: set = set()
        if "current_club_id" in players.columns:
            referenced_club_ids |= set(players["current_club_id"].dropna().unique())
        if "player_club_id" in appearances.columns:
            referenced_club_ids |= set(appearances["player_club_id"].dropna().unique())
        clubs = clubs[clubs["club_id"].isin(referenced_club_ids)]

    print(f"After filtering: {len(players)} players, {len(appearances)} appearances")

    players.to_csv(RAW_DIR / "players.csv", index=False)
    appearances.to_csv(RAW_DIR / "appearances.csv", index=False)
    if clubs is not None:
        clubs.to_csv(RAW_DIR / "clubs.csv", index=False)

    print("\nFinal file sizes:")
    for name in ["players.csv", "appearances.csv", "clubs.csv"]:
        path = RAW_DIR / name
        if path.exists():
            size_mb = path.stat().st_size / (1024 * 1024)
            print(f"  {name}: {size_mb:.2f} MB")


if __name__ == "__main__":
    main()

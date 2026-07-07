import pandas as pd

from app.data.repository import _season_label, _season_start_year


def test_season_start_year_before_july_belongs_to_previous_year() -> None:
    dates = pd.to_datetime(pd.Series(["2023-03-15", "2023-06-30"]))
    assert _season_start_year(dates).tolist() == [2022, 2022]


def test_season_start_year_from_july_belongs_to_current_year() -> None:
    dates = pd.to_datetime(pd.Series(["2023-07-01", "2023-12-25"]))
    assert _season_start_year(dates).tolist() == [2023, 2023]


def test_season_label_formats_as_slash_range() -> None:
    assert _season_label(2022) == "2022/2023"

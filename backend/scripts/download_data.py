from pathlib import Path

from dotenv import load_dotenv
import kagglehub
from kagglehub import KaggleDatasetAdapter

load_dotenv()

RAW_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"
DATASET = "davidcariboo/player-scores"
FILES = ["players.csv", "appearances.csv", "clubs.csv"]


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    for file_name in FILES:
        df = kagglehub.load_dataset(KaggleDatasetAdapter.PANDAS, DATASET, file_name)
        out_path = RAW_DIR / file_name
        df.to_csv(out_path, index=False)
        print(f"Saved {out_path} ({len(df)} rows, {len(df.columns)} columns)")


if __name__ == "__main__":
    main()

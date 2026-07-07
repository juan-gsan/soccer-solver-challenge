# soccer-solver-challenge

Challenge for Soccer Solver Technical Interview

## Table of contents

- [Project structure](#project-structure)
- [Requirements](#requirements)
- [The normalisation approach (core of the challenge)](#the-normalisation-approach-core-of-the-challenge)
- [Dataset](#dataset)
- [Tests](#tests)
- [What I'd do next](#what-id-do-next)

## Main Structure

```
soccer-solver-challenge/
├── docker/
│   └── docker-compose.yml
├── backend/                     # FastAPI + Python
│   ├── app/
│   │   ├── data/
│   │   │   └── repository.py
│   │   ├── services/
│   │   │   ├── normalization.py
│   │   │   └── evolution.py
│   │   ├── models/
│   │   ├── routers/players.py
│   │   └── main.py
│   ├── scripts/
│   │   ├── download_data.py
│   │   └── filter_dataset.py
│   ├── data/raw/
│   └── tests/
├── frontend/                    # React + TypeScript + Vite
│   └── src/
│       ├── pages/
│       ├── components/
|       ├── hooks/
│       └── ...
├── .env.example
└── README.md
```

## Requirements

Install Docker Desktop and open it for the docker engine to start

```bash
cp .env.example .env
cd docker
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

The filtered CSVs are already committed under `backend/data/raw/`, so
**nothing needs to be downloaded to run the app**. The download/filter
scripts are only there to refresh the dataset if desired:

```bash
cd backend
python scripts/download_data.py    # pulls the full dataset from Kaggle (kagglehub)
python scripts/filter_dataset.py   # shrinks it to a size that fits in a GitHub repo
```

## Tests: 100% Coverage

While the docker environment for the App is up and running, open a new terminal and run:

```bash
cd docker
docker compose exec backend pytest -v
docker compose exec frontend npm test
```

## The normalisation problem

### Method chosen: percentile normalised by position and season

I decided for each `(player, season)`, to calculate the player's percentile within the
population of **players sharing their position in that same season**

### Why position and why percentile?

I decided to normalise by position (`Attack`, `Midfield`,`Defender`, `Goalkeeper`)
because that's the filter that makes the comparison fair: a forward and a centre-back shouldn't be compared on goals, but two forwards should.

I haven't additionally filter by league because the filtered dataset is already restricted to the "Big 5" European leagues, so the reference population is already reasonably homogeneous in level, adding the condition on league also would make the
population too small to become realiable.

I chose percentile over z-score for two reasons:

1. **Robust against outliers**
   Most of players score a few goals, some score a lot, this makes the z-score a bit unreliable against outliers, will distort the middle values, specially with a big population, percentile is more reliable.

2. **Interpretability**
   "80th percentile" is more understandable without any statistics background; "z-score of 1.4" isn't. Example for the xG in the 2026 world cup, they are difficult to understand. Also it´s easy to show in a chart on a 0-100 scale.

**Disadvantage**
Percentiles compress differences at the extremes (going from the 99th to the 100th percentile can hide a big gap), and the result depends on how many players are in that season's reference population, if very few players, the percentile is less reliable.

### How the UI communicates that these are normalised values

I have created tooltips always visible in the chart and comparison views to explain the users how the values are calculated.

## Dataset

**Source:** [Football Data from Transfermarkt](https://www.kaggle.com/datasets/davidcariboo/player-scores)

**Filtered to make it committable to GitHub**

## What I'd improve with more time

- When the app grows, and global states will appear, I would use Redux/Zustand
  to manage the global states. I decided to not use it since the project is small
  and there is no need for it.

- Surface a warning in the UI when a season/position's reference population
  is very small, so the user knows that percentile is less reliable.

- Calibrate the ±5 threshold in `classify_trend` against actual
  historical variance instead of a fixed value.

- Add richer metrics (xG, passes, shots) if a dataset with those fields is
  available.

- Debounce the player search input (`PlayerPicker`) so it doesn't fire a
  request on every keystroke.

- End-to-end tests (Playwright/Cypress); today there are only unitary tests.

- Move to a real database, I am using a csv file for this challenge, we
  need to connect to a real DB, Clickhouse would be a good option in my opinion.

- Make the selection for comparison between players more selective, for example,
  it makes not much sense to compare goals of a forward against a defender.

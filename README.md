# soccer-solver-challenge

Challenge for Soccer Solver Technical Interview

## Main Structure

```
soccer-solver-challenge/
├── docker/
│   └── docker-compose.yml
├── backend/          # FastAPI + Python
│   ├── app/
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/         # React + TypeScript + Vite
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── .env.example
└── README.md
```

## Requirements

- Docker & Docker Compose. Strongly recommended to install Docker Desktop for easy setup.

## How to run the project

1. Create a .env file based on the example:

   ```bash
   cp .env.example .env
   ```

2. Navigate to `docker/` folder, create and run docker compose command:

   ```bash
   cd docker
   docker compose up --build
   ```

3. Local links to navigate to the App:
   - Frontend: http://localhost:5173
   - Backend (docs Swagger): http://localhost:8000/docs
   - Backend health: http://localhost:8000/health

4. To Stop the containers: `Ctrl+C` , to remove them:

   ```bash
   docker compose down
   ```

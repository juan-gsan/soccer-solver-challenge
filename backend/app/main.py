from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="SoccerSolver API",
    description="Backend SoccerSolver",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str
    message: str


@app.get("/", response_model=HealthResponse)
def read_root() -> HealthResponse:
    """Hello World"""
    return HealthResponse(status="ok", message="Hello world from Backend")


@app.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    """Backend Health check"""
    return HealthResponse(status="ok", message="Backend up and running")


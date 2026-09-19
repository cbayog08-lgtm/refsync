from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import random
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# -------- Models --------
class Match(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    home_team: str = "LOCAL"
    away_team: str = "VISITANTE"
    home_color: str = "#EF4444"
    away_color: str = "#3B82F6"
    category: str = "Aficionado"
    half_duration_min: int = 45
    pair_code: str = ""
    lineup_enabled: bool = False
    lineups: Dict[str, Any] = Field(default_factory=dict)
    status: str = "active"  # active | finished
    created_at: str = Field(default_factory=now_iso)
    finished_at: Optional[str] = None


class MatchCreate(BaseModel):
    home_team: str = "LOCAL"
    away_team: str = "VISITANTE"
    home_color: str = "#EF4444"
    away_color: str = "#3B82F6"
    category: str = "Aficionado"
    half_duration_min: int = 45
    lineup_enabled: bool = False
    lineups: Dict[str, Any] = Field(default_factory=dict)


class Event(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    match_id: str
    type: Literal["goal", "card", "substitution"]
    minute: int
    added_minute: int = 0
    team: Literal["home", "away"]
    dorsal: Optional[int] = None
    card_color: Optional[Literal["yellow", "red"]] = None
    dorsal_out: Optional[int] = None
    dorsal_in: Optional[int] = None
    reason: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


class EventCreate(BaseModel):
    type: Literal["goal", "card", "substitution"]
    minute: int
    added_minute: int = 0
    team: Literal["home", "away"]
    dorsal: Optional[int] = None
    card_color: Optional[Literal["yellow", "red"]] = None
    dorsal_out: Optional[int] = None
    dorsal_in: Optional[int] = None
    reason: Optional[str] = None


# -------- Routes --------
@api_router.get("/")
async def root():
    return {"message": "RefSync OS API"}


@api_router.post("/matches", response_model=Match)
async def create_match(body: MatchCreate):
    match = Match(**body.model_dump())
    match.pair_code = f"{random.randint(0, 999999):06d}"
    await db.matches.insert_one(match.model_dump())
    return match


@api_router.get("/matches/by-code/{code}", response_model=Match)
async def get_match_by_code(code: str):
    doc = await db.matches.find_one(
        {"pair_code": code, "status": "active"}, {"_id": 0}, sort=[("created_at", -1)]
    )
    if not doc:
        raise HTTPException(status_code=404, detail="No active match for code")
    return Match(**doc)


@api_router.get("/matches", response_model=List[Match])
async def list_matches(status: Optional[str] = None):
    query = {} if not status else {"status": status}
    docs = await db.matches.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [Match(**d) for d in docs]


@api_router.get("/matches/{match_id}", response_model=Match)
async def get_match(match_id: str):
    doc = await db.matches.find_one({"id": match_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Match not found")
    return Match(**doc)


@api_router.post("/matches/{match_id}/finish", response_model=Match)
async def finish_match(match_id: str):
    doc = await db.matches.find_one({"id": match_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Match not found")
    await db.matches.update_one(
        {"id": match_id},
        {"$set": {"status": "finished", "finished_at": now_iso()}},
    )
    doc = await db.matches.find_one({"id": match_id}, {"_id": 0})
    return Match(**doc)


@api_router.get("/matches/{match_id}/events", response_model=List[Event])
async def list_events(match_id: str):
    docs = await db.events.find({"match_id": match_id}, {"_id": 0}).to_list(1000)
    events = [Event(**d) for d in docs]
    events.sort(key=lambda e: (e.minute, e.added_minute, e.created_at))
    return events


@api_router.post("/matches/{match_id}/events", response_model=Event)
async def add_event(match_id: str, body: EventCreate):
    match_doc = await db.matches.find_one({"id": match_id}, {"_id": 0})
    if not match_doc:
        raise HTTPException(status_code=404, detail="Match not found")
    event = Event(match_id=match_id, **body.model_dump())
    await db.events.insert_one(event.model_dump())
    return event


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

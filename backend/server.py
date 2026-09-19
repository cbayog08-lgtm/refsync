from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

app = FastAPI(title="RefSync OS API", version="2.0.0")

# --- MODELOS DE DATOS ---

class Player(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    number: int
    name: str
    is_starter: bool = True

class CardEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    minute: int
    player_number: int
    card_type: str  # "yellow", "red", "yellow_red"
    reason: Optional[str] = None
    voice_note_transcript: Optional[str] = None

class GoalEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    minute: int
    player_number: int
    team: str  # "home" o "away"

class IncidentEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    minute: int
    description: str
    voice_note_transcript: Optional[str] = None

class SubstitutionEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    minute: int
    player_out_number: int
    player_in_number: int
    team: str

class MatchConfig(BaseModel):
    category: str  # Prebenjamín, Benjamín, Alevín, Infantil, Cadete, Juvenil, Senior, F11
    period_duration_minutes: int
    max_substitutes: int = 7

class MatchState(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    home_team: str
    away_team: str
    config: MatchConfig
    current_period: int = 1  # 1: 1ª Parte, 2: Descanso, 3: 2ª Parte, 4: Finalizado
    home_lineup: List[Player] = []
    away_lineup: List[Player] = []
    goals: List[GoalEvent] = []
    cards: List[CardEvent] = []
    incidents: List[IncidentEvent] = []
    substitutions: List[SubstitutionEvent] = []
    history: List[dict] = []  # Para la función Deshacer (Undo)

# Base de datos en memoria para el estado del partido
db_matches = {}

# --- ENDPOINTS Y LÓGICA ---

@app.get("/")
def read_root():
    return {"status": "RefSync OS Backend Running", "version": "2.0.0"}

@app.post("/matches", response_model=MatchState)
def create_match(match: MatchState):
    # Validación de suplentes en Fútbol 11
    if match.config.category in ["Senior", "Juvenil", "Cadete", "F11"]:
        home_subs = [p for p in match.home_lineup if not p.is_starter]
        away_subs = [p for p in match.away_lineup if not p.is_starter]
        if len(home_subs) > 7 or len(away_subs) > 7:
            raise HTTPException(
                status_code=400, 
                detail="En categorías de Fútbol 11 se permite un máximo de 7 suplentes."
            )
    
    db_matches[match.id] = match
    return match

@app.post("/matches/{match_id}/goal", response_model=MatchState)
def register_goal(match_id: str, goal: GoalEvent):
    if match_id not in db_matches:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    
    match = db_matches[match_id]
    match.history.append({"type": "goal", "data": goal.dict()})
    match.goals.append(goal)
    return match

@app.post("/matches/{match_id}/card", response_model=CardEvent)
def register_card(match_id: str, card: CardEvent):
    if match_id not in db_matches:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    
    match = db_matches[match_id]
    match.history.append({"type": "card", "data": card.dict()})
    match.cards.append(card)
    return card

@app.post("/matches/{match_id}/incident", response_model=IncidentEvent)
def register_incident(match_id: str, incident: IncidentEvent):
    if match_id not in db_matches:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    
    match = db_matches[match_id]
    match.history.append({"type": "incident", "data": incident.dict()})
    match.incidents.append(incident)
    return incident

@app.post("/matches/{match_id}/undo", response_model=MatchState)
def undo_last_action(match_id: str):
    if match_id not in db_matches:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    
    match = db_matches[match_id]
    if not match.history:
        raise HTTPException(status_code=400, detail="No hay acciones para deshacer")
    
    last_action = match.history.pop()
    action_type = last_action["type"]
    action_data = last_action["data"]
    
    if action_type == "goal":
        match.goals = [g for g in match.goals if g.id != action_data["id"]]
    elif action_type == "card":
        match.cards = [c for c in match.cards if c.id != action_data["id"]]
    elif action_type == "incident":
        match.incidents = [i for i in match.incidents if i.id != action_data["id"]]
    elif action_type == "substitution":
        match.substitutions = [s for s in match.substitutions if s.id != action_data["id"]]
        
    return match

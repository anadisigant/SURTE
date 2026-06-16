# app/schemas/entrevista.py
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from app.models.domain import EntrevistaStatus

class EntrevistaBase(BaseModel):
    entrevistado_id: int
    programa_id: int
    data_hora_inicio: datetime
    data_hora_fim: datetime
    notas: Optional[str] = None

class EntrevistaCreate(EntrevistaBase):
    pass

class TransicaoStatus(BaseModel):
    status: EntrevistaStatus

class EntrevistaResponse(EntrevistaBase):
    id: int
    usuario_id: int
    status: EntrevistaStatus

    model_config = ConfigDict(from_attributes=True)
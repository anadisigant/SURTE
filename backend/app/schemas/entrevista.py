# app/schemas/entrevista.py
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from app.models.domain import EntrevistaStatus
from app.schemas.programa import ProgramaResponse
from app.schemas.entrevistado import EntrevistadoResponse

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

class EntrevistaListResponse(BaseModel):
    """Schema simplificado para a listagem da agenda."""
    id: int
    data_hora_inicio: datetime
    data_hora_fim: datetime
    status: EntrevistaStatus
    notas: Optional[str] = None
    entrevistado_id: int
    programa_id: int
    usuario_id: int
    # Campos aninhados apenas com informações essenciais para listagem
    nome_entrevistado: Optional[str] = None
    nome_programa: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class EntrevistaDetalheResponse(BaseModel):
    """Schema completo para o detalhamento de uma entrevista."""
    id: int
    data_hora_inicio: datetime
    data_hora_fim: datetime
    status: EntrevistaStatus
    notas: Optional[str] = None
    usuario_id: int
    programa: ProgramaResponse
    entrevistado: EntrevistadoResponse

    model_config = ConfigDict(from_attributes=True)
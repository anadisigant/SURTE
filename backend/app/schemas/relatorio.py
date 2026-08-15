from pydantic import BaseModel
from typing import List
from datetime import date


class ParticipacaoMes(BaseModel):
    mes: str
    total: int
    data_referencia: date


class AreaMes(BaseModel):
    area: str
    mes: str
    total: int
    data_referencia: date


class RelatoriosResponse(BaseModel):
    participacoes: List[ParticipacaoMes]
    areas: List[AreaMes]
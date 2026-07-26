from pydantic import BaseModel
from typing import List

class ParticipacaoMes(BaseModel):
    mes: str
    total: int

class AreaEvolucao(BaseModel):
    area: str
    abr: int
    mai: int

class RelatoriosResponse(BaseModel):
    participacoes: List[ParticipacaoMes]
    areas: List[AreaEvolucao]

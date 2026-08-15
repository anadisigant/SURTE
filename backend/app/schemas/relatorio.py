from pydantic import BaseModel
from typing import List, Optional
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


class DetalheParticipacao(BaseModel):
    """Uma linha por participação, com nomes de entrevistado e programa
    já resolvidos, para relatórios que precisam listar quem/o quê e não
    só totais agregados."""
    id: int
    data: str
    data_referencia: date
    nome_entrevistado: str
    area_atuacao: str
    nome_programa: str
    tema_abordado: Optional[str] = None


class RelatoriosResponse(BaseModel):
    participacoes: List[ParticipacaoMes]
    areas: List[AreaMes]
    detalhes: List[DetalheParticipacao] = []
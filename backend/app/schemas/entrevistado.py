from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional

class EntrevistadoBase(BaseModel):
    nome_completo: str
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    area_atuacao: str
    instituicao: Optional[str] = None
    temas: str
    autorizacao_imagem_voz: bool = False

class EntrevistadoCreate(EntrevistadoBase):
    pass

class EntrevistadoResponse(EntrevistadoBase):
    id: int
    ativo: bool

    model_config = ConfigDict(from_attributes=True)

class EntrevistadoUpdate(BaseModel):
    nome_completo: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    area_atuacao: Optional[str] = None
    instituicao: Optional[str] = None
    temas: Optional[str] = None
    autorizacao_imagem_voz: Optional[bool] = None
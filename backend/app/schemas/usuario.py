from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.domain import UsuarioCargo

class UsuarioBase(BaseModel):
    nome_completo: str
    email: EmailStr
    cargo: UsuarioCargo

class UsuarioCreate(UsuarioBase):
    senha: str # A senha só existe na criação, nunca na resposta!

class UsuarioResponse(UsuarioBase):
    id: int
    ativo: bool

    model_config = ConfigDict(from_attributes=True)
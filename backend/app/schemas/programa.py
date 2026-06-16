from pydantic import BaseModel, ConfigDict
from typing import Optional

class ProgramaBase(BaseModel):
    nome: str
    descricao: Optional[str] = None

class ProgramaCreate(ProgramaBase):
    pass

class ProgramaResponse(ProgramaBase):
    id: int
    ativo: bool
    
    # Pydantic V2: Permite ler diretamente os modelos do SQLAlchemy
    model_config = ConfigDict(from_attributes=True)
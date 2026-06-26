from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api.dependencies import get_db, get_current_user
from app.models.domain import Usuario, Entrevistado
from pydantic import BaseModel
from fastapi import HTTPException

class EntrevistadoCreateDTO(BaseModel):
    nome_completo: str
    area_atuacao: str
    temas: str
    email: str = None
    autorizacao_imagem_voz: bool = False

router = APIRouter()

@router.post("/", status_code=status.HTTP_201_CREATED)
async def criar_entrevistado(
    payload: EntrevistadoCreateDTO,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    db_obj = Entrevistado(**payload.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

@router.get("/{id}", status_code=status.HTTP_200_OK)
async def obter_entrevistado(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    result = await db.execute(select(Entrevistado).filter(Entrevistado.id == id, Entrevistado.ativo == True))
    entrevistado = result.scalars().first()
    if not entrevistado:
        raise HTTPException(status_code=404, detail=f"Entrevistado ID {id} não encontrado ou inativo.")
    return entrevistado
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.api.dependencies import get_db, get_current_user
from app.models.domain import Usuario, Programa
from app.schemas.programa import ProgramaCreate, ProgramaResponse

router = APIRouter()

@router.post("/", response_model=ProgramaResponse, status_code=status.HTTP_201_CREATED)
async def criar_programa(
    payload: ProgramaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    result = await db.execute(select(Programa).filter(Programa.nome == payload.nome))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Já existe um programa com este nome.")
    novo = Programa(nome=payload.nome, descricao=payload.descricao)
    db.add(novo)
    await db.commit()
    await db.refresh(novo)
    return novo

@router.get("/", response_model=List[ProgramaResponse])
async def listar_programas(
    skip: int = 0, limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    result = await db.execute(select(Programa).filter(Programa.ativo == True).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/{id}", response_model=ProgramaResponse)
async def obter_programa(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    result = await db.execute(select(Programa).filter(Programa.id == id, Programa.ativo == True))
    programa = result.scalars().first()
    if not programa:
        raise HTTPException(status_code=404, detail="Programa não encontrado ou inativo.")
    return programa

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_programa(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    result = await db.execute(select(Programa).filter(Programa.id == id, Programa.ativo == True))
    programa = result.scalars().first()
    if not programa:
        raise HTTPException(status_code=404, detail="Programa não encontrado ou inativo.")
    programa.ativo = False
    await db.commit()
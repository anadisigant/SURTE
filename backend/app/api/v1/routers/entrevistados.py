# app/api/v1/routers/entrevistados.py
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user
from app.models.domain import Usuario
from app.schemas.entrevistado import EntrevistadoCreate, EntrevistadoUpdate, EntrevistadoResponse
from app.services.entrevistado_service import EntrevistadoService

router = APIRouter()


@router.get("/", response_model=List[EntrevistadoResponse], summary="Buscar fontes com filtros")
async def buscar_entrevistados(
    nome: Optional[str] = Query(None, description="Filtrar por nome (busca parcial)"),
    area_atuacao: Optional[str] = Query(None, description="Filtrar por área de atuação (busca parcial)"),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    service = EntrevistadoService(db)
    return await service.buscar(nome=nome, area_atuacao=area_atuacao)


@router.post("/", status_code=status.HTTP_201_CREATED, summary="Cadastrar fonte")
async def criar_entrevistado(
    payload: EntrevistadoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    service = EntrevistadoService(db)
    return await service.criar(payload.model_dump())


@router.get("/{id}", response_model=EntrevistadoResponse, summary="Obter fonte por ID")
async def obter_entrevistado(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    service = EntrevistadoService(db)
    return await service.obter(id)


@router.patch("/{id}", response_model=EntrevistadoResponse, summary="Atualizar dados da fonte")
async def atualizar_entrevistado(
    id: int,
    payload: EntrevistadoUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    service = EntrevistadoService(db)
    return await service.atualizar(id, payload.model_dump(exclude_none=True))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Inativar fonte (soft delete)")
async def inativar_entrevistado(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    service = EntrevistadoService(db)
    await service.inativar(id)
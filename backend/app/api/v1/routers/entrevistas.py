# app/api/v1/routers/entrevistas.py
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user
from app.models.domain import Usuario
from app.schemas.entrevista import (
    EntrevistaCreate,
    TransicaoStatus,
)
from app.services.entrevista_service import EntrevistaService

router = APIRouter()


@router.get("/", summary="Listar agenda de entrevistas")
async def listar_agenda(
    data: Optional[date] = Query(None, description="Filtrar por data (formato: YYYY-MM-DD)"),
    programa_id: Optional[int] = Query(None, description="Filtrar por ID do programa"),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    service = EntrevistaService(db)
    entrevistas = await service.listar_agenda(data=data, programa_id=programa_id)
    return {"status": "success", "data": entrevistas}


@router.get("/{id}", summary="Detalhes de uma entrevista")
async def buscar_entrevista(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    service = EntrevistaService(db)
    entrevista = await service.buscar_detalhe(id)
    return {"status": "success", "data": entrevista}


@router.post("/", status_code=status.HTTP_201_CREATED, summary="Agendar entrevista")
async def agendar_entrevista(
    payload: EntrevistaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    service = EntrevistaService(db)
    entrevista = await service.agendar(payload.model_dump(), current_user.id)
    return {"status": "success", "data": entrevista}


@router.patch("/{id}/status", status_code=status.HTTP_200_OK, summary="Atualizar status da entrevista")
async def atualizar_status_entrevista(
    id: int,
    payload: TransicaoStatus,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    service = EntrevistaService(db)
    entrevista = await service.atualizar_status(id, payload.status)
    return {"status": "success", "data": entrevista}
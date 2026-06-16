# app/api/v1/routers/entrevistas.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_db, get_current_user
from app.models.domain import Usuario
from app.schemas.entrevista import EntrevistaCreate, TransicaoStatus
from app.services.entrevista_service import EntrevistaService

router = APIRouter()

@router.post("/", status_code=status.HTTP_201_CREATED)
async def agendar_entrevista(
    payload: EntrevistaCreate, 
    db: AsyncSession = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    service = EntrevistaService(db)
    entrevista = await service.agendar(payload.model_dump(), current_user.id)
    
    # Retorno no Padrão Envelope
    return {"status": "success", "data": entrevista}

@router.patch("/{id}/status", status_code=status.HTTP_200_OK)
async def atualizar_status_entrevista(
    id: int, 
    payload: TransicaoStatus, 
    db: AsyncSession = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    service = EntrevistaService(db)
    entrevista = await service.atualizar_status(id, payload.status)
    
    return {"status": "success", "data": entrevista}
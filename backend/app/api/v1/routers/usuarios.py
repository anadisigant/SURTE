from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.api.dependencies import get_db, get_current_user
from app.models.domain import Usuario, UsuarioCargo
from app.core.security import get_password_hash
from app.schemas.usuario import UsuarioCreate, UsuarioResponse

router = APIRouter()

@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def criar_usuario(
    payload: UsuarioCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if current_user.cargo != UsuarioCargo.administrador:
        raise HTTPException(status_code=403, detail="Apenas administradores podem registar novos utilizadores.")

    result = await db.execute(select(Usuario).filter(Usuario.email == payload.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Este e-mail já está registado no sistema.")

    novo = Usuario(
        nome_completo=payload.nome_completo,
        email=payload.email,
        senha_hash=get_password_hash(payload.senha),
        cargo=payload.cargo
    )
    db.add(novo)
    await db.commit()
    await db.refresh(novo)
    return novo

@router.get("/me", response_model=UsuarioResponse)
async def obter_usuario_logado(current_user: Usuario = Depends(get_current_user)):
    return current_user

@router.get("/", response_model=List[UsuarioResponse])
async def listar_usuarios(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    result = await db.execute(select(Usuario).filter(Usuario.ativo == True))
    return result.scalars().all()
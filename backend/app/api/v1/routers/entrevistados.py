<<<<<<< HEAD
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.dependencies import get_current_user, get_db
from app.models.domain import Entrevistado, Usuario
from app.schemas.entrevistado import EntrevistadoCreate, EntrevistadoResponse

router = APIRouter()


async def buscar_entrevistado_ativo(db: AsyncSession, id: int) -> Entrevistado:
    result = await db.execute(
        select(Entrevistado).filter(Entrevistado.id == id, Entrevistado.ativo == True)
    )
    entrevistado = result.scalars().first()
    if not entrevistado:
        raise HTTPException(status_code=404, detail=f"Entrevistado ID {id} nao encontrado ou inativo.")
    return entrevistado


@router.get("/", response_model=List[EntrevistadoResponse], status_code=status.HTTP_200_OK)
async def listar_entrevistados(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    result = await db.execute(
        select(Entrevistado)
        .filter(Entrevistado.ativo == True)
        .order_by(Entrevistado.nome_completo)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.post("/", response_model=EntrevistadoResponse, status_code=status.HTTP_201_CREATED)
async def criar_entrevistado(
    payload: EntrevistadoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    db_obj = Entrevistado(**payload.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


@router.get("/{id}", response_model=EntrevistadoResponse, status_code=status.HTTP_200_OK)
=======
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
>>>>>>> 9a22b51 (feat: implementa busca com filtros, edição e soft delete de entrevistados)
async def obter_entrevistado(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
<<<<<<< HEAD
    return await buscar_entrevistado_ativo(db, id)


@router.put("/{id}", response_model=EntrevistadoResponse, status_code=status.HTTP_200_OK)
async def atualizar_entrevistado(
    id: int,
    payload: EntrevistadoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    entrevistado = await buscar_entrevistado_ativo(db, id)

    for campo, valor in payload.model_dump().items():
        setattr(entrevistado, campo, valor)

    await db.commit()
    await db.refresh(entrevistado)
    return entrevistado


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def excluir_entrevistado(
=======
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
>>>>>>> 9a22b51 (feat: implementa busca com filtros, edição e soft delete de entrevistados)
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
<<<<<<< HEAD
    entrevistado = await buscar_entrevistado_ativo(db, id)
    entrevistado.ativo = False
    await db.commit()
=======
    service = EntrevistadoService(db)
    await service.inativar(id)
>>>>>>> 9a22b51 (feat: implementa busca com filtros, edição e soft delete de entrevistados)

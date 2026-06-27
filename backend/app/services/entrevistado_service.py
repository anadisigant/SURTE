# app/services/entrevistado_service.py
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.entrevistado_repository import EntrevistadoRepository

class EntrevistadoService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = EntrevistadoRepository(db)

    async def criar(self, dados: dict):
        if dados.get("email"):
            existente = await self.repository.get_by_email(dados["email"])
            if existente:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Já existe um entrevistado cadastrado com este e-mail."
                )
        return await self.repository.create(dados)

    async def obter(self, id: int):
        entrevistado = await self.repository.get_active_by_id(id)
        if not entrevistado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Entrevistado ID {id} não encontrado ou inativo."
            )
        return entrevistado

    async def buscar(self, nome: Optional[str], area_atuacao: Optional[str]):
        return await self.repository.buscar(nome=nome, area_atuacao=area_atuacao)

    async def atualizar(self, id: int, dados: dict):
        entrevistado = await self.repository.get_active_by_id(id)
        if not entrevistado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Entrevistado ID {id} não encontrado ou inativo."
            )
        if dados.get("email"):
            existente = await self.repository.get_by_email(dados["email"], exclude_id=id)
            if existente:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Já existe um entrevistado cadastrado com este e-mail."
                )
        return await self.repository.update(entrevistado, dados)

    async def inativar(self, id: int) -> None:
        entrevistado = await self.repository.get_active_by_id(id)
        if not entrevistado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Entrevistado ID {id} não encontrado ou já inativo."
            )
        await self.repository.soft_delete(entrevistado)
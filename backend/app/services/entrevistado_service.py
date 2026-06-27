# app/services/entrevistado_service.py
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.entrevistado_repository import EntrevistadoRepository

class EntrevistadoService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = EntrevistadoRepository(db)

    async def buscar(self, nome: Optional[str] = None, area_atuacao: Optional[str] = None):
        return await self.repository.buscar(nome=nome, area_atuacao=area_atuacao)

    async def obter(self, id: int):
        entrevistado = await self.repository.get_by_id(id)
        if not entrevistado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Entrevistado ID {id} não encontrado ou inativo."
            )
        return entrevistado

    async def criar(self, dados: dict):
        return await self.repository.create(dados)

    async def atualizar(self, id: int, dados: dict):
        entrevistado = await self.repository.get_by_id(id)
        if not entrevistado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Entrevistado ID {id} não encontrado ou inativo."
            )
        return await self.repository.update(entrevistado, dados)

    async def inativar(self, id: int):
        entrevistado = await self.repository.get_by_id(id)
        if not entrevistado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Entrevistado ID {id} não encontrado ou inativo."
            )
        await self.repository.soft_delete(entrevistado)
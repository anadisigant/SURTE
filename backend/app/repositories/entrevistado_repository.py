# app/repositories/entrevistado_repository.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional
from app.models.domain import Entrevistado

class EntrevistadoRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_active_by_id(self, id: int) -> Entrevistado | None:
        result = await self.db.execute(
            select(Entrevistado).filter(Entrevistado.id == id, Entrevistado.ativo == True)
        )
        return result.scalars().first()

    async def get_by_email(self, email: str, exclude_id: int = None) -> Entrevistado | None:
        stmt = select(Entrevistado).where(Entrevistado.email == email)
        if exclude_id:
            stmt = stmt.where(Entrevistado.id != exclude_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def buscar(self, nome: Optional[str] = None, area_atuacao: Optional[str] = None) -> list:
        stmt = select(Entrevistado).where(Entrevistado.ativo == True)
        if nome:
            stmt = stmt.where(Entrevistado.nome_completo.ilike(f"%{nome}%"))
        if area_atuacao:
            stmt = stmt.where(Entrevistado.area_atuacao.ilike(f"%{area_atuacao}%"))
        stmt = stmt.order_by(Entrevistado.nome_completo)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def create(self, obj_in: dict) -> Entrevistado:
        db_obj = Entrevistado(**obj_in)
        self.db.add(db_obj)
        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj

    async def update(self, db_obj: Entrevistado, dados: dict) -> Entrevistado:
        for campo, valor in dados.items():
            if valor is not None:
                setattr(db_obj, campo, valor)
        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj

    async def soft_delete(self, db_obj: Entrevistado) -> None:
        db_obj.ativo = False
        await self.db.commit()
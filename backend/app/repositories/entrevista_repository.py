# app/repositories/entrevista_repository.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_
from app.models.domain import Entrevista, EntrevistaStatus

class EntrevistaRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, id: int) -> Entrevista | None:
        result = await self.db.execute(select(Entrevista).filter(Entrevista.id == id))
        return result.scalars().first()

    async def check_conflito_agenda(self, entrevistado_id: int, inicio, fim) -> bool:
        """
        Verifica se existe sobreposição de horários para entrevistas AGENDADAS
        do mesmo entrevistado. Retorna True se houver conflito.
        """
        stmt = select(Entrevista).where(
            Entrevista.entrevistado_id == entrevistado_id,
            Entrevista.status == EntrevistaStatus.agendada,
            # Lógica de sobreposição de intervalos: Início1 < Fim2 AND Fim1 > Início2
            and_(
                Entrevista.data_hora_inicio < fim,
                Entrevista.data_hora_fim > inicio
            )
        )
        result = await self.db.execute(stmt)
        return result.scalars().first() is not None

    async def create(self, obj_in: dict) -> Entrevista:
        db_obj = Entrevista(**obj_in)
        self.db.add(db_obj)
        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj

    async def update(self, db_obj: Entrevista) -> Entrevista:
        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj
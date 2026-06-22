# app/repositories/entrevista_repository.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from sqlalchemy.orm import selectinload
from datetime import date
from typing import Optional
from app.models.domain import Entrevista, EntrevistaStatus

class EntrevistaRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, id: int) -> Entrevista | None:
        result = await self.db.execute(select(Entrevista).filter(Entrevista.id == id))
        return result.scalars().first()

    async def get_by_id_com_detalhes(self, id: int) -> Entrevista | None:
        """Busca uma entrevista pelo ID carregando programa e entrevistado completos."""
        stmt = (
            select(Entrevista)
            .options(
                selectinload(Entrevista.programa),
                selectinload(Entrevista.entrevistado),
            )
            .where(Entrevista.id == id)
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def listar_agenda(
        self,
        data: Optional[date] = None,
        programa_id: Optional[int] = None,
    ) -> list[Entrevista]:
        """
        Lista entrevistas com filtros opcionais por data e/ou programa,
        carregando os nomes do entrevistado e do programa para exibição.
        """
        stmt = select(Entrevista).options(
            selectinload(Entrevista.programa),
            selectinload(Entrevista.entrevistado),
        )

        filtros = []

        if data:
            # Filtra todas as entrevistas que começam no dia informado
            from sqlalchemy import cast, Date
            filtros.append(cast(Entrevista.data_hora_inicio, Date) == data)

        if programa_id:
            filtros.append(Entrevista.programa_id == programa_id)

        if filtros:
            stmt = stmt.where(and_(*filtros))

        # Ordena por data/hora de início por padrão
        stmt = stmt.order_by(Entrevista.data_hora_inicio)

        result = await self.db.execute(stmt)
        return result.scalars().all()

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

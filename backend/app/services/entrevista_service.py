# app/services/entrevista_service.py
from datetime import date
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.entrevista_repository import EntrevistaRepository
from app.models.domain import EntrevistaStatus, Participacao

class EntrevistaService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = EntrevistaRepository(db)

    async def listar_agenda(self, data: Optional[date] = None, programa_id: Optional[int] = None):
        entrevistas = await self.repository.listar_agenda(data=data, programa_id=programa_id)
        resultado = []
        for e in entrevistas:
            resultado.append({
                "id": e.id,
                "data_hora": e.data_hora,
                "status": e.status,
                "notas": e.notas,
                "entrevistado_id": e.entrevistado_id,
                "programa_id": e.programa_id,
                "usuario_id": e.usuario_id,
                "nome_entrevistado": e.entrevistado.nome_completo if e.entrevistado else None,
                "nome_programa": e.programa.nome if e.programa else None,
            })
        return resultado

    async def buscar_detalhe(self, id: int):
        entrevista = await self.repository.get_by_id_com_detalhes(id)
        if not entrevista:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrevista não encontrada."
            )
        return entrevista

    async def agendar(self, dados: dict, usuario_id: int):
        dados["usuario_id"] = usuario_id
        dados["status"] = EntrevistaStatus.agendada
        return await self.repository.create(dados)

    async def atualizar_status(self, id: int, novo_status: EntrevistaStatus):
        entrevista = await self.repository.get_by_id(id)
        if not entrevista:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrevista não encontrada."
            )

        if entrevista.status != EntrevistaStatus.agendada:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Não é possível alterar o status de uma entrevista que já está '{entrevista.status.value}'."
            )

        if novo_status not in [EntrevistaStatus.realizada, EntrevistaStatus.cancelada]:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Uma entrevista agendada só pode ser alterada para 'realizada' ou 'cancelada'."
            )

        entrevista.status = novo_status

        if novo_status == EntrevistaStatus.realizada:
            nova_participacao = Participacao(entrevista_id=entrevista.id)
            self.db.add(nova_participacao)

        return await self.repository.update(entrevista)
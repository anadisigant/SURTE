from datetime import date
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.domain import EntrevistaStatus, Participacao
from app.repositories.entrevista_repository import EntrevistaRepository


class EntrevistaService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = EntrevistaRepository(db)

    async def listar_agenda(
        self,
        data: Optional[date] = None,
        programa_id: Optional[int] = None,
        status: Optional[EntrevistaStatus] = None,
    ):
        entrevistas = await self.repository.listar_agenda(
            data=data,
            programa_id=programa_id,
            status=status,
        )
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
                detail="Entrevista nao encontrada."
            )
        return entrevista

    async def agendar(self, dados: dict, usuario_id: int):
        dados["usuario_id"] = usuario_id
        dados["status"] = EntrevistaStatus.agendada

        from datetime import timedelta
        inicio = dados["data_hora"]
        fim = inicio + timedelta(hours=1)

        conflito = await self.repository.check_conflito_agenda(
            entrevistado_id=dados["entrevistado_id"],
            inicio=inicio,
            fim=fim
        )
        if conflito:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="O entrevistado já possui uma entrevista agendada que sobrepõe este horário."
            )

        return await self.repository.create(dados)

    async def atualizar_status(self, id: int, novo_status: EntrevistaStatus, usuario_id: Optional[int] = None):
        entrevista = await self.repository.get_by_id_com_detalhes(id)
        if not entrevista:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Entrevista nao encontrada."
            )

        transicoes_permitidas = {
            EntrevistaStatus.agendada: [EntrevistaStatus.confirmada, EntrevistaStatus.cancelada],
            EntrevistaStatus.confirmada: [EntrevistaStatus.realizada, EntrevistaStatus.cancelada],
        }

        status_permitidos = transicoes_permitidas.get(entrevista.status, [])

        if not status_permitidos:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Nao e possivel alterar o status de uma entrevista que ja esta '{entrevista.status.value}'."
            )

        if novo_status not in status_permitidos:
            permitidos = ", ".join(status.value for status in status_permitidos)
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Uma entrevista '{entrevista.status.value}' so pode ser alterada para: {permitidos}."
            )

        if novo_status == EntrevistaStatus.realizada:
            # Gerar Participacao automaticamente no historico
            nome_entrevistado = entrevista.entrevistado.nome_completo if entrevista.entrevistado else "Fonte"
            participacao = Participacao(
                entrevista_id=entrevista.id,
                entrevistado_id=entrevista.entrevistado_id,
                programa_id=entrevista.programa_id,
                usuario_id=usuario_id if usuario_id is not None else entrevista.usuario_id,
                data_hora=entrevista.data_hora,
                duracao_minutos=60, # 1 hora padrão
                tema_abordado=entrevista.notes if hasattr(entrevista, 'notes') and entrevista.notes else (entrevista.notas if entrevista.notas else f"Entrevista com {nome_entrevistado}"),
                observacoes="Gerada automaticamente a partir do agendamento realizado."
            )
            self.db.add(participacao)

        entrevista.status = novo_status
        return await self.repository.update(entrevista)

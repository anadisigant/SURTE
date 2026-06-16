# app/services/entrevista_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.entrevista_repository import EntrevistaRepository
from app.models.domain import EntrevistaStatus, Participacao

class EntrevistaService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = EntrevistaRepository(db)

    async def agendar(self, dados: dict, usuario_id: int):
        # Validação Básica de Tempo
        if dados["data_hora_inicio"] >= dados["data_hora_fim"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="A data de início deve ser anterior à data de fim."
            )

        # ⚠️ ATENÇÃO RN02 - Prevenção de Conflitos de Agenda
        conflito = await self.repository.check_conflito_agenda(
            dados["entrevistado_id"], 
            dados["data_hora_inicio"], 
            dados["data_hora_fim"]
        )
        if conflito:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, 
                detail="O entrevistado já possui uma entrevista agendada que sobrepõe este horário."
            )

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
        
        # ⚠️ ATENÇÃO RN04 - Transição de Status e Histórico
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

        # RN04: Crucial - Geração de Histórico se a entrevista foi realizada
        if novo_status == EntrevistaStatus.realizada:
            nova_participacao = Participacao(entrevista_id=entrevista.id)
            self.db.add(nova_participacao)

        return await self.repository.update(entrevista)
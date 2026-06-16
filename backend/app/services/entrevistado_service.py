from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.entrevistado_repository import EntrevistadoRepository

class EntrevistadoService:
    def __init__(self, db: Session):
        self.repository = EntrevistadoRepository(db)

    def criar(self, dados: dict):
        # Validações de negócio (ex: checar se e-mail já existe) poderiam vir aqui
        return self.repository.create(dados)

    def obter(self, id: int):
        entrevistado = self.repository.get_active_by_id(id)
        if not entrevistado:
            # Erros de negócio são formatados aqui para a controller interceptar
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Entrevistado ID {id} não encontrado ou inativo."
            )
        return entrevistado
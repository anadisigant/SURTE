from sqlalchemy.orm import Session
from app.models.domain import Entrevistado

class EntrevistadoRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_active_by_id(self, id: int):
        return self.db.query(Entrevistado).filter(Entrevistado.id == id, Entrevistado.ativo == True).first()

    def create(self, obj_in: dict) -> Entrevistado:
        db_obj = Entrevistado(**obj_in)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
    
    def soft_delete(self, db_obj: Entrevistado):
        db_obj.ativo = False
        self.db.commit()
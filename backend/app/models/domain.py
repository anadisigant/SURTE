# app/models/domain.py
import enum
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base 

# 1. Definindo os ENUMS Nativos do Python (Precisam vir antes das classes de tabela)
class UsuarioCargo(str, enum.Enum):
    admin= "admin"
    produtor = "produtor"
    jornalista = "jornalista"
    apresentador = "apresentador" 
    tecnico_programacao = "tecnico_programacao" 

class EntrevistaStatus(str, enum.Enum):
    agendada = "agendada"
    confirmada = "confirmada"
    realizada = "realizada"
    cancelada = "cancelada"

# 2. Agora sim, as classes das Tabelas
class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    nome_completo = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
    cargo = Column(Enum(UsuarioCargo), nullable=False)
    ativo = Column(Boolean, default=True)

class Programa(Base):
    __tablename__ = "programas"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    descricao = Column(Text)
    ativo = Column(Boolean, default=True)

class Entrevistado(Base):
    __tablename__ = "entrevistados"
    id = Column(Integer, primary_key=True, index=True)
    nome_completo = Column(String(255), nullable=False)
    telefone = Column(String(20))
    email = Column(String(255))
    area_atuacao = Column(String(150), nullable=False)
    instituicao = Column(String(255))
    temas = Column(Text, nullable=False)
    autorizacao_imagem_voz = Column(Boolean, default=False, nullable=False)
    ativo = Column(Boolean, default=True, nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

class Entrevista(Base):
    __tablename__ = "entrevistas"
    id = Column(Integer, primary_key=True, index=True)
    entrevistado_id = Column(Integer, ForeignKey("entrevistados.id", ondelete="RESTRICT"), nullable=False)
    programa_id = Column(Integer, ForeignKey("programas.id", ondelete="RESTRICT"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=False)
    data_hora_inicio = Column(DateTime(timezone=True), index=True, nullable=False)
    data_hora_fim = Column(DateTime(timezone=True), nullable=False)
    
    # Aqui é onde o erro estava dando. Agora a classe EntrevistaStatus existe lá em cima!
    status = Column(Enum(EntrevistaStatus), default=EntrevistaStatus.agendada)
    notas = Column(Text)
    
    entrevistado = relationship("Entrevistado")
    programa = relationship("Programa")
    usuario = relationship("Usuario")

class Participacao(Base):
    __tablename__ = "participacoes"
    id = Column(Integer, primary_key=True, index=True)
    entrevista_id = Column(Integer, ForeignKey("entrevistas.id", ondelete="RESTRICT"), nullable=False, unique=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    entrevista = relationship("Entrevista")
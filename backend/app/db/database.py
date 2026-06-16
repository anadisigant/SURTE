from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Criação da engine assíncrona
engine = create_async_engine(settings.DATABASE_URL, echo=False)

# Configuração da fábrica de sessões assíncronas (Singleton)
AsyncSessionLocal = async_sessionmaker(
    bind=engine, 
    class_=AsyncSession, 
    expire_on_commit=False, # Evita expiração prematura dos objetos após o commit
    autocommit=False, 
    autoflush=False
)

Base = declarative_base()
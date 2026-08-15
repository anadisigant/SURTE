# backend/app/seed_data.py
"""Seed the SURTE database with sample data.

Run with:
    python -m app.seed_data
or from the project root:
    python backend/app/seed_data.py
"""
import asyncio
import random
from datetime import datetime, timedelta

from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

from app.db.database import engine, Base
from app.models.domain import (
    Usuario,
    Programa,
    Entrevistado,
    Entrevista,
    Participacao,
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


def hash_password(pw: str) -> str:
    return pwd_context.hash(pw)


async def create_sample_data():
    # Ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as session:
        # --------- Users ---------
        users = [
            Usuario(
                nome_completo="Admin User",
                email="admin@example.com",
                senha_hash=hash_password("admin123"),
                cargo="admin",
                ativo=True,
            ),
            Usuario(
                nome_completo="Produtor 1",
                email="produtor1@example.com",
                senha_hash=hash_password("prod123"),
                cargo="produtor",
                ativo=True,
            ),
            Usuario(
                nome_completo="Jornalista 1",
                email="jornalista1@example.com",
                senha_hash=hash_password("jornal123"),
                cargo="jornalista",
                ativo=True,
            ),
        ]
        session.add_all(users)

        # --------- Programs ---------
        programs = [
            Programa(nome="Programa A", descricao="Programa teste A", ativo=True),
            Programa(nome="Programa B", descricao="Programa teste B", ativo=True),
            Programa(nome="Programa C", descricao="Programa teste C", ativo=True),
        ]
        session.add_all(programs)

        # --------- Interviewees ---------
        areas = ["Política", "Tecnologia", "Cultura", "Saúde"]
        interviewees = [
            Entrevistado(
                nome_completo=f"Entrevistado {i}",
                telefone=f"+55{random.randint(100000000, 999999999)}",
                email=f"entrevistado{i}@example.com",
                area_atuacao=random.choice(areas),
                instituicao="Instituto X",
                temas="Tema geral",
                autorizacao_imagem_voz=True,
                ativo=True,
                criado_em=datetime.utcnow(),
            )
            for i in range(1, 11)
        ]
        session.add_all(interviewees)

        await session.flush()  # obtain IDs for FK relations

        # --------- Interviews ---------
        interviews = []
        for i in range(1, 16):
            entrevistado = random.choice(interviewees)
            programa = random.choice(programs)
            usuario = random.choice(users)
            interview = Entrevista(
                entrevistado_id=entrevistado.id,
                programa_id=programa.id,
                usuario_id=usuario.id,
                data_hora=datetime.utcnow() + timedelta(days=i),
                status=random.choice(["agendada", "confirmada", "realizada", "cancelada"]),
                notas=f"Nota da entrevista {i}",
            )
            interviews.append(interview)
        session.add_all(interviews)
        await session.flush()

        # --------- Participations ---------
        participations = []
        for i in range(1, 21):
            entrevista = random.choice(interviews)
            entrevistado = random.choice(interviewees)
            programa = random.choice(programs)
            usuario = random.choice(users)
            participation = Participacao(
                entrevista_id=entrevista.id,
                entrevistado_id=entrevistado.id,
                programa_id=programa.id,
                usuario_id=usuario.id,
                data_hora=datetime.utcnow() - timedelta(days=i),
                duracao_minutos=random.randint(30, 120),
                tema_abordado="Tema abordado",
                audiencia_estimada=random.randint(100, 1000),
                observacoes="Observação aleatória",
            )
            participations.append(participation)
        session.add_all(participations)

        await session.commit()
        print(
            f"Inserted: {len(users)} users, {len(programs)} programs, "
            f"{len(interviewees)} interviewees, {len(interviews)} interviews, "
            f"{len(participations)} participations."
        )


if __name__ == "__main__":
    asyncio.run(create_sample_data())

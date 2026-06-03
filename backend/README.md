# Backend - SURTE

Este diretório contém a API RESTful responsável pela lógica de negócio do SURTE.

Resumo:
- Implementação em Python com FastAPI.
- Autenticação via JWT; segurança com Passlib/bcrypt.
- Modelos de dados com SQLAlchemy e validação com Pydantic.

Estrutura sugerida:
- `main.py` / `app/` - ponto de entrada e rotas.
- `models/` - modelos SQLAlchemy.
- `schemas/` - Pydantic schemas.
- `auth/` - lógica de autenticação e utilitários JWT.

Como rodar (exemplo):

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Notas:
- Consulte o README raiz para visão geral do projeto e da stack: ../README.md
- Os diagramas e scripts de definição de dados estão em `../database`.

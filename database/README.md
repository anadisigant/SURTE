# Database - SURTE

Este diretório reúne os artefatos de modelagem do SURTE: diagramas, scripts DDL e instruções relacionadas à persistência.

Conteúdo esperado:
- Diagramas ER/relacionais (PNG, SVG ou drawio).
- Scripts de criação de esquema (DDL) para SQLite.
- Notas sobre migrações e seed data.

Uso e referências:
- Revise os diagramas antes de alterar os modelos no `backend`.
- Para recriar o banco SQLite localmente, execute os scripts DDL presentes aqui.

Exemplo simples:

```bash
cd database
sqlite3 surte.db < schema.sql
```

Notas:
- O backend usa SQLAlchemy; mantenha os modelos sincronizados com os diagramas.
- Consulte o README raiz para visão geral do projeto: ../README.md

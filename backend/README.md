# SURTE - Backend

Este é o backend do projeto SURTE, desenvolvido para a UESB utilizando FastAPI e PostgreSQL. A arquitetura segue rigorosamente os princípios de Domain-Driven Design (DDD) adaptados para uma Arquitetura em Camadas (Layered Architecture), focando em escalabilidade, segurança e fácil manutenção.

---

## Pré-requisitos

Para trabalhar neste projeto, certifique-se de ter as seguintes ferramentas instaladas em sua máquina:

- Git (Para controle de versão)
- Python 3.11+ (Versão homologada para a stack assíncrona)
- PostgreSQL 14+ e um gerenciador visual de sua escolha (DBeaver, pgAdmin, etc.)
- Docker e Docker Compose (Opcional, mas recomendado)

---

## Estrutura do Projeto (Monorepo)

O projeto SURTE unifica todas as frentes de desenvolvimento. A estrutura relevante para o Backend está organizada da seguinte forma:
```bash
.
├── backend/                  # Aplicação principal (FastAPI)
│   ├── app/
│   │   ├── api/v1/routers/   # Endpoints HTTP (validação Pydantic e resposta)
│   │   ├── core/             # Configurações e segurança (JWT, Bcrypt)
│   │   ├── db/               # Configuração da Base e Sessão do SQLAlchemy
│   │   ├── models/           # Modelos ORM (Mapeamento do PostgreSQL)
│   │   ├── repositories/     # Acesso isolado ao banco de dados (async)
│   │   ├── schemas/          # Modelos Pydantic (DTOs de request/response)
│   │   ├── services/         # Regras de Negócio e exceções HTTP
│   │   └── main.py           # Ponto de entrada da aplicação
│   ├── Dockerfile
│   └── requirements.txt
├── database/                 # Estrutura de Banco de Dados
│   └── scripts/              # Scripts SQL (01-create, 02-insert, 03-consultas)
├── docs/                     # Artefatos e Modelagem (MER, BPMN)
├── frontend/                 # Aplicação Cliente
└── docker-compose.yml        # Orquestração dos contêineres do projeto
``` 

Nota: Use essa estrutura como referência. Ao criar novas entidades, respeite a separação de pastas no `backend/app/`. Em caso de dúvida, revise a seção [Regras de Arquitetura](#regras-de-arquitetura-obrigatório).

---

## Configuração Base

Antes de iniciar o servidor por qualquer método (Docker ou Local), é obrigatório configurar as variáveis de ambiente.

1. Clone o repositório e acesse a pasta do backend:
   ```bash
   git clone <url-do-repositorio>
   cd SURTE/backend 
   ```

2. Crie um arquivo chamado `.env` dentro da pasta `backend` com o seguinte formato:

```env
PROJECT_NAME="SURTE API"
API_V1_STR="/api/v1"

# Chave para assinatura dos tokens JWT (gere uma string segura)
# Exemplo para gerar no terminal: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY="sua_chave_super_secreta_gerada_aqui"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=600

# Conexão com o Banco de Dados (Ajuste conforme o método de execução escolhido abaixo)
DATABASE_URL="postgresql+asyncpg://postgres:sua_senha@localhost:5432/surte_db"

```



---
## Opção A: Execução via Docker (Recomendada)

A  infraestrutura Docker já está totalmente configurada para injetar as variáveis de ambiente necessárias e executar os scripts de banco de dados automaticamente na primeira inicialização. O Docker garante que o ambiente seja idêntico para todos os desenvolvedores.

### Passo a Passo

1. Navegue até a raiz do projeto (onde está localizado o arquivo `docker-compose.yml`):
   
   ```bash
   cd SURTE 
   ```


2. Inicie a construção das imagens e suba os contêineres em segundo plano:

```bash
    docker compose up --build -d
```


3. **O que acontece nos bastidores?**
* O contêiner `db` (PostgreSQL) será iniciado. Na primeira execução, ele lerá os arquivos da pasta `./database/scripts/` e criará as tabelas e a carga inicial automaticamente.
* O contêiner `backend` construirá a imagem baseada no `Dockerfile` (Python 3.10-slim), instalará as dependências e iniciará o Uvicorn na porta 8000.
* O `docker-compose.yml` injeta automaticamente a `DATABASE_URL` correta para a comunicação interna da rede Docker e a `SECRET_KEY`.


4. Validação:
Aguarde alguns segundos e acesse a documentação interativa no seu navegador para confirmar que a API está rodando e conectada ao banco:
[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
5. Para visualizar os logs da aplicação em tempo real (em caso de erros):
```bash
docker logs -f surte_backend

```


6. Para parar a execução e desligar os contêineres:
```bash
docker compose down

```


*(Nota: O volume `pgdata` garante que os dados do seu banco não sejam perdidos entre as reinicializações).*



---

## Opção B: Execução Local Sem Docker (Modo de Desenvolvimento)

Ideal para desenvolver ativamente, instalar novas bibliotecas ou utilizar o debugger da sua IDE.

### 1. Configurar o Banco de Dados

1. Crie um banco de dados vazio chamado `surte_db` no seu PostgreSQL local.
2. Navegue até a pasta `database/scripts/` (na raiz do projeto) e execute o `01-script-create.sql` no seu banco de dados para criar as tabelas e os tipos nativos (Enums).
3. Execute o `02-script-insert.sql` para popular o banco com as informações iniciais (ex: Usuário Administrador de teste).

### 2. Criar e Ativar o Ambiente Virtual

É essencial isolar as dependências do projeto do seu sistema operacional. Acesse a pasta `backend/` e execute:

No Linux / macOS:

```bash
python -m venv venv
source venv/bin/activate

```

No Windows (PowerShell):

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1

```

### 3. Instalar Dependências e Iniciar a Aplicação

Com o ambiente virtual ativado na pasta `backend/`:

```bash
pip install -r requirements.txt

```

Ajuste a `DATABASE_URL` no seu `.env` para apontar para o seu banco local (`@localhost:5432`) e inicie o servidor:

```bash
uvicorn app.main:app --reload

```

O servidor ficará ativo e acessível na porta 8000.

---

## Como Testar a API

### Documentação Automática (Swagger UI)

O FastAPI gera a documentação interativa automaticamente:

1. Acesse: http://127.0.0.1:8000/docs
2. Clique no botão "Authorize" (ícone de cadeado).
3. Insira as credenciais geradas pelo `02-script-insert.sql`.
4. Navegue pelos endpoints, clique em "Try it out" e execute as rotas diretamente no navegador.

### Ferramentas Externas (Postman / Insomnia)

Para testes complexos, aplique as boas práticas da equipe:

* Organize os testes em uma Collection separada por pastas (Auth, Usuários, Entrevistados, Entrevistas, etc.).
* Utilize Environments para variáveis globais (ex: `{{base_url}} = http://localhost:8000/api/v1`).
* Automatize a captura do `access_token` no login para injetar automaticamente na aba de Bearer Token em todas as rotas protegidas.

---

## Regras de Arquitetura (Obrigatório)

O projeto baseia-se em um fluxo unidirecional rígido para manter a separação de responsabilidades:

1. Routers (app/api/v1/routers/): Apenas recebem requisições HTTP, delegam a validação aos Schemas Pydantic e devolvem a resposta. Não contêm regras de negócio nem consultas SQL.
2. Services (app/services/): Concentram 100% das Regras de Negócio (RNs) do SURTE e levantam as exceções HTTP (ex: 409 Conflict, 403 Forbidden, 422 Unprocessable Entity) em caso de violação de regra.
3. Repositories (app/repositories/): Isolam totalmente o acesso ao banco de dados utilizando o SQLAlchemy. Operações puramente assíncronas. Retornam apenas dados brutos, modelos ou None. Nunca lançam exceções HTTP.
4. Git Flow e Commits: Todo código novo deve ser criado em uma branch isolada (ex: `feature/nova-rota`) e integrado via Pull Request (PR) utilizando Conventional Commits (ex: `feat:`, `fix:`, `chore:`). É estritamente proibido fazer push direto nas branches `main` e `develop`.


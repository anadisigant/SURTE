# SURTE - Backend API 

Este é o backend do sistema SURTE (Sistema para Registo de Entrevistados), desenvolvido para a UESB utilizando **FastAPI** e **PostgreSQL**. A arquitetura segue os princípios de DDD (Domain-Driven Design) em camadas, focando em escalabilidade, segurança e fácil manutenção.

##  Pré-requisitos

Antes de iniciar, certifique-se de que tem instalado na sua máquina:
- **Python 3.10+** (Testado e homologado para a versão 3.14)
- **PostgreSQL 14+**
- Um gestor de base de dados à sua escolha (DBeaver, pgAdmin, etc.)

##  Passo a Passo para Instalação Local

### 1. Clonar e aceder à pasta
```bash
git clone <url-do-repositorio>
cd SURTE/backend

```

### 2. Criar e Ativar o Ambiente Virtual (Virtualenv)

Para garantir a integridade das versões homologadas, isole o projeto do seu sistema operativo local:

**No Linux / macOS (Arch/Ubuntu/etc):**

```bash
python -m venv venv
source venv/bin/activate

```

**No Windows (PowerShell):**

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1

```

### 3. Instalar as Dependências (Versões Congeladas)

Com o ambiente virtual ativado (indicado por `(venv)` no terminal), instale os pacotes exatamente como definidos no ficheiro `requirements.txt`:

```bash
pip install -r requirements.txt

```

### 4. Configurar Variáveis de Ambiente (.env)

O sistema exige chaves de segurança e configurações de conexão para arrancar. Crie um ficheiro chamado `.env` na raiz da pasta `backend`:

*Exemplo de `.env`:*

```env
# Conexão com o PostgreSQL local
DATABASE_URL=postgresql://postgres:sua_senha_aqui@localhost:5432/surte_db

# Chave para assinatura dos tokens JWT (gere uma string aleatória forte)
SECRET_KEY=sua_chave_super_secreta_gerada_aqui

```

*(Dica: Para gerar uma chave segura no terminal Linux/Mac, execute: `python -c "import secrets; print(secrets.token_hex(32))"`)*

### 5. Configurar a Base de Dados

1. Crie uma base de dados vazia chamada `surte_db` no seu PostgreSQL.
2. Navegue até à pasta `database/scripts/` na raiz do projeto (fora do backend).
3. Execute o script `script-create.sql` na sua base de dados para criar as tabelas e os *Enums*.
4. Execute o script `script-insert.sql` para popular a base de dados com as informações iniciais, como o utilizador Administrador padrão.

### 6. Arrancar o Servidor de Desenvolvimento

Ainda com o ambiente virtual ativado e dentro da pasta `backend`, inicie o servidor:

```bash
uvicorn app.main:app --reload

```

O servidor ficará ativo e acessível na porta `8000`.

## 🧪 Como Testar a API (Swagger UI)

O FastAPI gera automaticamente a documentação interativa Open API (Swagger), dispensando o uso de ferramentas externas como o Postman para testes básicos.

1. Aceda a: **http://127.0.0.1:8000/docs**
2. Clique no botão verde **"Authorize"** no topo da ecrã (ícone de cadeado).
3. Insira as credenciais inseridas pelo `script-insert.sql` (ex: `admin@uesb.br` e `admin123`).
4. Após o login, navegue pelos *endpoints* (por exemplo: `POST /api/v1/entrevistados`), clique em *Try it out*, edite o JSON e teste as rotas de forma visual.


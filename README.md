# SURTE - Sistema para Registro de Entrevistados (UESB)

O **SURTE** é uma solução estratégica desenvolvida para a **Universidade Estadual do Sudoeste da Bahia (UESB)**. Seu objetivo é centralizar e profissionalizar a gestão de fontes e especialistas para o sistema de Rádio e Televisão da universidade, garantindo agilidade na produção jornalística e conformidade rigorosa com a **LGPD (Lei nº 13.709/2018)**.

## Estrutura do Repositório

O projeto é organizado de forma modular para separar as responsabilidades de interface, lógica de negócio e persistência de dados:

  * **`/backend`**: API RESTful desenvolvida em **Python** com **FastAPI**. Contém a lógica de autenticação (JWT), modelos de dados (SQLAlchemy) e as rotas de gerenciamento.
  * **`/frontend`**: Aplicação **Single Page Application (SPA)** construída com **React** e **Tailwind CSS**. Focada em uma interface amigável e responsiva para produtores e jornalistas.
  * **`/database`**: Central de artefatos de modelagem. Contém os modelos lógicos, diagramas relacionais e scripts de definição de dados (DDL) para o **SQLite**.

## Stack Tecnológica

### Frontend

  * **React** (Framework SPA)
  * **Tailwind CSS** (Estilização Utilitária)
  * **Axios** (Comunicação via HTTP)
  * **React Router** (Gestão de Navegação)

### Backend

  * **Python** (Linguagem Principal)
  * **FastAPI** (Framework de Alta Performance)
  * **Uvicorn** (Servidor ASGI)
  * **SQLAlchemy** (ORM para persistência)
  * **Pydantic** (Validação de Dados)
  * **JWT / Passlib (bcrypt)** (Segurança e Criptografia)

### Database

  * **SQLite** (Banco de dados relacional local)

## Requisitos do Sistema

O desenvolvimento foca em atender aos seguintes requisitos essenciais identificados:

  * **\[RF001\] Cadastrar Entrevistado**: Registro completo incluindo temas de especialidade e vínculos institucionais.
  * **\[RF002\] Editar/Atualizar Entrevistado**: Manutenção de dados de contato e status de autorização.
  * **Gestão de Autorizações**: Controle do termo de consentimento para uso de imagem e voz.
  * **\[NF001\] Interface Amigável**: Design pensado para agilizar o fluxo operacional dos jornalistas.

## Como Iniciar

### 1\. Modelagem de Dados

Os diagramas e especificações relacionais estão disponíveis em `/database` para consulta antes da implementação.

### 2\. Configuração do Backend

``` bash
cd backend
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

```

### 3\. Configuração do Frontend

``` bash
cd frontend
npm install
npm run dev
```

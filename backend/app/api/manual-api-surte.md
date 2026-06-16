# Manual de Testes — API SURTE
Base URL: `http://localhost:8000/api/v1`

> **Autenticação:** Todas as rotas (exceto login) exigem header:
> `Authorization: Bearer <access_token>`

---

## 1. Autenticação

### POST `/auth/login`
Obtém o token JWT.

- **Body:** `x-www-form-urlencoded`

| Key | Value |
|-----|-------|
| username | admin@surte.com |
| password | senha123 |

**Resposta esperada (200):**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

---

## 2. Entrevistados

### POST `/entrevistados/`
Cadastra um novo entrevistado.

- **Body:** `raw JSON`

```json
{
  "nome_completo": "João Silva",
  "area_atuacao": "Tecnologia",
  "temas": "Inteligência artificial, machine learning",
  "email": "joao.silva@email.com",
  "telefone": "+5571999990000",
  "instituicao": "UESB",
  "autorizacao_imagem_voz": true
}
```

**Resposta esperada (201):**
```json
{
  "id": 1,
  "nome_completo": "João Silva",
  "area_atuacao": "Tecnologia",
  ...
}
```

---

### GET `/entrevistados/{id}`
Busca um entrevistado pelo ID.

- **URL:** `http://localhost:8000/api/v1/entrevistados/1`
- **Body:** nenhum

**Resposta esperada (200):**
```json
{
  "id": 1,
  "nome_completo": "João Silva",
  "area_atuacao": "Tecnologia",
  "temas": "Inteligência artificial, machine learning",
  "email": "joao.silva@email.com",
  "ativo": true
}
```

**Erro (404):**
```json
{ "detail": "Entrevistado ID 99 não encontrado ou inativo." }
```

---

## 3. Programas

### POST `/programas/`
Cria um novo programa.

- **Body:** `raw JSON`

```json
{
  "nome": "UESB em Pauta",
  "descricao": "Programa semanal de entrevistas com especialistas"
}
```

**Resposta esperada (201):**
```json
{
  "id": 1,
  "nome": "UESB em Pauta",
  "descricao": "Programa semanal de entrevistas com especialistas",
  "ativo": true
}
```

---

### GET `/programas/`
Lista todos os programas ativos.

- **URL:** `http://localhost:8000/api/v1/programas/`
- **Body:** nenhum

**Resposta esperada (200):**
```json
[
  {
    "id": 1,
    "nome": "UESB em Pauta",
    "ativo": true
  }
]
```

---

### GET `/programas/{id}`
Busca um programa pelo ID.

- **URL:** `http://localhost:8000/api/v1/programas/1`
- **Body:** nenhum

**Resposta esperada (200):**
```json
{
  "id": 1,
  "nome": "UESB em Pauta",
  "descricao": "Programa semanal de entrevistas com especialistas",
  "ativo": true
}
```

---

### DELETE `/programas/{id}`
Inativa (soft delete) um programa.

- **URL:** `http://localhost:8000/api/v1/programas/1`
- **Body:** nenhum

**Resposta esperada (200 ou 204):**
```json
{ "detail": "Programa removido com sucesso." }
```

**Erro (404):**
```json
{ "detail": "Programa não encontrado." }
```

---

## 4. Usuários

### GET `/usuarios/`
Lista todos os usuários cadastrados.

- **URL:** `http://localhost:8000/api/v1/usuarios/`
- **Body:** nenhum

**Resposta esperada (200):**
```json
[
  {
    "id": 1,
    "nome_completo": "Carlos Admin",
    "email": "admin@surte.com",
    "cargo": "admin",
    "ativo": true
  }
]
```

---

### GET `/usuarios/me`
Retorna os dados do usuário autenticado (dono do token).

- **URL:** `http://localhost:8000/api/v1/usuarios/me`
- **Body:** nenhum

**Resposta esperada (200):**
```json
{
  "id": 1,
  "nome_completo": "Carlos Admin",
  "email": "admin@surte.com",
  "cargo": "admin",
  "ativo": true
}
```

---

### POST `/usuarios/`
Cria um novo usuário (apenas admin).

- **Body:** `raw JSON`

```json
{
  "nome_completo": "Nova Jornalista",
  "email": "nova.j@surte.com",
  "senha": "senha123",
  "cargo": "jornalista"
}
```

Valores válidos para `cargo`:
- `admin`
- `produtor`
- `jornalista`
- `apresentador`
- `tecnico_programacao`

**Resposta esperada (201):**
```json
{
  "id": 10,
  "nome_completo": "Nova Jornalista",
  "email": "nova.j@surte.com",
  "cargo": "jornalista",
  "ativo": true
}
```

---

## 5. Entrevistas

### POST `/entrevistas/`
Agenda uma nova entrevista.

- **Body:** `raw JSON`

```json
{
  "entrevistado_id": 1,
  "programa_id": 1,
  "data_hora_inicio": "2026-07-01T10:00:00Z",
  "data_hora_fim": "2026-07-01T11:00:00Z",
  "notas": "Entrevista sobre IA na educação"
}
```

> `data_hora_inicio` deve ser anterior a `data_hora_fim`.
> O mesmo entrevistado não pode ter dois agendamentos sobrepostos (RN02).

**Resposta esperada (201):**
```json
{
  "id": 1,
  "entrevistado_id": 1,
  "programa_id": 1,
  "status": "agendada",
  "data_hora_inicio": "2026-07-01T10:00:00Z",
  "data_hora_fim": "2026-07-01T11:00:00Z"
}
```

**Erro de conflito (409):**
```json
{ "detail": "O entrevistado já possui uma entrevista agendada que sobrepõe este horário." }
```

---

### PATCH `/entrevistas/{id}/status`
Atualiza o status de uma entrevista agendada.

- **URL:** `http://localhost:8000/api/v1/entrevistas/1/status`
- **Body:** `raw JSON`

```json
{
  "status": "realizada"
}
```

Valores válidos para `status`:
- `realizada`
- `cancelada`

> Só é possível transicionar a partir de `agendada` (RN04).
> Ao marcar como `realizada`, uma `Participacao` é gerada automaticamente no histórico.

**Resposta esperada (200):**
```json
{
  "id": 1,
  "status": "realizada"
}
```

**Erro de transição inválida (422):**
```json
{ "detail": "Não é possível alterar o status de uma entrevista que já está 'realizada'." }
```

---

## Fluxo sugerido de testes

1. `POST /auth/login` → obter token
2. `POST /programas/` → criar programa
3. `POST /entrevistados/` → criar entrevistado
4. `GET /entrevistados/1` → verificar cadastro
5. `POST /entrevistas/` → agendar entrevista
6. `PATCH /entrevistas/1/status` → marcar como realizada
7. `GET /usuarios/me` → verificar usuário logado
8. `POST /usuarios/` → criar novo usuário
9. `GET /usuarios/` → listar todos
10. `DELETE /programas/1` → inativar programa

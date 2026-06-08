-- Reset do ambiente de forma limpa e segura (Idempotência)
DROP TABLE IF EXISTS audit_logins    CASCADE;
DROP TABLE IF EXISTS participacoes   CASCADE;
DROP TABLE IF EXISTS entrevistas     CASCADE;
DROP TABLE IF EXISTS entrevistados   CASCADE;
DROP TABLE IF EXISTS programas       CASCADE;
DROP TABLE IF EXISTS usuarios        CASCADE;

DROP TYPE IF EXISTS entrevista_status    CASCADE;
DROP TYPE IF EXISTS usuario_cargo        CASCADE;
DROP TYPE IF EXISTS audit_evento         CASCADE;

-- ----------------------------------------------------------------------------
-- 1. CRIAÇÃO DE ENUMS NATIVOS (Garante validação a nível de engine)
-- ----------------------------------------------------------------------------

-- [RN-FIX-02] Adicionados 'apresentador' e 'tecnico_programacao' para cobrir
-- todos os perfis definidos em RF018 e viabilizar RBAC (NF008).
CREATE TYPE usuario_cargo AS ENUM (
    'admin',
    'produtor',
    'jornalista',
    'apresentador',         -- novo: RF018
    'tecnico_programacao'   -- novo: RF018
);

-- [RN-FIX-01] Adicionado 'confirmada' para cobrir o fluxo de confirmação
-- de presença antes da entrevista, exigido em RF012.
CREATE TYPE entrevista_status AS ENUM (
    'agendada',
    'confirmada',   -- novo: RF012
    'realizada',
    'cancelada'
);

-- Enum para eventos de auditoria de login (RF020/NF010)
CREATE TYPE audit_evento AS ENUM (
    'login_sucesso',
    'login_falha',
    'logout',
    'sessao_expirada'
);

-- ----------------------------------------------------------------------------
-- 2. TABELA: usuarios
-- ----------------------------------------------------------------------------
CREATE TABLE usuarios (
    id              SERIAL,
    nome_completo   VARCHAR(255)    NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    senha_hash      VARCHAR(255)    NOT NULL,   -- bcrypt: 60 chars; 255 dá folga para Argon2 futuro
    cargo           usuario_cargo   NOT NULL DEFAULT 'jornalista',
    ativo           BOOLEAN         NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_usuarios          PRIMARY KEY (id),
    CONSTRAINT uq_usuarios_email    UNIQUE (email),
    -- Validação de e-mail mais robusta via regex (substitui LIKE frágil anterior)
    CONSTRAINT ck_usuarios_email    CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$')
);

-- ----------------------------------------------------------------------------
-- 3. TABELA: programas
-- ----------------------------------------------------------------------------
CREATE TABLE programas (
    id          SERIAL,
    nome        VARCHAR(255)    NOT NULL,
    descricao   TEXT,
    ativo       BOOLEAN         NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_programas         PRIMARY KEY (id),
    CONSTRAINT uq_programas_nome    UNIQUE (nome)
);

-- ----------------------------------------------------------------------------
-- 4. TABELA: entrevistados (Banco de Fontes)
-- ----------------------------------------------------------------------------
CREATE TABLE entrevistados (
    id                      SERIAL,
    nome_completo           VARCHAR(255)    NOT NULL,
    telefone                VARCHAR(20),
    email                   VARCHAR(255),
    area_atuacao            VARCHAR(150)    NOT NULL,
    instituicao             VARCHAR(255),
    temas                   TEXT            NOT NULL,
    -- [RN-FIX-04] Coluna gerada automaticamente para Full-Text Search em 'temas'.
    -- Substitui ILIKE '%...%' (full table scan) por índice GIN (O(log n)).
    temas_tsv               TSVECTOR        GENERATED ALWAYS AS (
                                to_tsvector('portuguese', temas)
                            ) STORED,
    autorizacao_imagem_voz  BOOLEAN         NOT NULL DEFAULT FALSE,
    ativo                   BOOLEAN         NOT NULL DEFAULT TRUE,
    criado_em               TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_entrevistados             PRIMARY KEY (id),
    CONSTRAINT uq_entrevistados_email       UNIQUE (email),
    -- NULL é permitido (email opcional); regex aplicada apenas quando preenchido
    CONSTRAINT ck_entrevistados_email       CHECK (
        email IS NULL OR email ~ '^[^@]+@[^@]+\.[^@]+$'
    )
);

-- ----------------------------------------------------------------------------
-- 5. TABELA: entrevistas  (Agendamentos — separada de Participações)
-- Responsabilidade única: ciclo de vida do agendamento (RF010, RF011, RF012).
-- Dados de execução da entrevista ficam em 'participacoes' (RF013).
-- ----------------------------------------------------------------------------
CREATE TABLE entrevistas (
    id              SERIAL,
    entrevistado_id INT                 NOT NULL,
    programa_id     INT                 NOT NULL,
    usuario_id      INT                 NOT NULL,
    data_hora       TIMESTAMPTZ         NOT NULL,
    status          entrevista_status   NOT NULL DEFAULT 'agendada',
    notas           TEXT,
    criado_em       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_entrevistas PRIMARY KEY (id),

    -- RN03: ON DELETE RESTRICT impede deleção física caso haja histórico vinculado
    CONSTRAINT fk_entrevistas_entrevistado  FOREIGN KEY (entrevistado_id)
        REFERENCES entrevistados(id) ON DELETE RESTRICT,
    CONSTRAINT fk_entrevistas_programa      FOREIGN KEY (programa_id)
        REFERENCES programas(id) ON DELETE RESTRICT,
    CONSTRAINT fk_entrevistas_usuario       FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 6. TABELA: participacoes  [RN-FIX-03] — NOVA
-- Responsabilidade: registro do que de fato aconteceu na entrevista.
-- Pode originar de um agendamento existente (entrevista_id) ou ser avulsa (NULL).
-- Atende RF013, RF014, RF015 e o campo 'audiencia_estimada' ausente no modelo anterior.
-- ----------------------------------------------------------------------------
CREATE TABLE participacoes (
    id                  SERIAL,
    -- FK opcional: NULL = registro avulso (FA1 do RF013); preenchido = originado de agendamento
    entrevista_id       INT,
    entrevistado_id     INT         NOT NULL,
    programa_id         INT         NOT NULL,
    usuario_id          INT         NOT NULL,   -- quem registrou
    data_hora           TIMESTAMPTZ NOT NULL,
    duracao_minutos     SMALLINT    CHECK (duracao_minutos > 0),
    tema_abordado       TEXT        NOT NULL,
    audiencia_estimada  INT         CHECK (audiencia_estimada >= 0),
    observacoes         TEXT,
    criado_em           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_participacoes             PRIMARY KEY (id),
    CONSTRAINT fk_participacoes_entrevista  FOREIGN KEY (entrevista_id)
        REFERENCES entrevistas(id) ON DELETE SET NULL,
    CONSTRAINT fk_participacoes_entrevistado FOREIGN KEY (entrevistado_id)
        REFERENCES entrevistados(id) ON DELETE RESTRICT,
    CONSTRAINT fk_participacoes_programa    FOREIGN KEY (programa_id)
        REFERENCES programas(id) ON DELETE RESTRICT,
    CONSTRAINT fk_participacoes_usuario     FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 7. TABELA: audit_logins  [RN-FIX-05] — NOVA
-- Responsabilidade: log de autenticação para auditoria (RF020, NF010).
-- Registra sucesso, falha, logout e expiração de sessão.
-- INET nativo do PostgreSQL armazena IPv4 e IPv6 sem overhead de VARCHAR.
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logins (
    id          SERIAL,
    usuario_id  INT             NOT NULL,
    evento      audit_evento    NOT NULL,
    ip_address  INET,
    user_agent  VARCHAR(512),
    criado_em   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_audit_logins          PRIMARY KEY (id),
    CONSTRAINT fk_audit_logins_usuario  FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- 8. ENGENHARIA DE ÍNDICES
-- ----------------------------------------------------------------------------

-- [original] Otimização do Login O(log n) — índice parcial apenas em ativos
CREATE INDEX idx_usuarios_email_ativo
    ON usuarios (email)
    WHERE ativo = TRUE;

-- [original] B-Tree para filtros compostos por área + nome (auto-complete)
CREATE INDEX idx_entrevistados_busca_composta
    ON entrevistados (area_atuacao, nome_completo)
    WHERE ativo = TRUE;

-- [RN-FIX-04] GIN para Full-Text Search em 'temas' — substitui ILIKE full scan
CREATE INDEX idx_entrevistados_temas_fts
    ON entrevistados USING GIN(temas_tsv);

-- [original] Performance do Dashboard e agenda diária
CREATE INDEX idx_entrevistas_data_status
    ON entrevistas (data_hora, status);

-- [original] FKs indexadas para JOINs frequentes em entrevistas
CREATE INDEX idx_entrevistas_fk_entrevistado ON entrevistas (entrevistado_id);
CREATE INDEX idx_entrevistas_fk_programa     ON entrevistas (programa_id);

-- [novo] FKs indexadas para JOINs frequentes em participacoes
CREATE INDEX idx_participacoes_fk_entrevistado  ON participacoes (entrevistado_id);
CREATE INDEX idx_participacoes_fk_programa      ON participacoes (programa_id);
CREATE INDEX idx_participacoes_data             ON participacoes (data_hora DESC);

-- [novo] Auditoria: busca rápida de eventos por usuário e por período
CREATE INDEX idx_audit_logins_usuario_data
    ON audit_logins (usuario_id, criado_em DESC);

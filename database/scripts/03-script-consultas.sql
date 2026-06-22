-- ----------------------------------------------------------------------------
-- CONSULTA 1: Autenticação Base
-- Service de segurança: valida credenciais e retorna dados para geração do JWT.
-- Usa idx_usuarios_email_ativo (índice parcial WHERE ativo = TRUE) → O(log n).
-- ----------------------------------------------------------------------------
SELECT id, nome_completo, senha_hash, cargo
FROM usuarios
WHERE email = 'mariana.p@surte.com'
  AND ativo = TRUE;


-- ----------------------------------------------------------------------------
-- CONSULTA 2: Busca Avançada no Banco de Fontes  [RN-FIX-04]
-- Migração de ILIKE '%...%' (full table scan) para Full-Text Search com GIN index.
-- Combina filtro exato em area_atuacao (B-Tree) com FTS em temas (GIN).
-- Para uso dinâmico no backend: substitua o literal pelo parâmetro da query.
-- ----------------------------------------------------------------------------

-- 2a. Busca somente por área (usa idx_entrevistados_busca_composta)
SELECT id, nome_completo, area_atuacao, instituicao, temas
FROM entrevistados
WHERE ativo = TRUE
  AND area_atuacao = 'Tecnologia'
ORDER BY nome_completo ASC;

-- 2b. Busca por palavra-chave em temas (usa idx_entrevistados_temas_fts / GIN)
SELECT id, nome_completo, area_atuacao, instituicao, temas
FROM entrevistados
WHERE ativo = TRUE
  AND temas_tsv @@ plainto_tsquery('portuguese', 'inteligência artificial')
ORDER BY nome_completo ASC;

-- 2c. Busca combinada: área OU palavra-chave (união dos dois índices via OR)
SELECT id, nome_completo, area_atuacao, instituicao, temas
FROM entrevistados
WHERE ativo = TRUE
  AND (
      area_atuacao = 'Tecnologia'
      OR temas_tsv @@ plainto_tsquery('portuguese', 'inteligência artificial')
  )
ORDER BY nome_completo ASC;


-- ----------------------------------------------------------------------------
-- CONSULTA 3: RN02 — Detecção de Conflito de Grade
-- Backend executa este SELECT antes de salvar qualquer agendamento.
-- Verifica se o entrevistado (ID: 2) já possui agendamento/confirmação em
-- uma janela de ±1 hora ao redor do horário pretendido.
-- Status 'cancelada' e 'realizada' não bloqueiam o slot.
-- ----------------------------------------------------------------------------
SELECT id, data_hora, programa_id, status
FROM entrevistas
WHERE entrevistado_id = 2
  AND status IN ('agendada', 'confirmada')   -- inclui novo status 'confirmada'
  AND data_hora >= '2026-06-10 14:30:00-03'::TIMESTAMPTZ - INTERVAL '1 hour'
  AND data_hora <= '2026-06-10 14:30:00-03'::TIMESTAMPTZ + INTERVAL '1 hour';


-- ----------------------------------------------------------------------------
-- CONSULTA 4: Dashboard — Distribuição de Participações por Área Temática
-- Alimenta gráfico de pizza/barras do RF016.
-- Usa tabela 'participacoes' (ao invés de 'entrevistas') — dado real de execução.
-- ----------------------------------------------------------------------------
SELECT
    e.area_atuacao,
    COUNT(p.id)         AS total_participacoes,
    SUM(p.duracao_minutos) AS total_minutos_ao_ar
FROM participacoes p
INNER JOIN entrevistados e ON p.entrevistado_id = e.id
GROUP BY e.area_atuacao
ORDER BY total_participacoes DESC;


-- ----------------------------------------------------------------------------
-- CONSULTA 5: Análise de Fadiga de Fonte
-- Lista especialistas com 2+ participações realizadas nos últimos 30 dias.
-- Sinal de alerta para equipe de produção evitar repetição excessiva.
-- Usa tabela 'participacoes' para dados de execução reais.
-- ----------------------------------------------------------------------------
SELECT
    e.id                AS entrevistado_id,
    e.nome_completo,
    e.instituicao,
    COUNT(p.id)         AS vezes_ao_ar,
    SUM(p.duracao_minutos) AS minutos_ao_ar
FROM participacoes p
INNER JOIN entrevistados e ON p.entrevistado_id = e.id
WHERE p.data_hora >= NOW() - INTERVAL '30 days'
GROUP BY e.id, e.nome_completo, e.instituicao
HAVING COUNT(p.id) >= 2
ORDER BY vezes_ao_ar DESC;


-- ----------------------------------------------------------------------------
-- CONSULTA 6: Agenda Consolidada do Dia
-- Visão completa para a equipe de produção — uma linha por entrevista.
-- Usa idx_entrevistas_data_status. Exclui canceladas da visão de trabalho.
-- ----------------------------------------------------------------------------
SELECT
    ent.id              AS entrevista_id,
    ent.data_hora,
    ent.status,
    p.nome              AS nome_programa,
    e.nome_completo     AS nome_entrevistado,
    e.telefone          AS contato_entrevistado,
    e.autorizacao_imagem_voz,
    u.nome_completo     AS agendado_por
FROM entrevistas ent
INNER JOIN programas    p ON ent.programa_id     = p.id
INNER JOIN entrevistados e ON ent.entrevistado_id = e.id
INNER JOIN usuarios     u ON ent.usuario_id      = u.id
WHERE ent.data_hora::DATE = '2026-06-10'::DATE
  AND ent.status != 'cancelada'
ORDER BY ent.data_hora ASC;


-- ----------------------------------------------------------------------------
-- CONSULTA 7: Histórico de Participações por Entrevistado  [RN-FIX-03]
-- RF014 — exibe cronologia completa de aparições de uma fonte específica.
-- Ordena por data decrescente conforme exigido na pós-condição do RF014.
-- ----------------------------------------------------------------------------
SELECT
    p.id                AS participacao_id,
    p.data_hora,
    prog.nome           AS programa,
    p.tema_abordado,
    p.duracao_minutos,
    p.audiencia_estimada,
    u.nome_completo     AS registrado_por
FROM participacoes p
INNER JOIN programas    prog ON p.programa_id  = prog.id
INNER JOIN usuarios     u    ON p.usuario_id   = u.id
WHERE p.entrevistado_id = 2   -- parâmetro: substituir pelo ID do entrevistado
ORDER BY p.data_hora DESC;


-- ----------------------------------------------------------------------------
-- CONSULTA 8: Histórico de Participações por Programa  [RN-FIX-03]
-- RF015 — exibe todas as participações de um programa, com filtro de período.
-- ----------------------------------------------------------------------------
SELECT
    p.id                AS participacao_id,
    p.data_hora,
    e.nome_completo     AS entrevistado,
    e.area_atuacao,
    p.tema_abordado,
    p.duracao_minutos,
    p.audiencia_estimada
FROM participacoes p
INNER JOIN entrevistados e ON p.entrevistado_id = e.id
WHERE p.programa_id = 2    -- parâmetro: substituir pelo ID do programa
  AND p.data_hora BETWEEN '2026-01-01'::DATE AND NOW()   -- parâmetro: período
ORDER BY p.data_hora DESC;


-- ----------------------------------------------------------------------------
-- CONSULTA 9: Auditoria de Logins  [RN-FIX-05]
-- RF020 / NF010 — lista eventos de acesso por usuário no período solicitado.
-- Usa idx_audit_logins_usuario_data.
-- ----------------------------------------------------------------------------
SELECT
    al.criado_em        AS momento,
    u.nome_completo     AS usuario,
    u.cargo,
    al.evento,
    al.ip_address,
    al.user_agent
FROM audit_logins al
INNER JOIN usuarios u ON al.usuario_id = u.id
WHERE al.criado_em >= NOW() - INTERVAL '7 days'
ORDER BY al.criado_em DESC;


-- ----------------------------------------------------------------------------
-- CONSULTA 10: Detecção de Bloqueio por Tentativas — RF020 FE2
-- Identifica usuários com 3+ falhas de login nas últimas 1 hora.
-- O backend usa este resultado para disparar bloqueio temporário e notificar admin.
-- ----------------------------------------------------------------------------
SELECT
    u.id                AS usuario_id,
    u.nome_completo,
    u.email,
    COUNT(al.id)        AS tentativas_falhas,
    MIN(al.criado_em)   AS primeira_tentativa,
    MAX(al.criado_em)   AS ultima_tentativa,
    al.ip_address
FROM audit_logins al
INNER JOIN usuarios u ON al.usuario_id = u.id
WHERE al.evento = 'login_falha'
  AND al.criado_em >= NOW() - INTERVAL '1 hour'
GROUP BY u.id, u.nome_completo, u.email, al.ip_address
HAVING COUNT(al.id) >= 3
ORDER BY tentativas_falhas DESC;


-- ----------------------------------------------------------------------------
-- CONSULTA 11: Listagem de Usuários por Cargo — RBAC  [RN-FIX-01] / NF008
-- Permite ao admin visualizar e auditar usuários por perfil de acesso.
-- Impede inativação do último admin (lógica complementada no service/backend).
-- ----------------------------------------------------------------------------
SELECT
    id,
    nome_completo,
    email,
    cargo,
    ativo,
    criado_em
FROM usuarios
ORDER BY cargo, nome_completo;

-- Valida a regra: deve existir ao menos 1 admin ativo (backend usa este count)
SELECT COUNT(*) AS total_admins_ativos
FROM usuarios
WHERE cargo = 'admin'
  AND ativo = TRUE;


-- ----------------------------------------------------------------------------
-- CONSULTA 12: Dashboard — Indicadores Gerais (cards do RF016)
-- Retorna em uma única query os 4 contadores dos cards do painel administrativo.
-- ----------------------------------------------------------------------------
SELECT
    (SELECT COUNT(*) FROM entrevistados      WHERE ativo = TRUE)                AS total_entrevistados_ativos,
    (SELECT COUNT(*) FROM entrevistas        WHERE status IN ('agendada','confirmada')) AS agendamentos_ativos,
    (SELECT COUNT(*) FROM participacoes)                                         AS total_participacoes,
    (SELECT ROUND(
        COUNT(*) FILTER (WHERE autorizacao_imagem_voz = TRUE)::NUMERIC
        / NULLIF(COUNT(*), 0) * 100, 1
     ) FROM entrevistados WHERE ativo = TRUE)                                   AS taxa_autorizacao_pct;

-- ----------------------------------------------------------------------------
-- 1. USUÁRIOS — cobre todos os 5 perfis do sistema (RF018)
-- Senhas simulando hashes bcrypt ($2b$12$... = 60 chars, custo 12)
-- ----------------------------------------------------------------------------
INSERT INTO usuarios (nome_completo, email, senha_hash, cargo, ativo) VALUES
-- Administrador
('Carlos Admin',            'admin@surte.com',          '$2b$12$FJgGMJiToT8zsELh2CB26O3.j.A2TW.80Cxi9cP4LJIopARWKhJNK', 'admin',                true),
-- Produtores
('Mariana Produtora',       'mariana.p@surte.com',       '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WZKpN', 'produtor',             true),
('Felipe Produtor',         'felipe.p@surte.com',        '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WZKpN', 'produtor',             true),
-- Jornalistas
('Roberto Jornalista',      'roberto.j@surte.com',       '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WZKpN', 'jornalista',           true),
('Larissa Jornalista',      'larissa.j@surte.com',       '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WZKpN', 'jornalista',           true),
-- Apresentadores  [RN-FIX-01]
('Paulo Apresentador',      'paulo.a@surte.com',         '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WZKpN', 'apresentador',         true),
('Camila Apresentadora',    'camila.a@surte.com',        '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WZKpN', 'apresentador',         true),
-- Técnico de Programação  [RN-FIX-01]
('Diego Tecnico',           'diego.t@surte.com',         '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WZKpN', 'tecnico_programacao',  true),
-- Usuário inativo (testa filtro de login e listagem)
('Amanda Ex-Estagiaria',    'amanda.ex@surte.com',       '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WZKpN', 'produtor',             false);

-- ----------------------------------------------------------------------------
-- 2. PROGRAMAS — grade variada, 1 inativo para testar filtros
-- ----------------------------------------------------------------------------
INSERT INTO programas (nome, descricao, ativo) VALUES
('Jornal da Manhã',     'Noticiário matinal focado em política, economia e fatos locais.',                          true),
('SurteTech Podcast',   'Espaço semanal sobre inovação, startups, engenharia de software e IA.',                   true),
('Saúde em Debate',     'Painel com especialistas analisando avanços da medicina e bem-estar.',                     true),
('Cultura Viva',        'Programa de artes, literatura e patrimônio cultural regional.',                            true),
('Educação em Foco',    'Debates sobre políticas educacionais, pedagogia e acesso ao ensino superior.',             true),
('Esporte Total',       'Mesa redonda sobre os campeonatos nacionais e globais.',                                   false);

-- ----------------------------------------------------------------------------
-- 3. ENTREVISTADOS — 10 fontes com perfis variados
--    Cobre: com/sem e-mail, com/sem autorização, ativo/inativo
--    Seed propositalmente rico em temas para testar FTS (temas_tsv / GIN index)
-- ----------------------------------------------------------------------------
INSERT INTO entrevistados
    (nome_completo, telefone, email, area_atuacao, instituicao, temas, autorizacao_imagem_voz, ativo)
VALUES
(
    'Dr. Alexandre Kalache',
    '+5511988887777', 'kalache@longevidade.org',
    'Saúde Pública', 'Centro Internacional de Longevidade',
    'Envelhecimento populacional, geriatria, políticas de saúde, SUS, longevidade ativa',
    true, true
),
(
    'Prof. Dra. Nina da Hora',
    '+5521977776666', 'nina@dahora.tech',
    'Tecnologia', 'Instituto da Hora / PUCRio',
    'Algoritmos, inteligência artificial, ética computacional, inclusão digital, machine learning',
    true, true
),
(
    'Dr. Samuel Pessoa',
    '+5511966665555', 'samuel.pessoa@fgv.br',
    'Economia', 'Fundação Getulio Vargas',
    'Macroeconomia, inflação, teto de gastos, reformas estruturais, PIB, mercado financeiro',
    false, true
),
(
    'Gabriela Prioli',
    '+5511955554444', 'gabriela@prioli.com.br',
    'Direito e Política', 'Analista Independente',
    'Constituição, cenário eleitoral, polarização, direitos civis, democracia',
    true, true
),
(
    'Breno Mello',
    '+5531944443333', 'breno.mello@ufmg.br',
    'Tecnologia', 'UFMG',
    'Cibersegurança, criptografia, redes descentralizadas, linux, open source',
    true, true
),
(
    'Dra. Fátima Oliveira',
    '+5571933332221', 'fatima.o@uesb.br',
    'Educação', 'UESB',
    'Ensino superior, pedagogia universitária, inclusão, acesso ao ensino, ENEM',
    true, true
),
(
    'Prof. Marcus Aurelius',
    '+5571922221110', 'marcus.a@uesb.br',
    'Cultura e Arte', 'UESB / Museu Regional',
    'Patrimônio cultural, literatura regional, identidade baiana, artes plásticas',
    true, true
),
(
    'Dra. Carla Mendes',
    '+5511911110009', 'carla.m@einstein.br',
    'Saúde Pública', 'Hospital Albert Einstein',
    'Oncologia, saúde da mulher, medicina preventiva, políticas hospitalares',
    true, true
),
(
    'Rafael Drummond',
    '+5531900009998', NULL,        -- sem e-mail: testa constraint UNIQUE com NULL
    'Esporte', 'Federação Mineira de Futebol',
    'Futebol brasileiro, gestão esportiva, campeonatos estaduais, arbitragem',
    false, true
),
(
    'Helena Souza',
    '+5511933332222', 'helena.s@antigo.com',
    'Educação', 'Secretaria Municipal',
    'Pedagogia infantil, evasão escolar',
    false, false    -- inativa: testa filtro WHERE ativo = TRUE
);

-- ----------------------------------------------------------------------------
-- 4. ENTREVISTAS (Agendamentos) — 12 registros cobrindo todos os status
--    Inclui 'confirmada' [RN-FIX-02] e garante dados para testar paginação
-- ----------------------------------------------------------------------------
INSERT INTO entrevistas (entrevistado_id, programa_id, usuario_id, data_hora, status, notas) VALUES
-- Realizadas (histórico)
(1, 3, 2, '2026-05-05 08:00:00-03', 'realizada',   'Debate sobre vacinação de idosos e cobertura do SUS.'),
(2, 2, 2, '2026-05-12 14:30:00-03', 'realizada',   'Viés ético em modelos LLM de larga escala.'),
(3, 1, 4, '2026-05-19 07:15:00-03', 'realizada',   'Análise técnica da ata do Copom e impacto no câmbio.'),
(6, 5, 4, '2026-05-26 10:00:00-03', 'realizada',   'Desafios do acesso ao ensino superior público no semiárido.'),
(7, 4, 3, '2026-06-02 16:00:00-03', 'realizada',   'Patrimônio cultural do sudoeste baiano e salvaguarda.'),
(8, 3, 2, '2026-06-03 09:00:00-03', 'realizada',   'Prevenção ao câncer de mama: campanhas e diagnóstico precoce.'),

-- Cancelada (testa FE1 de RF011 e dados de dashboard)
(4, 1, 1, '2026-06-04 07:30:00-03', 'cancelada',   'Cancelado por incompatibilidade de agenda da convidada.'),

-- Confirmadas [RN-FIX-02] — novo status
(2, 2, 2, '2026-06-10 15:00:00-03', 'confirmada',  'Segunda participação: regulação das Big Techs. Confirmada por e-mail.'),
(5, 2, 3, '2026-06-10 16:30:00-03', 'confirmada',  'Vazamento de dados em infraestruturas críticas. Confirmada.'),

-- Agendadas (futuras — base para testar RN02 de conflito de grade)
(1, 3, 2, '2026-06-17 08:30:00-03', 'agendada',    'Debate sobre saúde mental em idosos pós-pandemia.'),
(3, 1, 4, '2026-06-17 07:00:00-03', 'agendada',    'Perspectivas fiscais para o segundo semestre.'),
(6, 5, 3, '2026-06-24 10:00:00-03', 'agendada',    'Reforma do ENEM e impacto nas universidades públicas.');

-- ----------------------------------------------------------------------------
-- 5. PARTICIPAÇÕES  [RN-FIX-03] — Registros de execução vinculados a agendamentos
--    Cobre: origem em agendamento (entrevista_id preenchido) + registro avulso (NULL)
-- ----------------------------------------------------------------------------
INSERT INTO participacoes
    (entrevista_id, entrevistado_id, programa_id, usuario_id, data_hora, duracao_minutos, tema_abordado, audiencia_estimada, observacoes)
VALUES
-- Originadas de agendamentos realizados (entrevista_id 1–6)
(1, 1, 3, 2, '2026-05-05 08:00:00-03', 22,  'Vacinação de idosos e cobertura do SUS',              4200,   'Entrevistado muito didático; aprovado para nova participação.'),
(2, 2, 2, 2, '2026-05-12 14:30:00-03', 35,  'Ética em modelos LLM e regulação de IA',              1800,   'Episódio mais acessado do mês no podcast.'),
(3, 3, 1, 4, '2026-05-19 07:15:00-03', 12,  'Ata do Copom e projeções de taxa Selic',              8500,   NULL),
(4, 6, 5, 4, '2026-05-26 10:00:00-03', 28,  'Acesso ao ensino superior no semiárido baiano',       3100,   'Forte repercussão nas redes sociais.'),
(5, 7, 4, 3, '2026-06-02 16:00:00-03', 40,  'Patrimônio imaterial do sudoeste da Bahia',           2400,   'Gravação com visita ao acervo do museu.'),
(6, 8, 3, 2, '2026-06-03 09:00:00-03', 18,  'Diagnóstico precoce e rastreamento do câncer de mama',5300,   'Veiculado em parceria com campanha municipal.'),

-- Registro avulso (sem agendamento prévio) — testa FA1 do RF013
(NULL, 2, 2, 2, '2026-04-15 14:00:00-03', 20, 'Inteligência artificial generativa: panorama 2026', 2200,   'Gravação especial fora do calendário regular.');

-- ----------------------------------------------------------------------------
-- 6. AUDIT_LOGINS  [RN-FIX-05] — Log de autenticação para auditoria (RF020/NF010)
--    Cobre: login bem-sucedido, falhas consecutivas (testa bloqueio FE2 do RF020),
--           logout manual e expiração de sessão
-- ----------------------------------------------------------------------------
INSERT INTO audit_logins (usuario_id, evento, ip_address, user_agent) VALUES
-- Logins normais dos usuários ativos
(1, 'login_sucesso',    '189.112.45.10',     'Mozilla/5.0 (Windows NT 10.0) Chrome/125'),
(2, 'login_sucesso',    '189.112.45.22',     'Mozilla/5.0 (Macintosh) Safari/537.36'),
(3, 'login_sucesso',    '177.84.100.5',      'Mozilla/5.0 (X11; Linux) Firefox/126'),
(4, 'login_sucesso',    '189.112.45.33',     'Mozilla/5.0 (Windows NT 10.0) Chrome/125'),
(5, 'login_sucesso',    '201.55.67.88',      'Mozilla/5.0 (iPad) Safari/604.1'),

-- Três falhas consecutivas do mesmo usuário (simula bloqueio FE2 do RF020)
(6, 'login_falha',      '200.200.100.1',     'Mozilla/5.0 (Windows NT 10.0) Chrome/125'),
(6, 'login_falha',      '200.200.100.1',     'Mozilla/5.0 (Windows NT 10.0) Chrome/125'),
(6, 'login_falha',      '200.200.100.1',     'Mozilla/5.0 (Windows NT 10.0) Chrome/125'),

-- Logout manual e sessão expirada
(2, 'logout',           '189.112.45.22',     'Mozilla/5.0 (Macintosh) Safari/537.36'),
(3, 'sessao_expirada',  '177.84.100.5',      'Mozilla/5.0 (X11; Linux) Firefox/126'),

-- Tentativa de login com usuário inativo (ID 9 = Amanda, ativo=false)
-- O backend deve barrar antes de chegar aqui, mas registra para auditoria
(9, 'login_falha',      '192.168.1.50',      'Mozilla/5.0 (Android) Chrome/125');

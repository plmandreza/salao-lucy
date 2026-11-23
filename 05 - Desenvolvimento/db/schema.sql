-- =========================================================
-- Lucy Cabeleireira — estrutura do banco de dados (PostgreSQL)
-- Este arquivo roda sozinho na PRIMEIRA vez que o banco sobe
-- no Docker. Cada tabela é como uma planilha: colunas fixas,
-- uma linha por registro.
-- =========================================================

-- Usuária do sistema (só a Lucy) — RF-01
CREATE TABLE IF NOT EXISTS usuarios (
  id          SERIAL PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  senha_hash  TEXT NOT NULL,                 -- nunca a senha em texto puro (RNF-04)
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sessões de login: guarda só o hash do "crachá" de cada login — RF-01
CREATE TABLE IF NOT EXISTS sessoes (
  token_hash  TEXT PRIMARY KEY,
  usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  expira_em   TIMESTAMPTZ NOT NULL
);

-- Serviços do salão e o intervalo de retorno — RF-12
CREATE TABLE IF NOT EXISTS servicos (
  id                     SERIAL PRIMARY KEY,
  nome                   TEXT NOT NULL UNIQUE,
  intervalo_retorno_dias INTEGER NOT NULL CHECK (intervalo_retorno_dias > 0)
);

-- Fichas das clientes — RF-07, RN-07, RNF-06
-- Alergia é dado de saúde (sensível pela LGPD). Base legal adotada:
-- art. 11, II, "e" — proteção da incolumidade física da cliente
-- (evitar reação alérgica no atendimento). Ver RNF-06.
CREATE TABLE IF NOT EXISTS clientes (
  id         SERIAL PRIMARY KEY,
  nome       TEXT NOT NULL CHECK (btrim(nome) <> ''),
  telefone   TEXT NOT NULL CHECK (btrim(telefone) <> ''),   -- RN-07: obrigatório
  alergias   TEXT NOT NULL DEFAULT '',
  anotacoes  TEXT NOT NULL DEFAULT '',
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Estoque de tinturas, contado em tubos — RF-13, RF-14, RN-03
CREATE TABLE IF NOT EXISTS tinturas (
  id                SERIAL PRIMARY KEY,
  codigo            TEXT NOT NULL CHECK (btrim(codigo) <> ''),   -- ex.: 7.0
  nome              TEXT NOT NULL DEFAULT '',
  marca             TEXT NOT NULL DEFAULT '',
  quantidade_tubos  INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_tubos >= 0),  -- RN-03: nunca negativo
  estoque_minimo    INTEGER NOT NULL DEFAULT 1 CHECK (estoque_minimo >= 0),
  UNIQUE (codigo, marca)
);

-- Agenda — RF-02, RF-04, RN-01
CREATE TABLE IF NOT EXISTS agendamentos (
  id           SERIAL PRIMARY KEY,
  cliente_id   INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  inicio       TIMESTAMP NOT NULL,                 -- data e hora no horário do salão
  duracao_min  INTEGER CHECK (duracao_min BETWEEN 5 AND 600),   -- opcional (RF-02)
  status       TEXT NOT NULL DEFAULT 'pendente'
               CHECK (status IN ('pendente','confirmado','cancelado','concluido')),
  observacao   TEXT NOT NULL DEFAULT '',
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- RN-01: uma cliente por vez. O próprio banco recusa dois horários
  -- ativos que se sobreponham (mesmo que o código tenha um erro).
  -- Sem duração informada, o horário ocupa só o minuto de início.
  CONSTRAINT uma_cliente_por_vez EXCLUDE USING gist (
    tsrange(inicio, inicio + make_interval(mins => COALESCE(duracao_min, 1))) WITH &&
  ) WHERE (status IN ('pendente','confirmado'))
);

-- Quais serviços cada agendamento tem (um agendamento pode ter vários)
CREATE TABLE IF NOT EXISTS agendamento_servicos (
  agendamento_id INTEGER NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
  servico_id     INTEGER NOT NULL REFERENCES servicos(id),
  PRIMARY KEY (agendamento_id, servico_id)
);

-- Histórico: cada atendimento finalizado — RF-09, RF-10
CREATE TABLE IF NOT EXISTS atendimentos (
  id              SERIAL PRIMARY KEY,
  cliente_id      INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  agendamento_id  INTEGER UNIQUE REFERENCES agendamentos(id) ON DELETE SET NULL,
  data            DATE NOT NULL,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS atendimento_servicos (
  atendimento_id INTEGER NOT NULL REFERENCES atendimentos(id) ON DELETE CASCADE,
  servico_id     INTEGER NOT NULL REFERENCES servicos(id),
  PRIMARY KEY (atendimento_id, servico_id)
);

-- Tubos usados em cada atendimento (base da baixa de estoque)
CREATE TABLE IF NOT EXISTS atendimento_tinturas (
  atendimento_id    INTEGER NOT NULL REFERENCES atendimentos(id) ON DELETE CASCADE,
  tintura_id        INTEGER NOT NULL REFERENCES tinturas(id),
  quantidade_tubos  INTEGER NOT NULL CHECK (quantidade_tubos > 0),
  PRIMARY KEY (atendimento_id, tintura_id)
);

-- Serviços iniciais. Os intervalos são PROVISÓRIOS:
-- confirmar com a Lucy (pendência 1 da especificação).
INSERT INTO servicos (nome, intervalo_retorno_dias) VALUES
  ('Corte', 45), ('Tintura', 30), ('Escova', 15), ('Sobrancelha', 20), ('Hidratação', 30)
ON CONFLICT (nome) DO NOTHING;

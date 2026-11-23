-- =========================================================
-- Migração 003 — sessões de login (RF-01)
-- Data: 23/11/2026
-- Guarda o hash do "crachá" (token) de cada login.
-- Pode rodar mais de uma vez sem erro.
-- =========================================================
CREATE TABLE IF NOT EXISTS sessoes (
  token_hash  TEXT PRIMARY KEY,
  usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  expira_em   TIMESTAMPTZ NOT NULL
);

-- =========================================================
-- Migração 001 — remove a exigência de consentimento para alergias
-- Data: 23/11/2026
-- Motivo: decisão revisada do RNF-06. A alergia é guardada com base
-- no art. 11, II, "e" da LGPD (proteção da incolumidade física da
-- cliente), sem depender de uma caixinha de consentimento.
--
-- Para bancos que JÁ existiam antes da mudança. Bancos novos já
-- nascem certos pelo schema.sql. Pode rodar mais de uma vez sem erro.
-- =========================================================
ALTER TABLE clientes DROP CONSTRAINT IF EXISTS alergia_exige_consentimento;
ALTER TABLE clientes DROP COLUMN IF EXISTS consentimento_saude;

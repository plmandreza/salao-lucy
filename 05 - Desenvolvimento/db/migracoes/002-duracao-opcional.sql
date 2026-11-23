-- =========================================================
-- Migração 002 — duração do agendamento passa a ser OPCIONAL
-- Data: 23/11/2026
-- Motivo: o RF-02 já dizia "duração estimada (opcional)", mas a
-- primeira versão do código exigia. Sem duração, o horário ocupa
-- só o minuto de início para a regra "uma cliente por vez" (RN-01).
-- Pode rodar mais de uma vez sem erro.
-- =========================================================
ALTER TABLE agendamentos ALTER COLUMN duracao_min DROP NOT NULL;
ALTER TABLE agendamentos ALTER COLUMN duracao_min DROP DEFAULT;
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS uma_cliente_por_vez;
ALTER TABLE agendamentos ADD CONSTRAINT uma_cliente_por_vez EXCLUDE USING gist (
  tsrange(inicio, inicio + make_interval(mins => COALESCE(duracao_min, 1))) WITH &&
) WHERE (status IN ('pendente','confirmado'));

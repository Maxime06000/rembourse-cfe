-- Migration : stockage de l'acceptation des CGV et renonciation rétractation
-- À exécuter dans Supabase SQL Editor

alter table simulations
  add column if not exists cgv_accepted_at timestamptz,
  add column if not exists cgv_version text,
  add column if not exists retractation_waived_at timestamptz,
  add column if not exists disclaimer_accepted_at timestamptz;

comment on column simulations.cgv_accepted_at is 'Date/heure d''acceptation des CGV (preuve juridique)';
comment on column simulations.cgv_version is 'Version des CGV acceptées (ex: v1.0 – avril 2026)';
comment on column simulations.retractation_waived_at is 'Date/heure de renonciation explicite au droit de rétractation 14j';
comment on column simulations.disclaimer_accepted_at is 'Date/heure d''acceptation du disclaimer (obligation de moyens)';

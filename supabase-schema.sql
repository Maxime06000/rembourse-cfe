-- Simulations table
create table if not exists simulations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),

  -- Identité
  nom text not null,
  email text not null,
  telephone text,
  siret text not null,
  numero_fiscal text not null,
  reference_avis text not null,
  numero_role text not null,
  adresse_bien text not null,
  ville text not null,

  -- Qualification
  regime text not null check (regime in ('reel', 'micro')),
  type_location text not null check (type_location in ('longue', 'courte')),
  annee_debut integer not null,
  annee_cfe integer not null,

  -- Avis CFE
  cfe_ligne25 numeric not null,
  cfe_ligne189 numeric not null,
  cfe_ligne9_oui boolean not null default false,

  -- Données financières régime réel
  loyers numeric,
  charges_externes numeric,
  impots_taxes numeric,
  amortissements numeric,
  charges_financieres numeric,

  -- Données micro-BIC
  recettes_brutes numeric,

  -- Résultats calculés
  valeur_ajoutee numeric,
  plafonnement numeric,
  degrevement_theorique numeric,
  degrevement_reel numeric,
  commission numeric,

  -- Paiement
  stripe_session_id text,
  stripe_payment_status text default 'pending',
  paid_at timestamptz,

  -- Documents générés
  documents_sent boolean default false
);

-- Index
create index if not exists idx_simulations_email on simulations(email);
create index if not exists idx_simulations_stripe on simulations(stripe_session_id);
create index if not exists idx_simulations_created on simulations(created_at desc);

-- RLS
alter table simulations enable row level security;

create policy "Service role full access" on simulations
  using (true)
  with check (true);

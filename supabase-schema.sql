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
  departement text,

  -- Qualification
  regime text not null check (regime in ('reel', 'micro')),
  type_location text not null check (type_location in ('longue', 'courte')),
  annee_debut integer not null,
  annee_cfe integer not null,

  -- Avis CFE (DEPRECATED - use avis_cfe table for new simulations)
  cfe_ligne25 numeric,
  cfe_ligne189 numeric,
  cfe_ligne9_oui boolean default false,

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

-- Avis CFE table (multi-establishment support)
create table if not exists avis_cfe (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid not null references simulations(id) on delete cascade,
  created_at timestamptz default now(),

  -- Données de l'avis
  montant_cfe numeric not null,
  cotisation_min numeric not null,
  ligne9 boolean not null default false,
  numero_avis text not null,
  numero_role text not null,
  departement text not null,
  adresse_etablissement text not null,
  siret text not null,
  est_principal boolean not null default false,

  -- Données extraites du PDF
  nom_redevable text,
  commune text,
  lieu_imposition text
);

-- Index
create index if not exists idx_simulations_email on simulations(email);
create index if not exists idx_simulations_stripe on simulations(stripe_session_id);
create index if not exists idx_simulations_created on simulations(created_at desc);

create index if not exists idx_avis_cfe_simulation on avis_cfe(simulation_id);
create index if not exists idx_avis_cfe_principal on avis_cfe(simulation_id, est_principal);

-- Contrainte : exactement 1 établissement principal par simulation
create unique index if not exists idx_avis_cfe_unique_principal 
  on avis_cfe(simulation_id) 
  where est_principal = true;

-- RLS
alter table simulations enable row level security;
alter table avis_cfe enable row level security;

create policy "Service role full access" on simulations
  using (true)
  with check (true);

create policy "Service role full access" on avis_cfe
  using (true)
  with check (true);

-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  order_type text not null,               -- 'trip' or 'extended-weight'
  status text not null default 'pending', -- 'pending' until paid, then 'paid'

  -- shared fields
  company text,
  usdot text,
  email text,
  phone text,
  price numeric not null,
  payment_intent_id text,

  -- trip permit fields
  driver text,
  vehicle_year text,
  vehicle_make text,
  vin text,
  plate text,
  plate_state text,
  plate_type text,
  weight text,
  axles text,
  ownership text,
  leasing_company text,
  commodity text,
  direction text,
  trip_type text,
  entrance text,
  exit text,
  stops jsonb,
  miles numeric,

  -- extended weight permit fields
  unit_number text,
  permit_type text,

  created_at timestamptz not null default now(),
  paid_at timestamptz
);

-- Lock the table down: nobody can read or write it by default.
alter table submissions enable row level security;

-- Only a logged-in admin (via Supabase Auth) can read submissions.
create policy "Authenticated users can read submissions"
  on submissions for select
  using (auth.role() = 'authenticated');

-- No insert/update policy is defined on purpose. Only your Netlify
-- functions (using the service role key, which bypasses RLS) can write
-- to this table — the browser never gets write access.

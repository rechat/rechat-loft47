create table deals (
  id uuid primary key default gen_random_uuid(),
  deal_id text,
  loft47_id text,
  created_at timestamp with time zone default now(),
);
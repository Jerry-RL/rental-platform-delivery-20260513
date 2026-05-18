-- Flyway V3: order service
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_no varchar(40) not null unique,
  user_id uuid not null,
  vehicle_id uuid not null,
  pickup_store_id uuid not null,
  return_store_id uuid not null,
  pickup_time timestamptz not null,
  return_time timestamptz not null,
  actual_return_time timestamptz,
  status varchar(40) not null,
  rental_fee numeric(12,2) not null default 0,
  surcharge_fee numeric(12,2) not null default 0,
  total_fee numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 0,
  is_deleted boolean not null default false,
  check (return_time > pickup_time)
);

create table if not exists order_outbox (
  id uuid primary key default gen_random_uuid(),
  aggregate_type varchar(40) not null,
  aggregate_id uuid not null,
  event_type varchar(80) not null,
  payload jsonb not null,
  idempotency_key varchar(100) not null unique,
  status smallint not null default 0,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

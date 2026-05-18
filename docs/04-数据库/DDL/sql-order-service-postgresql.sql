create extension if not exists pgcrypto;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_no varchar(40) not null unique,
  user_id uuid not null,
  account_type varchar(20) not null default 'C',
  vehicle_id uuid not null,
  pickup_store_id uuid not null,
  return_store_id uuid not null,
  pickup_time timestamptz not null,
  return_time timestamptz not null,
  actual_return_time timestamptz,
  status varchar(40) not null,
  settlement_mode varchar(20) not null default 'PREPAID',
  service_mode varchar(20) not null default 'SELF_DRIVE',
  driver_id uuid,
  billing_account_id uuid,
  billing_period varchar(7),
  rental_fee numeric(12,2) not null default 0,
  chauffeur_fee numeric(12,2) not null default 0,
  surcharge_fee numeric(12,2) not null default 0,
  total_fee numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  remark text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 0,
  is_deleted boolean not null default false,
  check (return_time > pickup_time),
  check (service_mode in ('SELF_DRIVE', 'WITH_DRIVER'))
);

create index if not exists idx_orders_user_created
  on orders(user_id, created_at desc);

create index if not exists idx_orders_status
  on orders(status);

create index if not exists idx_orders_billing_account_period
  on orders(billing_account_id, billing_period);

create index if not exists idx_orders_settlement_mode
  on orders(settlement_mode);

create index if not exists idx_orders_service_mode
  on orders(service_mode);

create table if not exists order_fee_detail (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  fee_type varchar(40) not null,
  amount numeric(12,2) not null,
  rule_snapshot jsonb,
  created_at timestamptz not null default now()
);

create table if not exists order_outbox (
  id uuid primary key default gen_random_uuid(),
  aggregate_type varchar(40) not null,
  aggregate_id uuid not null,
  event_type varchar(80) not null,
  payload jsonb not null,
  idempotency_key varchar(100) not null,
  status smallint not null default 0,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  unique (idempotency_key)
);

create index if not exists idx_order_outbox_status_created
  on order_outbox(status, created_at);

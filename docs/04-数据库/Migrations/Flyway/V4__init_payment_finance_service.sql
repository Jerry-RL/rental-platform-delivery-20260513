-- Flyway V4: payment and finance
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  channel varchar(20) not null,
  channel_txn_no varchar(100) not null unique,
  amount numeric(12,2) not null,
  status varchar(20) not null,
  paid_at timestamptz,
  callback_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 0,
  is_deleted boolean not null default false
);

create table if not exists refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  payment_id uuid,
  refund_no varchar(40) not null unique,
  amount numeric(12,2) not null,
  status varchar(20) not null,
  reason varchar(255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 0,
  is_deleted boolean not null default false
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  invoice_no varchar(40) unique,
  title_type varchar(20) not null,
  invoice_title varchar(255) not null,
  tax_no varchar(40),
  amount numeric(12,2) not null,
  status varchar(20) not null,
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 0,
  is_deleted boolean not null default false
);

create table if not exists consumer_dedup (
  id bigserial primary key,
  consumer_group varchar(80) not null,
  event_id varchar(100) not null,
  consumed_at timestamptz not null default now(),
  unique (consumer_group, event_id)
);

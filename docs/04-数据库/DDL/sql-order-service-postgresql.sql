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
  booker_user_id uuid,
  actual_driver_user_id uuid,
  eligibility_snapshot_id uuid,
  incident_pending boolean not null default false,
  credit_snapshot jsonb,
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

create index if not exists idx_orders_incident_pending
  on orders(incident_pending) where incident_pending = true;

create table if not exists order_incident (
  id uuid primary key default gen_random_uuid(),
  incident_no varchar(40) not null unique,
  order_id uuid not null references orders(id),
  vehicle_id uuid not null,
  reporter_user_id uuid not null,
  incident_type varchar(30) not null,
  occurred_at timestamptz not null,
  location_text varchar(255),
  location_lat numeric(10,7),
  location_lng numeric(10,7),
  police_report_no varchar(64),
  insurance_company varchar(120),
  insurance_policy_no varchar(64),
  insurance_claim_status varchar(30),
  has_injury boolean not null default false,
  description text,
  status varchar(30) not null default 'REPORTED',
  is_primary boolean not null default true,
  vehicle_hold_applied boolean not null default false,
  assignee_user_id uuid,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 0,
  is_deleted boolean not null default false,
  check (incident_type in ('COLLISION', 'SCRATCH', 'THEFT', 'OTHER'))
);

create index if not exists idx_order_incident_order on order_incident(order_id);
create index if not exists idx_order_incident_status on order_incident(status);

create table if not exists order_incident_attachment (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references order_incident(id),
  file_type varchar(20) not null default 'IMAGE',
  file_url text not null,
  uploaded_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists order_incident_status_log (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references order_incident(id),
  from_status varchar(30),
  to_status varchar(30) not null,
  operator_user_id uuid not null,
  remark text,
  created_at timestamptz not null default now()
);

create table if not exists order_incident_fee (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references order_incident(id),
  order_id uuid not null references orders(id),
  fee_type varchar(40) not null,
  amount numeric(12,2) not null,
  currency varchar(3) not null default 'CNY',
  status varchar(20) not null default 'PENDING_CONFIRM',
  confirmed_by uuid,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

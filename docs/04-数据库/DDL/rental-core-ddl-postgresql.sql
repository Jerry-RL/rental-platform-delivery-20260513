-- 租车平台核心交易 DDL（PostgreSQL 15+）

create extension if not exists pgcrypto;

-- 用户
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  phone varchar(20) not null unique,
  password_hash varchar(255) not null,
  account_type varchar(20) not null default 'C',
  real_name varchar(64),
  id_number_enc text,
  status smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 0,
  is_deleted boolean not null default false
);

create table if not exists user_license (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  license_no_enc text not null,
  issue_date date,
  expiry_date date,
  status smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 0,
  is_deleted boolean not null default false
);

create table if not exists org_account (
  id uuid primary key default gen_random_uuid(),
  org_name varchar(255) not null,
  account_type varchar(20) not null,
  credit_code varchar(60) not null unique,
  primary_admin_user_id uuid not null references users(id),
  contact_name varchar(64),
  contact_phone varchar(20),
  status varchar(20) not null default 'PENDING',
  frozen_at timestamptz,
  frozen_reason varchar(255),
  closed_at timestamptz,
  close_reason varchar(255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 0,
  is_deleted boolean not null default false
);

create table if not exists org_member (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org_account(id),
  user_id uuid not null references users(id),
  department_name varchar(120),
  position_name varchar(120),
  status varchar(20) not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 0,
  is_deleted boolean not null default false,
  unique (org_id, user_id)
);

create table if not exists org_member_role (
  id uuid primary key default gen_random_uuid(),
  org_member_id uuid not null references org_member(id),
  role_code varchar(60) not null,
  data_scope varchar(60) not null default 'ORG',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 0,
  is_deleted boolean not null default false,
  unique (org_member_id, role_code)
);

create table if not exists org_approval_task (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org_account(id),
  approval_type varchar(40) not null,
  target_member_id uuid references org_member(id),
  applicant_user_id uuid not null references users(id),
  approver_user_id uuid references users(id),
  decision varchar(20),
  reason varchar(255),
  payload jsonb,
  status varchar(20) not null default 'PENDING',
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 0,
  is_deleted boolean not null default false,
  check (approver_user_id is null or approver_user_id <> applicant_user_id)
);

create index if not exists idx_org_member_org on org_member(org_id);
create index if not exists idx_org_approval_org_status on org_approval_task(org_id, status);

-- 车辆
create table if not exists vehicle (
  id uuid primary key default gen_random_uuid(),
  plate_number varchar(20) not null unique,
  vehicle_type_id uuid not null,
  store_id uuid not null,
  status smallint not null default 0,
  mileage_km bigint not null default 0,
  fuel_level smallint not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 0,
  is_deleted boolean not null default false
);

create table if not exists vehicle_availability (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicle(id),
  start_time timestamptz not null,
  end_time timestamptz not null,
  hold_order_id uuid,
  status smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 0,
  is_deleted boolean not null default false,
  check (end_time > start_time)
);

create index if not exists idx_vehicle_availability_vehicle_time
  on vehicle_availability(vehicle_id, start_time, end_time);

-- 订单
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_no varchar(40) not null unique,
  user_id uuid not null references users(id),
  account_type varchar(20) not null default 'C',
  vehicle_id uuid not null references vehicle(id),
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

-- 支付与退款
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  bill_id uuid,
  settlement_mode varchar(20) not null default 'PREPAID',
  billing_account_id uuid,
  billing_period varchar(7),
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

create index if not exists idx_payments_order_id on payments(order_id);
create index if not exists idx_payments_billing_account_period on payments(billing_account_id, billing_period);

create table if not exists refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  payment_id uuid references payments(id),
  refund_no varchar(40) not null unique,
  amount numeric(12,2) not null,
  status varchar(20) not null,
  reason varchar(255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 0,
  is_deleted boolean not null default false
);

-- 发票
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  bill_id uuid,
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

create table if not exists finance_bills (
  id uuid primary key default gen_random_uuid(),
  bill_no varchar(40) not null unique,
  billing_account_id uuid not null,
  account_type varchar(20) not null,
  billing_period varchar(7) not null,
  total_amount numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  status varchar(30) not null,
  confirmed_at timestamptz,
  confirmed_by uuid,
  last_payment_at timestamptz,
  reconciliation_status varchar(20) not null default 'PENDING',
  due_date date,
  settled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 0,
  is_deleted boolean not null default false,
  unique (billing_account_id, billing_period)
);

create index if not exists idx_finance_bills_status_due_date on finance_bills(status, due_date);

create table if not exists finance_bill_payments (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references finance_bills(id),
  payment_no varchar(40) not null unique,
  channel varchar(20) not null,
  channel_txn_no varchar(100),
  amount numeric(12,2) not null,
  status varchar(20) not null,
  idempotency_key varchar(100) not null unique,
  callback_payload jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 0,
  is_deleted boolean not null default false
);

create index if not exists idx_finance_bill_payments_bill_id on finance_bill_payments(bill_id);

-- 消费幂等
create table if not exists consumer_dedup (
  id bigserial primary key,
  consumer_group varchar(80) not null,
  event_id varchar(100) not null,
  consumed_at timestamptz not null default now(),
  unique (consumer_group, event_id)
);

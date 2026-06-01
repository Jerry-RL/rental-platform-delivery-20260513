-- Flyway V5: v1.9 租期事故、用户认证细化、银行流水勾稽

-- ========== User Service ==========

alter table users
  add column if not exists realname_status varchar(20) not null default 'NOT_SUBMITTED',
  add column if not exists realname_reject_reason varchar(255),
  add column if not exists blacklist_flag boolean not null default false;

comment on column users.realname_status is 'NOT_SUBMITTED|PENDING|APPROVED|REJECTED';

alter table user_license
  add column if not exists license_class varchar(10),
  add column if not exists verify_status varchar(20) not null default 'NOT_SUBMITTED',
  add column if not exists reject_reason varchar(255);

create table if not exists user_oauth_binding (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  provider varchar(20) not null,
  open_id varchar(128) not null,
  union_id varchar(128),
  bound_at timestamptz not null default now(),
  unbound_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_deleted boolean not null default false,
  unique (provider, open_id),
  unique (user_id, provider)
);

create table if not exists user_realname_verify (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  real_name varchar(64) not null,
  id_number_enc text not null,
  id_front_url text,
  id_back_url text,
  face_verify_ref varchar(100),
  status varchar(20) not null default 'PENDING',
  reject_reason varchar(255),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_realname_user_status
  on user_realname_verify(user_id, status);

create table if not exists user_eligibility_snapshot (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  org_id uuid references org_account(id),
  realname_status varchar(20) not null,
  license_status varchar(20) not null,
  license_expiry_date date,
  blacklist_flag boolean not null default false,
  org_status varchar(20),
  credit_available numeric(14,2),
  contract_id uuid,
  snapshot_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_eligibility_snapshot_user_time
  on user_eligibility_snapshot(user_id, snapshot_at desc);

alter table org_account
  add column if not exists qualification_status varchar(20) not null default 'DRAFT',
  add column if not exists legal_person_name varchar(64),
  add column if not exists bank_account_enc text,
  add column if not exists business_license_url text;

comment on column org_account.qualification_status is 'DRAFT|UNDER_REVIEW|ACTIVE|SUSPENDED|CLOSED';

create table if not exists org_credit_line (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org_account(id) unique,
  credit_limit numeric(14,2) not null default 0,
  used_amount numeric(14,2) not null default 0,
  billing_days integer not null default 30,
  contract_no varchar(64),
  valid_from date,
  valid_to date,
  status varchar(20) not null default 'INACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 0,
  is_deleted boolean not null default false
);

create table if not exists org_invoice_title (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org_account(id),
  title_name varchar(255) not null,
  tax_no varchar(40) not null,
  is_default boolean not null default false,
  tax_no_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_deleted boolean not null default false,
  unique (org_id, tax_no)
);

create index if not exists idx_org_invoice_title_org
  on org_invoice_title(org_id);

-- ========== Order Service ==========

alter table orders
  add column if not exists booker_user_id uuid,
  add column if not exists actual_driver_user_id uuid,
  add column if not exists eligibility_snapshot_id uuid,
  add column if not exists incident_pending boolean not null default false,
  add column if not exists credit_snapshot jsonb;

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

create index if not exists idx_order_incident_order
  on order_incident(order_id);

create index if not exists idx_order_incident_status
  on order_incident(status);

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

-- ========== Vehicle Service ==========

alter table vehicle
  add column if not exists status_code varchar(30) not null default 'AVAILABLE';

comment on column vehicle.status_code is 'AVAILABLE|RENTED|MAINTENANCE|ACCIDENT_HOLD|SCRAPPED';

create index if not exists idx_vehicle_status_code
  on vehicle(status_code);

-- ========== Finance Service ==========

alter table finance_bills
  add column if not exists payment_reference_code varchar(64) unique;

alter table invoices
  add column if not exists invoice_title_id uuid;

create table if not exists bank_statement_import (
  id uuid primary key default gen_random_uuid(),
  import_no varchar(40) not null unique,
  source varchar(20) not null default 'CSV',
  file_name varchar(255),
  imported_by uuid,
  line_count integer not null default 0,
  matched_count integer not null default 0,
  status varchar(20) not null default 'COMPLETED',
  created_at timestamptz not null default now()
);

create table if not exists bank_statement_line (
  id uuid primary key default gen_random_uuid(),
  import_id uuid references bank_statement_import(id),
  bank_txn_no varchar(100),
  txn_time timestamptz not null,
  counterparty_name varchar(255),
  counterparty_account varchar(64),
  debit_credit varchar(10) not null default 'CREDIT',
  amount numeric(14,2) not null,
  currency varchar(3) not null default 'CNY',
  remark text,
  payment_reference_code varchar(64),
  match_status varchar(20) not null default 'UNMATCHED',
  matched_bill_id uuid references finance_bills(id),
  matched_payment_id uuid,
  matched_at timestamptz,
  matched_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_bank_line_ref_code
  on bank_statement_line(payment_reference_code);

create index if not exists idx_bank_line_match_status
  on bank_statement_line(match_status, txn_time desc);

create table if not exists bank_statement_match (
  id uuid primary key default gen_random_uuid(),
  statement_line_id uuid not null references bank_statement_line(id),
  bill_id uuid not null references finance_bills(id),
  matched_amount numeric(14,2) not null,
  match_rule varchar(40) not null,
  operator_user_id uuid,
  created_at timestamptz not null default now(),
  unique (statement_line_id, bill_id)
);

create extension if not exists pgcrypto;

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
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
  bill_id uuid,
  invoice_no varchar(40) unique,
  title_type varchar(20) not null,
  invoice_title varchar(255) not null,
  tax_no varchar(40),
  invoice_title_id uuid,
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
  payment_reference_code varchar(64) unique,
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

create index if not exists idx_bank_line_ref_code on bank_statement_line(payment_reference_code);
create index if not exists idx_bank_line_match_status on bank_statement_line(match_status, txn_time desc);

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

create table if not exists consumer_dedup (
  id bigserial primary key,
  consumer_group varchar(80) not null,
  event_id varchar(100) not null,
  consumed_at timestamptz not null default now(),
  unique (consumer_group, event_id)
);

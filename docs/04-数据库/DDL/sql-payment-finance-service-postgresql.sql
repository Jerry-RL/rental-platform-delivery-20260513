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
  provider varchar(20),
  external_req_no varchar(64) unique,
  idempotency_key varchar(100) unique,
  invoice_type varchar(10) not null default 'BLUE',
  invoice_category varchar(10) not null default 'NORMAL',
  red_flush_ref_id uuid references invoices(id),
  provider_invoice_no varchar(40),
  tax_rate numeric(5,4),
  amount_ex_tax numeric(12,2),
  tax_amount numeric(12,2),
  pdf_url text,
  ofd_url text,
  xml_url text,
  remark text,
  payment_reference_code varchar(64),
  buyer_email varchar(128),
  buyer_phone varchar(20),
  issued_at timestamptz,
  issue_error_code varchar(40),
  issue_error_message varchar(500),
  invoice_batch_id uuid,
  retry_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 0,
  is_deleted boolean not null default false
);

create index if not exists idx_invoices_provider_status on invoices(provider, status);
create index if not exists idx_invoices_bill_id on invoices(bill_id) where bill_id is not null;

create table if not exists invoice_line_item (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id),
  line_no integer not null,
  item_name varchar(200) not null,
  tax_class_code varchar(30) not null,
  tax_rate numeric(5,4) not null,
  quantity numeric(12,4) not null default 1,
  unit varchar(20) not null default '次',
  unit_price_ex_tax numeric(12,6),
  amount_ex_tax numeric(12,2) not null,
  tax_amount numeric(12,2) not null,
  amount_inc_tax numeric(12,2) not null,
  order_id uuid,
  plate_number varchar(20),
  created_at timestamptz not null default now(),
  unique (invoice_id, line_no)
);

create table if not exists invoice_provider_call_log (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id),
  provider varchar(20) not null,
  operation varchar(20) not null,
  external_req_no varchar(64),
  http_status integer,
  status varchar(20) not null,
  request_payload jsonb,
  response_payload jsonb,
  latency_ms integer,
  created_at timestamptz not null default now()
);

create table if not exists invoice_provider_config (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  default_provider varchar(20) not null default 'NUONUO',
  trigger_policy varchar(30) not null default 'ON_PAYMENT',
  auto_issue_c_enabled boolean not null default true,
  bg_requires_approval boolean not null default true,
  default_tax_class_code varchar(30) not null default '3040502020000000000',
  default_tax_rate numeric(5,4) not null default 0.1300,
  max_retry_count integer not null default 3,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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

create table if not exists invoice_issue_batch (
  id uuid primary key default gen_random_uuid(),
  batch_no varchar(40) not null unique,
  bill_id uuid references finance_bills(id),
  billing_period varchar(7),
  billing_account_id uuid,
  provider varchar(20),
  invoice_count integer not null default 0,
  status varchar(20) not null default 'PENDING',
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table invoices
  add constraint fk_invoices_batch foreign key (invoice_batch_id) references invoice_issue_batch(id);

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

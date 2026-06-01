-- Flyway V8: Invoice Adapter 字段扩展（诺诺/百望对接）

-- ========== invoices 扩展 ==========

alter table invoices
  add column if not exists provider varchar(20),
  add column if not exists external_req_no varchar(64),
  add column if not exists idempotency_key varchar(100),
  add column if not exists invoice_type varchar(10) not null default 'BLUE',
  add column if not exists invoice_category varchar(10) not null default 'NORMAL',
  add column if not exists red_flush_ref_id uuid references invoices(id),
  add column if not exists provider_invoice_no varchar(40),
  add column if not exists tax_rate numeric(5,4),
  add column if not exists amount_ex_tax numeric(12,2),
  add column if not exists tax_amount numeric(12,2),
  add column if not exists ofd_url text,
  add column if not exists xml_url text,
  add column if not exists remark text,
  add column if not exists payment_reference_code varchar(64),
  add column if not exists buyer_email varchar(128),
  add column if not exists buyer_phone varchar(20),
  add column if not exists issued_at timestamptz,
  add column if not exists issue_error_code varchar(40),
  add column if not exists issue_error_message varchar(500),
  add column if not exists invoice_batch_id uuid,
  add column if not exists retry_count integer not null default 0;

create unique index if not exists idx_invoices_external_req_no
  on invoices(external_req_no) where external_req_no is not null;

create unique index if not exists idx_invoices_idempotency_key
  on invoices(idempotency_key) where idempotency_key is not null;

create index if not exists idx_invoices_provider_status
  on invoices(provider, status);

create index if not exists idx_invoices_bill_id
  on invoices(bill_id) where bill_id is not null;

comment on column invoices.provider is 'NUONUO|BAIWANG|MANUAL';
comment on column invoices.invoice_type is 'BLUE|RED';
comment on column invoices.invoice_category is 'SPECIAL|NORMAL';

-- ========== 合并开票批次 ==========

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

-- ========== 发票明细行 ==========

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

create index if not exists idx_invoice_line_item_invoice
  on invoice_line_item(invoice_id);

create index if not exists idx_invoice_line_item_order
  on invoice_line_item(order_id) where order_id is not null;

-- ========== 厂商调用日志 ==========

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

create index if not exists idx_invoice_provider_log_invoice
  on invoice_provider_call_log(invoice_id, created_at desc);

create index if not exists idx_invoice_provider_log_external_req
  on invoice_provider_call_log(external_req_no);

-- ========== 开票策略配置（租户级） ==========

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

comment on column invoice_provider_config.trigger_policy is 'ON_PAYMENT|ON_BILL_CONFIRM';

alter table invoices
  add constraint fk_invoices_batch
  foreign key (invoice_batch_id) references invoice_issue_batch(id);

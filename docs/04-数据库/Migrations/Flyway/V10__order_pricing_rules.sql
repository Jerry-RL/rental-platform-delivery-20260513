-- Flyway V10: 订单定价规则、订单行、里程与规则快照

-- ========== 价格规则 ==========

create table if not exists price_rule (
  id uuid primary key default gen_random_uuid(),
  rule_code varchar(40) not null unique,
  rule_name varchar(80) not null,
  pricing_basis varchar(20) not null,
  time_unit varchar(10),
  base_price numeric(12,2) not null,
  included_km integer not null default 0,
  included_km_per_day integer,
  overage_km_rate numeric(10,4) not null default 0,
  vehicle_type_id uuid,
  service_mode varchar(20) not null default 'ANY',
  store_id uuid,
  account_type varchar(10) not null default 'ANY',
  min_qty integer not null default 1,
  max_qty integer,
  qty_discount_rate numeric(5,4) not null default 1.0000,
  weekend_rate numeric(5,4) not null default 1.0000,
  holiday_rate numeric(5,4) not null default 1.0000,
  settlement_policy varchar(30) not null default 'STANDARD',
  contract_id uuid,
  effective_from date not null,
  effective_to date,
  priority integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (pricing_basis in ('TIME', 'MILEAGE', 'HYBRID')),
  check (time_unit is null or time_unit in ('HOUR', 'DAY', 'WEEK', 'MONTH')),
  check (service_mode in ('SELF_DRIVE', 'WITH_DRIVER', 'ANY')),
  check (account_type in ('C', 'B', 'G', 'ANY')),
  check (settlement_policy in ('STANDARD', 'MAX_TIME_OR_MILEAGE'))
);

create index if not exists idx_price_rule_match
  on price_rule(is_active, effective_from, effective_to, priority desc);

comment on table price_rule is '订单定价规则，见 docs/租车平台订单定价策略说明.md';

-- ========== 订单扩展字段 ==========

alter table orders
  add column if not exists pricing_basis varchar(20),
  add column if not exists price_rule_id uuid references price_rule(id),
  add column if not exists pricing_snapshot jsonb,
  add column if not exists estimated_km integer,
  add column if not exists included_km integer,
  add column if not exists actual_km integer,
  add column if not exists pickup_mileage_km bigint,
  add column if not exists return_mileage_km bigint,
  add column if not exists vehicle_qty integer not null default 1;

comment on column orders.pricing_snapshot is '下单时 price_rule 快照 JSON';
comment on column orders.vehicle_qty is '订单车辆台数，多台见 order_line';

-- ========== 订单行（多车型/多台） ==========

create table if not exists order_line (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  line_no integer not null,
  vehicle_type_id uuid not null,
  qty integer not null default 1 check (qty >= 1),
  vehicle_ids uuid[],
  rental_fee_est numeric(12,2) not null default 0,
  chauffeur_fee_est numeric(12,2) not null default 0,
  price_rule_id uuid references price_rule(id),
  rule_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, line_no)
);

create index if not exists idx_order_line_order
  on order_line(order_id);

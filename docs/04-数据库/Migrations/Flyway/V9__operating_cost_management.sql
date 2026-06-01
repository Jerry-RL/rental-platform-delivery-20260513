-- Flyway V9: 运营成本台账、第三方成本台账、维保/保险、司机档案

-- ========== 成本子类字典 ==========

create table if not exists cost_sub_type_dict (
  cost_category varchar(30) not null,
  cost_sub_type varchar(40) not null,
  display_name varchar(80) not null,
  description varchar(255),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (cost_category, cost_sub_type)
);

comment on table cost_sub_type_dict is '运营成本子类字典，见 docs/租车平台运营成本管理说明.md §3';

insert into cost_sub_type_dict (cost_category, cost_sub_type, display_name, sort_order) values
  ('LABOR', 'DRIVER_BASE_SALARY', '司机基本工资', 10),
  ('LABOR', 'DRIVER_TRIP_COMMISSION', '司机提成', 20),
  ('LABOR', 'DRIVER_ALLOWANCE', '司机补贴', 30),
  ('LABOR', 'DRIVER_SOCIAL_INSURANCE', '司机社保公积金', 40),
  ('LABOR', 'STAFF_SALARY', '员工工资', 50),
  ('LABOR', 'STAFF_SOCIAL_INSURANCE', '员工社保公积金', 60),
  ('LABOR', 'STAFF_BONUS', '奖金绩效', 70),
  ('LABOR', 'OUTSOURCED_LABOR', '外包劳务', 80),
  ('VEHICLE', 'VEHICLE_DEPRECIATION', '车辆折旧', 100),
  ('VEHICLE', 'VEHICLE_LEASE', '车辆租赁费', 110),
  ('VEHICLE', 'INSURANCE_COMPULSORY', '交强险', 120),
  ('VEHICLE', 'INSURANCE_COMMERCIAL', '商业险', 130),
  ('VEHICLE', 'MAINTENANCE_ROUTINE', '保养', 140),
  ('VEHICLE', 'REPAIR', '维修', 150),
  ('VEHICLE', 'VIOLATION_FINE', '违章罚款', 160),
  ('VEHICLE', 'VIOLATION_POINTS_SERVICE', '违章代办费', 170),
  ('VEHICLE', 'FUEL', '油费/电费', 180),
  ('VEHICLE', 'TIRE', '轮胎更换', 190),
  ('VEHICLE', 'ANNUAL_INSPECTION', '年审', 200),
  ('VEHICLE', 'PARKING_TOLL', '停车/过路桥费', 210),
  ('VEHICLE', 'VEHICLE_TAX', '车船税', 220),
  ('VEHICLE', 'GPS_HARDWARE', 'GPS硬件摊销', 230),
  ('VEHICLE', 'SCRAP_LOSS', '报废损耗', 240),
  ('COMPANY_OPEX', 'OFFICE_RENT', '办公场地租金', 300),
  ('COMPANY_OPEX', 'UTILITIES', '水电物业', 310),
  ('COMPANY_OPEX', 'MARKETING', '市场推广', 320),
  ('COMPANY_OPEX', 'TRAVEL_ENTERTAINMENT', '差旅招待', 330),
  ('COMPANY_OPEX', 'ADMIN_OFFICE', '行政办公', 340),
  ('COMPANY_OPEX', 'LEGAL_AUDIT', '法务审计', 350),
  ('COMPANY_OPEX', 'FINANCE_BANK_FEE', '银行手续费', 360),
  ('COMPANY_OPEX', 'IT_SAAS', '业务软件订阅', 370),
  ('COMPANY_OPEX', 'DAILY_MISC', '日常杂费', 380),
  ('THIRD_PARTY', 'API_VIOLATION_QUERY', '违章查询API', 400),
  ('THIRD_PARTY', 'API_GPS_PLATFORM', 'GPS平台/流量', 410),
  ('THIRD_PARTY', 'API_MAP', '地图服务', 420),
  ('THIRD_PARTY', 'API_INVOICE_SAAS', '数电发票SaaS', 430),
  ('THIRD_PARTY', 'API_SMS', '短信', 440),
  ('ORDER_LINKED', 'ACCIDENT_PAYOUT', '事故赔付', 500),
  ('ORDER_LINKED', 'CUSTOMER_COMPENSATION', '客诉赔付', 510),
  ('ORDER_LINKED', 'ORDER_FUEL_SHORT', '油费差额', 520),
  ('ORDER_LINKED', 'COLLECTION_FEE', '催收/法务', 530)
on conflict (cost_category, cost_sub_type) do nothing;

-- ========== 司机档案（先于成本台账） ==========

create table if not exists driver (
  id uuid primary key default gen_random_uuid(),
  driver_no varchar(32) not null unique,
  full_name varchar(64) not null,
  mobile varchar(20) not null,
  license_class varchar(10),
  license_expiry_date date,
  primary_store_id uuid,
  employment_status varchar(20) not null default 'ACTIVE',
  hire_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 0,
  is_deleted boolean not null default false,
  check (employment_status in ('ACTIVE', 'ON_LEAVE', 'RESIGNED'))
);

create index if not exists idx_driver_store_status
  on driver(primary_store_id, employment_status);

-- ========== 运营成本台账 ==========

create table if not exists operating_cost_entry (
  id uuid primary key default gen_random_uuid(),
  entry_no varchar(40) not null unique,
  cost_category varchar(30) not null,
  cost_sub_type varchar(40) not null,
  amount numeric(12,2) not null check (amount >= 0),
  tax_amount numeric(12,2) not null default 0 check (tax_amount >= 0),
  cost_date date not null,
  accrual_month varchar(7) not null,
  store_id uuid,
  vehicle_id uuid references vehicle(id),
  driver_id uuid references driver(id),
  order_id uuid references orders(id),
  billing_account_id uuid,
  dept_code varchar(40),
  source varchar(20) not null default 'MANUAL',
  source_ref_id uuid,
  integration_ledger_id uuid,
  vendor_name varchar(128),
  invoice_no varchar(64),
  attachment_urls jsonb not null default '[]'::jsonb,
  remark text,
  status varchar(20) not null default 'DRAFT',
  void_ref_entry_id uuid,
  confirmed_by uuid,
  confirmed_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 0,
  is_deleted boolean not null default false,
  check (cost_category in ('LABOR', 'VEHICLE', 'COMPANY_OPEX', 'THIRD_PARTY', 'ORDER_LINKED')),
  check (source in ('MANUAL', 'IMPORT', 'AUTO_API', 'WORK_ORDER', 'INCIDENT', 'ALLOCATION')),
  check (status in ('DRAFT', 'CONFIRMED', 'VOID')),
  foreign key (cost_category, cost_sub_type)
    references cost_sub_type_dict (cost_category, cost_sub_type)
);

alter table operating_cost_entry
  add constraint fk_operating_cost_void_ref
  foreign key (void_ref_entry_id) references operating_cost_entry(id);

comment on table operating_cost_entry is '车队运营成本台账';
comment on column operating_cost_entry.accrual_month is '权责月 YYYY-MM';

create index if not exists idx_operating_cost_accrual
  on operating_cost_entry(accrual_month, cost_category);

create index if not exists idx_operating_cost_vehicle_month
  on operating_cost_entry(vehicle_id, accrual_month)
  where vehicle_id is not null and status = 'CONFIRMED';

create index if not exists idx_operating_cost_store_month
  on operating_cost_entry(store_id, accrual_month)
  where status = 'CONFIRMED';

create index if not exists idx_operating_cost_driver_month
  on operating_cost_entry(driver_id, accrual_month)
  where driver_id is not null;

create unique index if not exists uq_operating_cost_source_ref
  on operating_cost_entry(source, source_ref_id, cost_sub_type)
  where source_ref_id is not null and status <> 'VOID';

-- ========== 月度预算（P2） ==========

create table if not exists operating_cost_budget (
  id uuid primary key default gen_random_uuid(),
  accrual_month varchar(7) not null,
  store_id uuid,
  cost_category varchar(30),
  cost_sub_type varchar(40),
  budget_amount numeric(12,2) not null check (budget_amount >= 0),
  alert_threshold_pct numeric(5,2) not null default 100.00,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (accrual_month, store_id, cost_sub_type)
);

-- ========== 公司费用分摊规则 ==========

create table if not exists cost_allocation_rule (
  id uuid primary key default gen_random_uuid(),
  rule_code varchar(40) not null unique,
  rule_name varchar(80) not null,
  allocation_method varchar(40) not null,
  source_cost_category varchar(30) not null default 'COMPANY_OPEX',
  is_active boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  effective_from date,
  effective_to date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (allocation_method in (
    'COMPANY_OPEX_BY_REVENUE',
    'COMPANY_OPEX_BY_VEHICLE_COUNT',
    'INSURANCE_BY_VEHICLE',
    'DRIVER_SALARY_BY_ORDER'
  ))
);

-- ========== 第三方接口成本台账 ==========

create table if not exists integration_cost_ledger (
  id uuid primary key default gen_random_uuid(),
  provider varchar(30) not null,
  endpoint varchar(120),
  request_id varchar(64) not null,
  vehicle_id uuid references vehicle(id),
  tenant_id uuid,
  unit_cost numeric(10,4) not null default 0.0600,
  quantity integer not null default 1,
  total_cost numeric(12,4) not null,
  currency varchar(3) not null default 'CNY',
  status varchar(20) not null default 'SUCCESS',
  raw_payload jsonb,
  operating_cost_entry_id uuid references operating_cost_entry(id),
  created_at timestamptz not null default now(),
  unique (provider, request_id)
);

alter table operating_cost_entry
  add constraint fk_operating_cost_integration_ledger
  foreign key (integration_ledger_id) references integration_cost_ledger(id);

create index if not exists idx_integration_cost_provider_time
  on integration_cost_ledger(provider, created_at desc);

create index if not exists idx_integration_cost_vehicle_time
  on integration_cost_ledger(vehicle_id, created_at desc)
  where vehicle_id is not null;

comment on table integration_cost_ledger is '第三方API调用成本；违章默认 unit_cost=0.06';

-- orders.driver_id 外键
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'orders' and column_name = 'driver_id'
  ) and not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'fk_orders_driver' and table_name = 'orders'
  ) then
    alter table orders
      add constraint fk_orders_driver foreign key (driver_id) references driver(id);
  end if;
exception
  when others then null;
end $$;

-- ========== 车辆维保工单 ==========

create table if not exists vehicle_maintenance_work_order (
  id uuid primary key default gen_random_uuid(),
  work_order_no varchar(40) not null unique,
  vehicle_id uuid not null references vehicle(id),
  work_type varchar(20) not null,
  status varchar(20) not null default 'OPEN',
  scheduled_at timestamptz,
  completed_at timestamptz,
  mileage_km bigint,
  vendor_name varchar(128),
  labor_cost numeric(12,2) not null default 0,
  parts_cost numeric(12,2) not null default 0,
  total_cost numeric(12,2) not null default 0,
  description text,
  operating_cost_entry_id uuid references operating_cost_entry(id),
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (work_type in ('MAINTENANCE_ROUTINE', 'REPAIR')),
  check (status in ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
);

create index if not exists idx_vehicle_maint_vehicle_status
  on vehicle_maintenance_work_order(vehicle_id, status);

-- ========== 车辆保险/年审 ==========

create table if not exists vehicle_insurance_policy (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicle(id),
  policy_type varchar(30) not null,
  policy_no varchar(64),
  insurer_name varchar(128),
  premium_amount numeric(12,2) not null,
  effective_from date not null,
  effective_to date not null,
  amortize_monthly boolean not null default true,
  reminder_days_before integer not null default 30,
  status varchar(20) not null default 'ACTIVE',
  attachment_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (policy_type in ('INSURANCE_COMPULSORY', 'INSURANCE_COMMERCIAL', 'ANNUAL_INSPECTION')),
  check (effective_to > effective_from)
);

create index if not exists idx_vehicle_insurance_vehicle_type
  on vehicle_insurance_policy(vehicle_id, policy_type, effective_to desc);

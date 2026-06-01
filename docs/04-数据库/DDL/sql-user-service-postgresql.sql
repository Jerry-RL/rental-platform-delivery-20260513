create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  phone varchar(20) not null unique,
  password_hash varchar(255) not null,
  account_type varchar(20) not null default 'C',
  real_name varchar(64),
  id_number_enc text,
  status smallint not null default 0,
  realname_status varchar(20) not null default 'NOT_SUBMITTED',
  realname_reject_reason varchar(255),
  blacklist_flag boolean not null default false,
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
  license_class varchar(10),
  status smallint not null default 0,
  verify_status varchar(20) not null default 'NOT_SUBMITTED',
  reject_reason varchar(255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 0,
  is_deleted boolean not null default false
);

create index if not exists idx_user_license_user on user_license(user_id);

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

create index if not exists idx_user_realname_user_status on user_realname_verify(user_id, status);

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

create index if not exists idx_eligibility_snapshot_user_time on user_eligibility_snapshot(user_id, snapshot_at desc);

create table if not exists org_account (
  id uuid primary key default gen_random_uuid(),
  org_name varchar(255) not null,
  account_type varchar(20) not null,
  credit_code varchar(60) not null unique,
  primary_admin_user_id uuid not null references users(id),
  contact_name varchar(64),
  contact_phone varchar(20),
  status varchar(20) not null default 'PENDING',
  qualification_status varchar(20) not null default 'DRAFT',
  legal_person_name varchar(64),
  bank_account_enc text,
  business_license_url text,
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

create index if not exists idx_org_invoice_title_org on org_invoice_title(org_id);

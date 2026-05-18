create extension if not exists pgcrypto;

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

create index if not exists idx_user_license_user on user_license(user_id);

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

-- Flyway V1: user service
create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  phone varchar(20) not null unique,
  password_hash varchar(255) not null,
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

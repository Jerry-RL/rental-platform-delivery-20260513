create extension if not exists pgcrypto;

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

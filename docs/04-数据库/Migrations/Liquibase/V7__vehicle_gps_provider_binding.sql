alter table vehicle
  add column if not exists gps_provider varchar(30),
  add column if not exists gps_terminal_id varchar(64),
  add column if not exists gps_sim varchar(20),
  add column if not exists gps_bind_at timestamptz;

create index if not exists idx_vehicle_gps_provider on vehicle(gps_provider);

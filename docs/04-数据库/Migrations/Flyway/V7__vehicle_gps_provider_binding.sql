-- Flyway V7: GPS 供应商绑定（图强/途强、承载视频物联）

alter table vehicle
  add column if not exists gps_provider varchar(30),
  add column if not exists gps_terminal_id varchar(64),
  add column if not exists gps_sim varchar(20),
  add column if not exists gps_bind_at timestamptz;

comment on column vehicle.gps_provider is 'TUQIANG|CHENGZAI_VIDEO_IOT';
comment on column vehicle.gps_terminal_id is '厂商终端号/设备ID';

create index if not exists idx_vehicle_gps_provider on vehicle(gps_provider);

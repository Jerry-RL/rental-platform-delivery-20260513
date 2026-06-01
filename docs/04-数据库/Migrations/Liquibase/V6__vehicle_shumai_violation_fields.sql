alter table vehicle
  add column if not exists engine_no varchar(40),
  add column if not exists vin varchar(40),
  add column if not exists vehicle_type_code varchar(20) not null default 'SMALL';

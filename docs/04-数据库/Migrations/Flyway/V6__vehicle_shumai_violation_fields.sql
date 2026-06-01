-- Flyway V6: 数脉违章查询所需车辆字段

alter table vehicle
  add column if not exists engine_no varchar(40),
  add column if not exists vin varchar(40),
  add column if not exists vehicle_type_code varchar(20) not null default 'SMALL';

comment on column vehicle.engine_no is '发动机号，数脉违章API必填';
comment on column vehicle.vin is '车架号VIN，数脉违章API必填';
comment on column vehicle.vehicle_type_code is 'SMALL|LARGE|NEW_ENERGY，映射数脉车辆类型';

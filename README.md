# 租车平台交付包目录说明

> 完整文档索引见 [docs/00-文档索引概览.md](./docs/00-文档索引概览.md)

## 核心文档（docs/）

- [业务背景与客户痛点说明](./docs/租车平台业务背景与客户痛点说明.md)
- [需求规格说明书 SRS v1.9](./docs/租车平台需求规格说明书.md)
- [技术栈选型说明](./docs/租车平台技术栈选型说明.md)
- [订单定价策略说明](./docs/租车平台订单定价策略说明.md)
- [架构与详细设计 SDD v1.7](./docs/租车平台架构与详细设计说明书.md)
- [需求补充（事故+用户认证）](./docs/租车平台需求补充说明书（事故处理+用户认证细化）.md)

## 目录结构

- `01-需求文档`：需求规格说明书（SRS）
- `02-架构设计`：架构与详细设计说明书（SDD）
- `03-API/OpenAPI`：按服务拆分的 OpenAPI 与总览 OpenAPI
- `03-API/Collections`：Postman/Apifox 导入集合
- `03-API/规范`：错误码与 API 统一规范
- `04-数据库/DDL`：按服务拆分 DDL 与总览 DDL
- `04-数据库/Migrations/Flyway`：Flyway 迁移脚本
- `04-数据库/Migrations/Liquibase`：Liquibase 迁移脚本与 master changelog
- `05-事件契约`：事件 Topic 与 Schema 契约
- `06-项目计划`：一期迭代排期、人力与风险计划
- `07-网关配置`：Kong/Nginx 路由配置草案
- `99-评审归档`：需求评审与设计完善历史稿

## 新增文件（网关）

- `03-API/OpenAPI/openapi-gateway-rental-v1.yaml`：网关合并版 OpenAPI
- `07-网关配置/kong-routes-rental.yaml`：Kong Declarative Config 草案
- `07-网关配置/nginx-routes-rental.conf`：Nginx 反向代理路由草案

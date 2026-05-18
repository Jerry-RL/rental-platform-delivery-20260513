# Rental Platform MVP

## Stack

- Backend: Node.js + Express + TypeScript
- Frontend: React + TypeScript + Vite
- Auth: JWT
- Data: In-memory store (MVP scaffold, replace with PostgreSQL/Redis in next step)

## Project Structure

- `services/api`: API service with users, vehicles, orders, payments, refunds, invoices
- `apps/web-user`: user-side web app for register/login/search/order
- `apps/web-admin`: admin-side web app for callback/pickup/return/invoice flow

## Run

```bash
npm install
npm run dev:api
npm run dev:web-user
npm run dev:web-admin
```

## API Base

- `http://localhost:3000/api/v1`

## Main Flow

1. Open user web app, register and login
2. Search available vehicles and create order
3. Copy order ID into admin app
4. Trigger payment callback success
5. Trigger pickup and return
6. Create invoice

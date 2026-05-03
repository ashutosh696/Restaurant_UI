# Restaurant Ordering System

Two-app restaurant ordering system:

- `restaurant-ui`: React + Vite customer and admin UI
- `restaurant-service`: Spring Boot + MongoDB API

## Features

- Customer menu browsing, cart management, order placement, and status tracking
- Admin menu item create/update/delete
- Incoming order view with status updates: `Preparing`, `Ready`, `Delivered`
- Environment variables for API URL, MongoDB URL, CORS, and server port
- Spring Boot CORS enabled for `/api/**`
- Lightweight backend logging defaults

## Environment

Copy the example env files before running:

```powershell
Copy-Item restaurant-ui\.env.example restaurant-ui\.env
Copy-Item restaurant-service\.env.example restaurant-service\.env
```

Default local endpoints use HTTP:

- UI: `http://localhost:5173`
- API: `http://localhost:8080/api`

## Run

Start MongoDB locally or point `MONGODB_URI` to a hosted MongoDB database.

Backend:

```powershell
cd restaurant-service
mvn spring-boot:run
```

Frontend:

```powershell
cd restaurant-ui
npm install
npm run dev
```

Open `http://localhost:5173`.

## API

- `GET /api/menu`
- `GET /api/menu/available`
- `POST /api/menu`
- `PUT /api/menu/{id}`
- `DELETE /api/menu/{id}`
- `GET /api/orders`
- `POST /api/orders`
- `PATCH /api/orders/{id}/status`

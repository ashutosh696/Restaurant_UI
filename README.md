# Restaurant Ordering System

Two-app restaurant ordering system:

- `restaurant-ui`: React + Vite customer and admin UI
- `restaurant-service`: Spring Boot + MongoDB API

## Features

- Customer menu browsing, cart management, order placement, and status tracking
- Customer ordering is public
- Admin panel requires login
- JWT authentication with `ADMIN` and `USER` roles
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

The backend allows both `http://localhost:5173` and `http://127.0.0.1:5173` for local React development.

## Deployment Environment

For Vercel, set the frontend environment variable:

```properties
VITE_API_URL=https://restaurant-ui-ti7i.onrender.com/api
```

For Render, set the backend environment variable:

```properties
CORS_ALLOWED_ORIGINS=https://restaurant-ui-zeta.vercel.app
```

The React app also normalizes `VITE_API_URL`, so if the value is accidentally set to `https://restaurant-ui-ti7i.onrender.com`, it will call `https://restaurant-ui-ti7i.onrender.com/api/...`.

## MongoDB

Use either local MongoDB or a hosted MongoDB connection string.

Local MongoDB with Docker:

```powershell
docker run --name restaurant-mongo -p 27017:27017 -d mongo:7
```

If the container already exists:

```powershell
docker start restaurant-mongo
```

Local MongoDB without Docker:

1. Install MongoDB Community Server.
2. Start the MongoDB service from Windows Services, or run `mongod`.
3. Keep `MONGODB_URI=mongodb://localhost:27017/restaurant`.

Hosted MongoDB, for example MongoDB Atlas:

```properties
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.example.mongodb.net/restaurant?retryWrites=true&w=majority
```

Put that value in `restaurant-service\.env`.

## Login

The backend creates one admin user on startup if it does not already exist:

```properties
ADMIN_EMAIL=admin@restaurant.local
ADMIN_PASSWORD=admin12345
```

Change these in `restaurant-service\.env` before first startup for a real deployment.

Normal users can browse and place orders without logging in. Admin users must log in to see the admin panel.

The backend also seeds three starter menu items when the `menu_items` collection is empty. Orders are stored in MongoDB in the `orders` collection after a customer places an order.

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

Pages:

- Customer ordering: `http://localhost:5173/customer`
- Admin panel: `http://localhost:5173/admin`

## API

- `GET /api/menu`
- `GET /api/menu/available`
- `POST /api/menu`
- `PUT /api/menu/{id}`
- `DELETE /api/menu/{id}`
- `GET /api/orders`
- `GET /api/orders/{id}`
- `POST /api/orders`
- `PATCH /api/orders/{id}/status`

Public endpoints:

- `GET /api/menu/available`
- `POST /api/orders`
- `GET /api/orders/{id}`
- `POST /api/auth/login`
- `POST /api/auth/register`

Admin-only endpoints:

- `GET /api/menu`
- `POST /api/menu`
- `PUT /api/menu/{id}`
- `DELETE /api/menu/{id}`
- `GET /api/orders`
- `PATCH /api/orders/{id}/status`

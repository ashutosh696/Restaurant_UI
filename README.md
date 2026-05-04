# Restaurant Ordering System

Two-app restaurant ordering system:

- `restaurant-ui`: React + Vite customer and admin UI
- `restaurant-service`: Spring Boot + MongoDB API

## Features

- Customer menu browsing, cart management, order placement, and status tracking
- Customer browsing is public
- Customer signup/sign-in is required before placing an order
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

For Render + MongoDB Atlas:

1. In Atlas, open **Network Access**.
2. Add an access-list entry for Render outbound traffic. For quick testing, use `0.0.0.0/0`, then tighten it later if your Render plan gives stable outbound IPs.
3. In Atlas, open **Database Access** and confirm the database user exists and has read/write access.
4. In Render, set `MONGODB_URI` without quotes. If the password contains special characters like `@`, `#`, `%`, `/`, `:`, or `?`, URL-encode the password.
5. Use an Atlas SRV URI similar to:

```properties
MONGODB_URI=mongodb+srv://USER:URL_ENCODED_PASSWORD@cluster.example.mongodb.net/restaurant?retryWrites=true&w=majority&tls=true
```

The backend will fail during startup if Atlas blocks Render or if the URI credentials are malformed. A common symptom is `MongoTimeoutException` with `SSLException: Received fatal alert: internal_error`.

## Login

The backend creates one admin user on startup if it does not already exist:

```properties
ADMIN_EMAIL=admin@restaurant.local
ADMIN_PASSWORD=admin12345
```

Change these in `restaurant-service\.env` before first startup for a real deployment.
The React admin login form does not prefill these credentials.

Normal users can browse the menu without logging in, but must sign in before placing an order. Admin users must log in to see the admin panel.
Customers can track only their own orders. Admin users can view all incoming orders.

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
- Customer sign in: `http://localhost:5173/signin`
- Customer sign up: `http://localhost:5173/signup`
- Admin panel: `http://localhost:5173/admin`

Vercel serves React as a single-page app. The frontend includes `restaurant-ui/vercel.json` so direct visits to `/customer`, `/signin`, `/signup`, or `/admin` fall back to `index.html`.

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
- `POST /api/auth/login`
- `POST /api/auth/register`

Authenticated customer endpoints:

- `POST /api/orders`
- `GET /api/orders/{id}` for the logged-in customer's own order

Admin-only endpoints:

- `GET /api/menu`
- `POST /api/menu`
- `PUT /api/menu/{id}`
- `DELETE /api/menu/{id}`
- `GET /api/orders`
- `PATCH /api/orders/{id}/status`

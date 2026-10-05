# Elite
Resell Alert System

## Running locally

```bash
npm install && npm run client:install   # first time only
npm run dev                             # API on http://localhost:3000
npm run client                          # React app on http://localhost:5173
```

The React app (`client/`) proxies `/api/*` to the API in dev (see `client/vite.config.js`).
Set `API_URL` to point the proxy elsewhere, or `VITE_API_URL` to call an API directly from a build.

On startup the API connects to MongoDB, logs in the Discord bot, checks saved products for
price changes, and then repeats that check daily at midnight. Price changes are posted to Discord.

## Environment variables

Create a `.env` file in the project root:

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default `3000`) |
| `NODE_ENV` | `development` enables request logging |
| `MONGO_URI` | MongoDB connection string |
| `jwtSecret`, `jwtExpiresIn`, `JWT_COOKIE_EXPIRES` | JWT signing and expiry |
| `Poke_API` | pokemonpricetracker.com API key |
| `DISCORD_BOT_TOKEN` | Discord bot used for price alerts |
| `MAILHOST`, `MAILPORT`, `MAILUSER`, `MAILPASS`, `MAILFROM` | SMTP settings for password reset emails |

## Backend structure

```
Backend/
  server.js        starts the DB, services, and HTTP server
  app.js           Express app, security middleware, rate limits
  routes/          route definitions only (path + middleware + handler name)
  controllers/     request handlers
  middleware/      requireLogin, restrictTo
  models/          Mongoose schemas (User, Product)
  services/        Discord bot and daily price check
  validator/       request validation
  utils/           email helper
```

Routes stay thin: each one maps a path to a handler that lives in `controllers/`, e.g.

```js
appRouter.post("/saveDb", requireLogin, saveProducts);
```

## API

Routes marked 🔒 need an `Authorization: Bearer <token>` header.

**Auth** — `routes/route.js` → `controllers/authController.js`

| Method | Path | Description |
| --- | --- | --- |
| POST | `/signup` | Create an account |
| POST | `/login` | Log in and receive a token |
| POST | `/forgotPassword` | Email a password reset link |
| PATCH | `/resetPassword/:token` | Reset password with the emailed token |
| PATCH | `/updatePassword` 🔒 | Change the current user's password |

**Products** — `routes/appRouter.js` → `controllers/productController.js`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/getSealed?set=<slug>&limit=5` 🔒 | Fetch sealed products for a set from the price API |
| POST | `/saveDb` 🔒 | Save selected products to the watch list (body: `set` plus `products` or `tcgPlayerIds`) |
| GET | `/products` 🔒 | List saved products, newest first |
| DELETE | `/products/:tcgPlayerId` 🔒 | Remove a product from the watch list |

**Users** — `routes/userRoutes.js` → `controllers/userController.js`

| Method | Path | Description |
| --- | --- | --- |
| PATCH | `/updateMe` 🔒 | Update the current user's name or email |
| DELETE | `/deleteMe` 🔒 | Delete the current user's account |
| GET | `/` 🔒 admin | List all users |
| GET / PATCH / DELETE | `/:id` 🔒 admin | Get, update, or delete a user |

The auth endpoints `/login`, `/signup`, and `/forgotPassword` are limited to 10 requests per 15 minutes.
All other endpoints are limited to 300 requests per 15 minutes.

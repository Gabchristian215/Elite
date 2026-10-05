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

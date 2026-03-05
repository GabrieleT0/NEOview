<!-- PROJECT LOGO -->

<p align="center">
  <img src="./public_dashboard/frontend/metabase-dash/public/logo.png" alt="NEOview logo" width="350" />
</p>

<p align="center">
  <strong>A tool for visualizing dashboards and exploring datasets, built on top of <a href="https://www.metabase.com/">Metabase</a>.</strong>
</p>


## Index

- [Prerequisites](#prerequisites)
- [Quickstart (local development)](#quickstart-local-development)
- [Optional: run Metabase locally (Docker)](#optional-run-metabase-locally-docker)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [How to add a new dashboard](#how-to-add-a-new-dashboard)
- [Environment variables (backend)](#environment-variables-backend)
- [Build (frontend)](#build-frontend)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js (18+ suggested)
- npm
- Optional: Docker + Docker Compose (only if you want to run Metabase locally)

## Quickstart (local development)

### 1) Backend

```bash
cd public_dashboard/backend
npm install
```

Create `public_dashboard/backend/.env` (see also “Environment variables” below):

```bash
METABASE_SITE_URL=http://localhost:3000
METABASE_SECRET_KEY=your_metabase_secret_key
PORT=5000
```

Run:

```bash
npm start
```

The backend exposes endpoints like `http://localhost:5000/nodedash/<dashboard-endpoint>`.

### 2) Frontend

```bash
cd public_dashboard/frontend/metabase-dash
npm install
npm start
```

Open: `http://localhost:3000/neoview/`

## Optional: run Metabase locally (Docker)

This repo includes a Docker Compose file at `metabase/docker-compose.yml` (Metabase + Postgres).

```bash
cd metabase
docker compose up -d
```

Notes:
- Metabase is mapped to port `3000` in the compose file, which may conflict with the React dev server (also `3000`).
  - Easiest option: let React start on a different port when prompted (e.g. `3001`).
  - If you change ports, also update the backend CORS origin list accordingly.

## Configuration

### Dashboard list

The visible dashboards are defined in:
- `public_dashboard/frontend/metabase-dash/public/dashboards.json`

The “How to add a new dashboard” section below mentions `public/dashboards.json` — in this repo the file lives at the path above.

### Frontend routing base

The React app is served under `/neoview`:
- `public_dashboard/frontend/metabase-dash/src/App.js` uses `basename='/neoview'`
- `public_dashboard/frontend/metabase-dash/package.json` sets `"homepage": "/neoview"`

### Backend base URL (frontend)

The frontend calls the backend using:
- `public_dashboard/frontend/metabase-dash/src/api.js`

## Project structure

```
metabase/                              # Docker Compose for Metabase
public_dashboard/
  backend/
    server.js                          # Express API — generates signed embed URLs
  frontend/metabase-dash/
    public/
      dashboards.json                  # ← edit this to add/remove dashboards
    src/
      hooks/
        useDashboards.js               # Fetches dashboards.json at runtime
      pages/
        home.js                        # Landing page — reads dashboards.json
        EmbedDash.js                   # Generic iframe component
        DashLoader.js                  # Resolves :dashId from URL → EmbedDash
      App.js                           # Router (no changes needed for new dashboards)
      api.js                           # Backend base URL
```

---

## How to add a new dashboard

### 1 — Enable embedding in Metabase

Open your Metabase instance, navigate to the target dashboard and make sure **Embedding** is enabled. Note the **numeric dashboard ID** shown in the URL (e.g. `5`).

### 2 — Add a backend endpoint (`server.js`)

Open `public_dashboard/backend/server.js` and add a new route:

```js
app.get("/nodedash/my-new-dashboard", (req, res) => {
  const payload = {
    resource: { dashboard: 5 },   // ← Metabase dashboard ID
    params: {},
    exp: Math.round(Date.now() / 1000) + 10 * 60,
  };
  const token = jwt.sign(payload, METABASE_SECRET_KEY);
  const iframeUrl = `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=true`;
  res.json({ iframeUrl });
});
```

### 3 — Add an entry to `dashboards.json`

Open `public/dashboards.json` and append a new object to the array:

```json
{
  "id": "my-new-dashboard",
  "label": "My New Dashboard",
  "description": "Short description shown on the landing card.",
  "icon": "📊",
  "path": "my-new-dashboard",
  "endpoint": "my-new-dashboard"
}
```

| Field | Description |
|---|---|
| `id` | Unique identifier (used as React key) |
| `label` | Title shown on the card and in the iframe |
| `description` | Subtitle shown on the card |
| `icon` | Emoji shown on the card |
| `path` | URL segment: `/neoview/<path>` |
| `endpoint` | Backend route name (without `/nodedash/`) — must match step 2 |

That's it. No changes to `App.js` or any other React source file are required.

### 4 — Restart the services

```bash
# backend
cd public_dashboard/backend && npm start

# frontend
cd public_dashboard/frontend/metabase-dash && npm start
```

The new dashboard will appear as a card on `/neoview/` and will open in a new tab at `/neoview/my-new-dashboard`.

---

## Environment variables (backend)

Create a `.env` file in `public_dashboard/backend/`:

```
METABASE_SITE_URL=https://your-metabase-instance.example.com
METABASE_SECRET_KEY=your_metabase_secret_key
PORT=5000
```

## Build (frontend)

```bash
cd public_dashboard/frontend/metabase-dash
npm run build
```

The build output will be in `public_dashboard/frontend/metabase-dash/build`.

## Troubleshooting

- **Blank iframe / 401 / embedding errors**: ensure embedding is enabled in Metabase and `METABASE_SECRET_KEY` matches your Metabase embedding secret.
- **CORS errors**: update the `origin` allowlist in `public_dashboard/backend/server.js` if you serve the frontend from a different host/port.
- **Wrong base path**: if you do not serve the frontend under `/neoview`, update both `basename` in `App.js` and `homepage` in `package.json`.

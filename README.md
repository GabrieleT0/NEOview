<!-- PROJECT LOGO -->

<p align="center">
  <img src="./dashboards/frontend/metabase-dash/public/logo.png" alt="NEOview logo" width="350" />
</p>

<p align="center">
  <strong>A tool for visualizing dashboards and exploring datasets, built on top of <a href="https://www.metabase.com/">Metabase</a>.</strong>
</p>


## Index

- [Prerequisites](#prerequisites)
- [Docker deployment (recommended)](#docker-deployment-recommended)
  - [Preserving existing Metabase data](#preserving-existing-metabase-data)
  - [If nginx is already installed on the host](#if-nginx-is-already-installed-on-the-host)
- [Local development (without Docker)](#local-development-without-docker)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [How to add a new dashboard](#how-to-add-a-new-dashboard)
- [Environment variables reference](#environment-variables-reference)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

**Docker deployment:** Docker Engine + Docker Compose v2

**Local development:** Node.js 18+, npm

---

## Docker deployment (recommended)

The root `docker-compose.yml` spins up four services:

| Service | Description | Default port |
|---|---|---|
| `postgres` | PostgreSQL — Metabase metadata store | internal |
| `metabase` | Metabase instance | `3000` |
| `dashboard-backend` | Node/Express — JWT embed-URL generator | internal |
| `dashboard-frontend` | React app served by nginx (reverse-proxies `/nodedash/` to the backend) | `8080` |

### 1 — Create the environment file

```bash
cp .env.example .env
# edit .env with your actual values
```

See [Environment variables reference](#environment-variables-reference) for details.

### 2 — Start everything

```bash
docker compose up -d --build
```

The dashboard will be available at `http://your-host:8080/neoview`.  
Metabase will be available at `http://your-host:3000`.

### Preserving existing Metabase data

The compose file sets `name: metabase` at the top level. Docker Compose derives the project name from this field, which makes it use the volume name `metabase_postgres_data` — the exact same name that was created by the previous `metabase/docker-compose.yml` (where the project name was inferred from the directory name `metabase`).

**No data is lost.** The Postgres volume is reused transparently.

Before switching to the new compose file, stop the old stack:

```bash
cd metabase && docker compose down
cd ..
```

Then start with the new one from the repo root:

```bash
docker compose up -d --build
```

### If nginx is already installed on the host

The `dashboard-frontend` container runs its own nginx on port `8080` (not `80`), so there is **no port conflict** with a host nginx by default.

If you want to route traffic through the host nginx on port `80`/`443`, add a server block that proxies to the containers:

```nginx
# /etc/nginx/sites-available/neoview
server {
    listen 80;
    server_name your-domain.com;

    # React dashboard (routed to the container nginx)
    location /neoview {
        proxy_pass         http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    # Metabase
    location /metabase {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

Then enable the site and reload:

```bash
sudo ln -s /etc/nginx/sites-available/neoview /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## Local development (without Docker)

### 1 — Backend

```bash
cd public_dashboard/backend
npm install
```

Create `public_dashboard/backend/.env`:

```env
METABASE_SITE_URL=http://localhost:3000
METABASE_SECRET_KEY=your_metabase_secret_key
PORT=5000
```

```bash
npm start
```

The backend exposes endpoints at `http://localhost:5000/nodedash/<endpoint>`.

### 2 — Frontend

```bash
cd public_dashboard/frontend/metabase-dash
npm install
npm start
```

Open `http://localhost:3000/neoview` (or the port React picks if `3000` is taken).

> **Note:** in local dev `src/api.js` uses the relative URL `/nodedash/` which works when
> the backend is reachable on the same host. If you need to override it, temporarily set
> `base_url` to `http://localhost:5000/nodedash/` in `src/api.js`.

### 3 — Optional: run Metabase locally

```bash
cd metabase
docker compose up -d
```

Metabase starts on port `3000`. If it conflicts with the React dev server, let React use a different port when prompted.

---

## Configuration

### Dashboard list

Add or remove dashboards by editing:

```
public_dashboard/frontend/metabase-dash/public/dashboards.json
```

### Frontend routing base

The React app is served under `/neoview`:
- `public_dashboard/frontend/metabase-dash/src/App.js` — `basename='/neoview'`
- `public_dashboard/frontend/metabase-dash/package.json` — `"homepage": "/neoview"`

### Backend base URL

`public_dashboard/frontend/metabase-dash/src/api.js` exports `base_url`.  
In production (Docker) this is `/nodedash/` (relative, routed by the container nginx).  
Change it only if you have a custom setup.

---

## Project structure

```
docker-compose.yml                     # ← root compose (all services)
.env.example                           # ← copy to .env and fill in values
metabase/
  docker-compose.yml                   # legacy standalone Metabase compose
public_dashboard/
  backend/
    Dockerfile
    server.js                          # Express API — generates signed embed URLs
  frontend/metabase-dash/
    Dockerfile
    nginx.conf                         # nginx config for the frontend container
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

### 2 — Register the dashboard in `server.js`

Open `public_dashboard/backend/server.js` and add an entry to the `dashboards` map:

```js
const dashboards = {
  "degree-programs":  3,
  "research-profiles": 4,
  "infrastructures":  5,
  "my-new-dashboard": 6,   // ← route name : Metabase dashboard ID
};
```

The single `/nodedash/:name` route handles all dashboards automatically — no new route function needed.

### 3 — Add an entry to `dashboards.json`

Open `public_dashboard/frontend/metabase-dash/public/dashboards.json` and append:

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

### 4 — Apply the changes

**Docker (production):**

```bash
docker compose up -d --build dashboard-backend dashboard-frontend
```

**Local dev:**

```bash
# backend
cd public_dashboard/backend && npm start

# frontend
cd public_dashboard/frontend/metabase-dash && npm start
```

The new dashboard will appear as a card on `/neoview/` and will open at `/neoview/my-new-dashboard`.

---

## Environment variables reference

All variables are read from a `.env` file in the **repo root** (used by `docker-compose.yml`).  
Copy `.env.example` to `.env` and fill in the values.

| Variable | Used by | Description |
|---|---|---|
| `POSTGRES_USER` | postgres, metabase | Postgres username |
| `POSTGRES_DB` | postgres, metabase | Postgres database name |
| `POSTGRES_PASSWORD` | postgres, metabase | Postgres password |
| `MB_SITE_URL` | metabase | Public URL of Metabase (shown in admin settings) |
| `METABASE_SITE_URL` | dashboard-backend | Metabase URL used to build iframe embed URLs |
| `METABASE_SECRET_KEY` | dashboard-backend | Metabase embedding secret key (Settings → Embedding) |
| `FRONTEND_PORT` | dashboard-frontend | Host port for the React nginx container (default `8080`) |
| `CORS_ORIGINS` | dashboard-backend | Optional comma-separated extra CORS origins |

For **local development only**, create `public_dashboard/backend/.env` with at minimum:

```env
METABASE_SITE_URL=http://localhost:3000
METABASE_SECRET_KEY=your_metabase_secret_key
PORT=5000
```

---

## Troubleshooting

- **Blank iframe / 401 / embedding errors** — ensure embedding is enabled in Metabase and `METABASE_SECRET_KEY` matches your Metabase embedding secret.
- **CORS errors** — add the offending origin to `CORS_ORIGINS` in `.env` and restart the backend container.
- **Wrong base path** — if you do not serve the frontend under `/neoview`, update both `basename` in `App.js` and `homepage` in `package.json`, then rebuild the frontend image.
- **Port conflict on host** — change `FRONTEND_PORT` in `.env` (e.g. `FRONTEND_PORT=9090`) or set up a host nginx reverse proxy as described [above](#if-nginx-is-already-installed-on-the-host).

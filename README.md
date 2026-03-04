# metabase-NEOLAiA

Public dashboard viewer built with a Node.js/Express backend and a React frontend. Dashboards are embedded as signed iframes from a Metabase instance.

---

## Project structure

```
metabase/                         # Docker Compose for Metabase
public_dashboard/
  backend/                        # Express API — generates signed embed URLs
    server.js
  frontend/metabase-dash/         # React app
    src/
      pages/
        home.js                   # Landing page (dashboard list)
        EmbedDash.js              # Generic iframe dashboard component
      App.js                      # Router
      api.js                      # Base URL for the backend
```

---

## How to add a new dashboard

### 1 — Enable embedding in Metabase

Open your Metabase instance, go to the target dashboard and make sure **Embedding** is enabled for it. Note the **dashboard numeric ID** shown in the URL (e.g. `5`).

### 2 — Add a backend endpoint (`server.js`)

Open `public_dashboard/backend/server.js` and add a new route following the same pattern as the existing ones:

```js
app.get("/nodedash/my-new-dashboard", (req, res) => {
  const payload = {
    resource: { dashboard: 5 },   // ← replace with the actual Metabase dashboard ID
    params: {},
    exp: Math.round(Date.now() / 1000) + 10 * 60,
  };
  const token = jwt.sign(payload, METABASE_SECRET_KEY);
  const iframeUrl = `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=true`;
  res.json({ iframeUrl });
});
```

### 3 — Add a card on the landing page (`home.js`)

Open `public_dashboard/frontend/metabase-dash/src/pages/home.js` and add an entry to the `dashboards` array:

```js
{
  id: "my-new-dashboard",
  label: "My New Dashboard",
  description: "Short description shown on the card.",
  icon: "📊",                         // any emoji
  path: "my-new-dashboard",           // URL segment: /neoview/my-new-dashboard
  endpoint: "my-new-dashboard",       // must match the route defined in step 2 (without /nodedash/)
},
```

### 4 — Add a route in `App.js`

Open `public_dashboard/frontend/metabase-dash/src/App.js` and add a `<Route>` inside `<Routes>`:

```jsx
<Route
  path='/my-new-dashboard'
  element={<EmbedDash endpoint="my-new-dashboard" title="My New Dashboard" />}
/>
```

### 5 — Restart the services

```bash
# backend
cd public_dashboard/backend && npm start

# frontend
cd public_dashboard/frontend/metabase-dash && npm start
```

The new dashboard will appear as a card on the landing page at `/neoview/` and will open in a new tab at `/neoview/my-new-dashboard`.

---

## Environment variables (backend)

Create a `.env` file in `public_dashboard/backend/`:

```
METABASE_SITE_URL=https://your-metabase-instance.example.com
METABASE_SECRET_KEY=your_metabase_secret_key
PORT=5000
```

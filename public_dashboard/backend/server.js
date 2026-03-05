require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require('cors');

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost', 'http://localhost:80'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

port = process.env.PORT || 5000;
const METABASE_SITE_URL = process.env.METABASE_SITE_URL;
const METABASE_SECRET_KEY = process.env.METABASE_SECRET_KEY;

const dashboards = {
  "degree-programs": 3,
  "research-profiles": 4,
  "infrastructures": 5,
};

app.get("/nodedash/:name", (req, res) => {
  const dashboardId = dashboards[req.params.name];
  if (!dashboardId) {
    return res.status(404).json({ error: "Dashboard not found" });
  }

  const payload = {
    resource: { dashboard: dashboardId },
    params: {},
    exp: Math.round(Date.now() / 1000) + 10 * 60, // 10-minute expiration
  };

  const token = jwt.sign(payload, METABASE_SECRET_KEY);
  const iframeUrl = `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=true`;
  res.json({ iframeUrl });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);  
});
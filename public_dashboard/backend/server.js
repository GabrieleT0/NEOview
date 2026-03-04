require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require('cors');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

port = process.env.PORT || 5000;
const METABASE_SITE_URL = process.env.METABASE_SITE_URL;
const METABASE_SECRET_KEY = process.env.METABASE_SECRET_KEY;

app.get("/nodedash/metabase-dashboard", (req, res) => {
  const payload = {
    resource: { dashboard: 3 },
    params: {},
    exp: Math.round(Date.now() / 1000) + 10 * 60, // 10-minute expiration
  };

  const token = jwt.sign(payload, METABASE_SECRET_KEY);
  const iframeUrl = `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=true`;
  res.json({ iframeUrl });
});

app.get("/nodedash/research-profiles", (req, res) => {
  const payload = {
    resource: { dashboard: 4 },
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
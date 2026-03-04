import React, { useState, useEffect } from "react";
import axios from "axios";
import { base_url } from "../api";

const EmbedDash = ({ endpoint, title }) => {
  const [iframeUrl, setIframeUrl] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    setIframeUrl("");
    setError(null);
    axios
      .get(`${base_url}${endpoint}`)
      .then((response) => setIframeUrl(response.data.iframeUrl))
      .catch((err) => {
        console.error("Error fetching Metabase URL", err);
        setError("Failed to load dashboard.");
      });
  }, [endpoint]);

  if (error) return <p style={{ padding: "2rem" }}>{error}</p>;

  return (
    <div style={{ height: "100vh", margin: 0 }}>
      {iframeUrl ? (
        <iframe
          title={title || endpoint}
          src={iframeUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: "none" }}
        />
      ) : (
        <p style={{ padding: "2rem" }}>Loading dashboard...</p>
      )}
    </div>
  );
};

export default EmbedDash;

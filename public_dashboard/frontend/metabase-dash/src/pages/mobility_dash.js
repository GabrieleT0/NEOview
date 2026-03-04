import React, { useState, useEffect } from "react";
import axios from "axios";
import { base_url } from '../api';

const Dashboard = () => {
  const [iframeUrl, setIframeUrl] = useState("");

  useEffect(() => {
    axios.get(`${base_url}metabase-dashboard`)
      .then(response => setIframeUrl(response.data.iframeUrl))
      .catch(error => console.error("Error fetching Metabase URL", error));
  }, []);

  return (
    <div style={{ height: "100vh", margin: 0 }}>
      {iframeUrl ? (
        <iframe
          title="Mobility Window"
          src={iframeUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: "none" }}
        ></iframe>
      ) : (
        <p>Loading dashboard...</p>
      )}
    </div>
  );
};

export default Dashboard;
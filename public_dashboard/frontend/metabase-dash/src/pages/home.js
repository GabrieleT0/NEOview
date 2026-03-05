import React, { useState } from "react";
import useDashboards from "../hooks/useDashboards";

const Home = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const { dashboards, loading, error } = useDashboards();

  return (
    <div style={styles.pageWrapper}>
      {/* Header */}
      <header style={styles.header}>
        {/* Top bar: EU logo left, NEOLAiA logo right */}
        <div style={styles.topBar}>
          <img
            src={`${process.env.PUBLIC_URL}/logo_neolaia.png`}
            alt="NEOLAiA"
            style={styles.neoliaLogo}
          />
          <img
            src={`${process.env.PUBLIC_URL}/eu_logo.png`}
            alt="European Union"
            style={styles.euLogo}
          />
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Central project logo + subtitle */}
        <div style={styles.heroSection}>
          <img
            src={`${process.env.PUBLIC_URL}/logo.png`}
            alt="Project Logo"
            style={styles.mainLogo}
          />
          <p style={styles.subtitle}>Select a dashboard to start exploring data</p>
        </div>
      </header>

      {/* Dashboard cards */}
      <main style={styles.mainContent}>
        {loading && <p style={{ textAlign: "center", color: "#6b7c8a" }}>Loading dashboards...</p>}
        {error   && <p style={{ textAlign: "center", color: "#e74c3c" }}>{error}</p>}
        <div style={styles.grid}>
          {dashboards.map((dash) => (
            <div
              key={dash.id}
              style={{
                ...styles.card,
                ...(hoveredCard === dash.id ? styles.cardHover : {}),
              }}
              onClick={() => window.open(`/neoview/${dash.path}`, "_blank")}
              onMouseEnter={() => setHoveredCard(dash.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={styles.cardIconWrapper}>
                <span style={styles.cardIcon}>{dash.icon}</span>
              </div>
              <div style={styles.cardBody}>
                <h2 style={styles.cardTitle}>{dash.label}</h2>
                <p style={styles.cardDesc}>{dash.description}</p>
              </div>
              <span
                style={{
                  ...styles.cardArrow,
                  ...(hoveredCard === dash.id ? styles.cardArrowHover : {}),
                }}
              >
                →
              </span>
            </div>
          ))}
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: "#f4f7fa",
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    display: "flex",
    flexDirection: "column",
  },

  /* ── Header ── */
  header: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e8eef3",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    padding: "0.6rem 2.5rem 1rem",
  },

  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "0.30rem",
  },

  euLogo: {
    height: "43px",
    objectFit: "contain",
  },

  neoliaLogo: {
    height: "40px",
    objectFit: "contain",
  },

  divider: {
    height: "1px",
    backgroundColor: "#e8eef3",
    marginBottom: "3rem",
  },

  heroSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "1rem",
  },

  mainLogo: {
    maxHeight: "150px",
    maxWidth: "400px",
    objectFit: "contain",
  },

  subtitle: {
    fontSize: "1.15rem",
    fontWeight: "700",
    color: "#1a2f44",
    margin: 0,
    letterSpacing: "0.3px",
  },

  hint: {
    fontSize: "0.95rem",
    color: "#6b7c8a",
    margin: 0,
  },

  /* ── Cards ── */
  mainContent: {
    flex: 1,
    padding: "2.5rem",
    maxWidth: "900px",
    width: "100%",
    margin: "0 auto",
    boxSizing: "border-box",
    animation: "fadeIn 0.4s ease",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
  },

  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "2rem",
    border: "1px solid #e8eef3",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
    transition: "all 0.25s ease",
  },

  cardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 36px rgba(124, 111, 214, 0.18)",
    borderColor: "#7c6fd6",
  },

  cardIconWrapper: {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    backgroundColor: "#f0eeff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  cardIcon: {
    fontSize: "1.6rem",
  },

  cardBody: {
    flex: 1,
    minWidth: 0,
  },

  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#1a2f44",
    margin: "0 0 0.4rem 0",
  },

  cardDesc: {
    fontSize: "0.9rem",
    color: "#6b7c8a",
    margin: 0,
    lineHeight: "1.5",
  },

  cardArrow: {
    fontSize: "1.4rem",
    color: "#c5d1db",
    transition: "color 0.2s ease, transform 0.2s ease",
    flexShrink: 0,
  },

  cardArrowHover: {
    color: "#7c6fd6",
    transform: "translateX(4px)",
  },
};

export default Home;
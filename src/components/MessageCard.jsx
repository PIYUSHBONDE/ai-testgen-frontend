import React from "react";

const styles = {
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    background: "white",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  header: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
  },
  title: { margin: 0, fontSize: 18, color: "#111827" },
  idPill: {
    fontSize: 12,
    color: "#374151",
    background: "#F3F4F6",
    border: "1px solid #E5E7EB",
    borderRadius: 999,
    padding: "2px 8px",
    whiteSpace: "nowrap",
  },
  message: {
    color: "#374151",
    fontSize: 14,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap", // preserve \n line breaks
  },
};

function MessageCard({ title, id, message }) {
  return (
    <div style={styles.card}>
      {(title || id) && (
        <div style={styles.header}>
          {title ? <h3 style={styles.title}>{title}</h3> : <span />}
          {id ? <span style={styles.idPill}>{id}</span> : null}
        </div>
      )}

      <div style={styles.message}>
        {message}
      </div>
    </div>
  );
}

export default MessageCard;

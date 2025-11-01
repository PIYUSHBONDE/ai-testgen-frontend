// import React from "react";

// const styles = {
//   card: {
//     border: "1px solid #e5e7eb",
//     borderRadius: 12,
//     padding: 16,
//     boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
//     background: "white",
//     display: "flex",
//     flexDirection: "column",
//     gap: 12,
//   },
//   header: {
//     display: "flex",
//     alignItems: "baseline",
//     justifyContent: "space-between",
//     gap: 12,
//   },
//   title: { margin: 0, fontSize: 18, color: "#111827" },
//   idPill: {
//     fontSize: 12,
//     color: "#374151",
//     background: "#F3F4F6",
//     border: "1px solid #E5E7EB",
//     borderRadius: 999,
//     padding: "2px 8px",
//     whiteSpace: "nowrap",
//   },
//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: 600,
//     margin: "8px 0 4px",
//     color: "#111827",
//   },
//   expectedBox: {
//     background: "#F9FAFB",
//     border: "1px solid #E5E7EB",
//     borderRadius: 8,
//     padding: 12,
//     color: "#1F2937",
//   },
//   metaRow: {
//     display: "flex",
//     flexWrap: "wrap",
//     gap: 8,
//     alignItems: "center",
//   },
//   metaItem: {
//     fontSize: 12,
//     color: "#374151",
//     background: "#F3F4F6",
//     border: "1px solid #E5E7EB",
//     borderRadius: 6,
//     padding: "2px 8px",
//   },
//   ul: { margin: 0, paddingLeft: 18 },
//   ol: { margin: 0, paddingLeft: 22, listStyleType: "decimal" },
//   liNormal: { marginBottom: 6, color: "#374151" },
//   liDark: { marginBottom: 6, color: "#111827", fontWeight: 600 },
//   rationaleBox: {
//     background: "#FFF",
//     borderLeft: "3px solid #6B7280",
//     padding: "8px 12px",
//     color: "#374151",
//     borderRadius: 4,
//   },
// };

// function TestCaseCard({ testcase }) {
//   const {
//     id = "",
//     title = "",
//     preconditions = [],
//     steps = [],
//     expected = "",
//     risk = "",
//     regulatory_refs = [],
//     rationale = "",
//   } = testcase || {};

//   // Strip any leading numeric prefixes like "1. " so <ol> handles numbering (1,2,3)
//   const normalizedSteps = steps.map((s) => s.replace(/^\s*\d+\.\s*/, ""));

//   return (
//     <div style={styles.card}>
//       <div style={styles.header}>
//         <h3 style={styles.title}>{title}</h3>
//         {id ? <span style={styles.idPill}>{id}</span> : null}
//       </div>

//       <div style={styles.metaRow}>
//         {risk ? <span style={styles.metaItem}>Risk: {risk}</span> : null}
//         {Array.isArray(regulatory_refs) &&
//           regulatory_refs.map((ref, idx) => (
//             <span key={`ref-${idx}`} style={styles.metaItem}>
//               {ref}
//             </span>
//           ))}
//       </div>

//       {Array.isArray(preconditions) && preconditions.length > 0 && (
//         <div>
//           <div style={styles.sectionTitle}>Preconditions</div>
//           <ul style={styles.ul}>
//             {preconditions.map((p, idx) => (
//               <li key={`pre-${idx}`} style={styles.liNormal}>
//                 {p}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {Array.isArray(normalizedSteps) && normalizedSteps.length > 0 && (
//         <div>
//           <div style={styles.sectionTitle}>Steps</div>
//           <ol style={styles.ol} type="1" start={1}>
//             {normalizedSteps.map((step, idx) => (
//               <li key={`step-${idx}`} style={styles.liDark}>
//                 {step}
//               </li>
//             ))}
//           </ol>
//         </div>
//       )}

//       {expected && (
//         <div>
//           <div style={styles.sectionTitle}>Expected Result</div>
//           <div style={styles.expectedBox}>{expected}</div>
//         </div>
//       )}

//       {rationale && (
//         <div>
//           <div style={styles.sectionTitle}>Rationale</div>
//           <div style={styles.rationaleBox}>{rationale}</div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default TestCaseCard;


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
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    margin: "8px 0 4px",
    color: "#111827",
  },
  // REMOVED: expectedBox (no longer needed)
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  metaItem: {
    fontSize: 12,
    color: "#374151",
    background: "#F3F4F6",
    border: "1px solid #E5E7EB",
    borderRadius: 6,
    padding: "2px 8px",
  },
  ul: { margin: 0, paddingLeft: 18 },
  liNormal: { marginBottom: 6, color: "#374151" },
  // REMOVED: ol, liDark (replaced by table)
  rationaleBox: {
    background: "#FFF",
    borderLeft: "3px solid #6B7280",
    padding: "8px 12px",
    color: "#374151",
    borderRadius: 4,
  },
  // --- NEW TABLE STYLES ---
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: 8,
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    overflow: 'hidden', // Ensures border radius is respected by children
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  },
  th: {
    background: '#F9FAFB',
    borderBottom: '1px solid #E5E7EB',
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  td: {
    borderBottom: '1px solid #E5E7EB',
    padding: '10px 12px',
    fontSize: 14,
    color: '#1F2937',
    verticalAlign: 'top',
    lineHeight: 1.5,
  },
  // --- END NEW STYLES ---
};

function TestCaseCard({ testcase }) {
  const {
    id = "",
    title = "",
    preconditions = [],
    // --- CHANGED: Remove 'steps' and 'expected' ---
    // steps = [],
    // expected = "",
    // --- NEW: Add 'stepDetails' ---
    stepDetails = [],
    risk = "",
    regulatory_refs = [],
    rationale = "",
  } = testcase || {};

  // --- REMOVED: normalizedSteps is no longer needed ---

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>{title}</h3>
        {id ? <span style={styles.idPill}>{id}</span> : null}
      </div>

      <div style={styles.metaRow}>
        {risk ? <span style={styles.metaItem}>Risk: {risk}</span> : null}
        {Array.isArray(regulatory_refs) &&
          regulatory_refs.map((ref, idx) => (
            <span key={`ref-${idx}`} style={styles.metaItem}>
              {ref}
            </span>
          ))}
      </div>

      {Array.isArray(preconditions) && preconditions.length > 0 && (
        <div>
          <div style={styles.sectionTitle}>Preconditions</div>
          <ul style={styles.ul}>
            {preconditions.map((p, idx) => (
              <li key={`pre-${idx}`} style={styles.liNormal}>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* --- REPLACED: This now renders the table --- */}
      {Array.isArray(stepDetails) && stepDetails.length > 0 && (
        <div>
          <div style={styles.sectionTitle}>Test Steps</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, width: '50%'}}>Step Description</th>
                <th style={{...styles.th, width: '50%'}}>Expected Result</th>
              </tr>
            </thead>
            <tbody>
              {stepDetails.map((item, idx) => (
                <tr key={`step-${idx}`}>
                  {/* We add our own numbering (idx + 1) */}
                  <td style={{...styles.td, ...(idx === stepDetails.length - 1 && { borderBottom: 'none' })}}>
                    {idx + 1}. {item.step.replace(/^\s*\d+\.\s*/, "")}
                  </td>
                  <td style={{...styles.td, ...(idx === stepDetails.length - 1 && { borderBottom: 'none' })}}>
                    {item.expected}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* --- END REPLACEMENT --- */}

      {/* --- REMOVED: The old 'Expected Result' box is gone --- */}
      
      {rationale && (
        <div>
          <div style={styles.sectionTitle}>Rationale</div>
          <div style={styles.rationaleBox}>{rationale}</div>
        </div>
      )}
    </div>
  );
}

export default TestCaseCard;
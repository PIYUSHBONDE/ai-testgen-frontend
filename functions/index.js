/* eslint-env node */
/* global require, exports */
// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// In modern Node runtimes (18+) global fetch is available in Cloud Functions.
// Avoid requiring node-fetch to prevent ESM/CommonJS mismatch at runtime.
const { GoogleAuth } = require("google-auth-library");
const { BigQuery } = require("@google-cloud/bigquery");
const crypto = require("crypto");

admin.initializeApp();
const bigquery = new BigQuery();

// basic redaction placeholder — replace with real PHI redaction
function redactPHI(text) {
  if (!text) return text;
  return text
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[REDACTED_EMAIL]")
    .replace(/\b\d{10}\b/g, "[REDACTED_PHONE]");
}

exports.callVertexAgent = functions.https.onCall(async (data, context) => {
  // --- auth check (Firebase callable passes context.auth)
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
  }
  const userId = context.auth.uid;
  const requirementId = data.requirementId || null;
  const requirementText = data.text || "";

  // --- redact PHI prior to outbound calls
  const safeText = redactPHI(requirementText);

  // --- get GCP access token (server-side) using ADC (function runs with service account)
  const auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
  const client = await auth.getClient();
  // google-auth-library's getAccessToken() can return different shapes between versions.
  const tokenRes = await client.getAccessToken();
  const accessToken = typeof tokenRes === 'string' ? tokenRes : (tokenRes && (tokenRes.token || tokenRes.access_token));
  if (!accessToken) {
    throw new functions.https.HttpsError("internal", "Failed to obtain access token.");
  }

  // --- Vertex Agent endpoint (set via functions config or secret)
  // Example: https://REGION-aiplatform.googleapis.com/v1/projects/PROJECT/locations/LOCATION/agentInstances/AGENT_ID:run
  const agentUrl = functions.config().vertex.agent_url;
  if (!agentUrl) {
    throw new functions.https.HttpsError("failed-precondition", "Vertex agent URL not configured.");
  }

  const payload = {
    input: {
      text: safeText,
      metadata: { requirementId, userId }
    }
  };

  // --- call Vertex Agent
  const resp = await fetch(agentUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new functions.https.HttpsError("internal", `Vertex call failed: ${resp.status} ${body}`);
  }
  const agentResponse = await resp.json();

  // --- audit: store a hashed prompt and metadata to BigQuery
  const promptHash = crypto.createHash("sha256").update(safeText).digest("hex");
  const datasetId = functions.config().bq.dataset;
  const tableId = functions.config().bq.table;
  const row = {
    event_id: `evt-${Date.now()}-${Math.floor(Math.random()*10000)}`,
    requirement_id: requirementId,
    user_id: userId,
    agent_response: JSON.stringify(agentResponse),
    testcase_ids: (agentResponse.generated_test_ids || []),
    vertex_model: agentResponse.model || null,
    prompt_hash: promptHash,
    created_at: new Date().toISOString()
  };

  try {
    // BigQuery insert expects an array of rows
    if (datasetId && tableId) {
      await bigquery.dataset(datasetId).table(tableId).insert([row]);
    } else {
      console.warn('BigQuery dataset/table not configured; skipping insert');
    }
  } catch (err) {
    console.error("BigQuery insert failed:", err);
    // choose to continue (UI still gets response) — log for later investigation
  }

  return { agentResponse, promptHash };
});

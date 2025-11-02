# AI TestGen — Frontend (React + Vite)

This is the React + Vite frontend for AI TestGen. It provides the UI for uploading documents, running the ADK Master Agent, reviewing/ refining testcases and exporting to Jira.

## Quick summary
- Stack: React, Vite, Tailwind (used in project), axios for HTTP calls.
- Entry points: `src/main.jsx`, `src/App.jsx`.
- API client: `src/api.js` — single place to adjust `API_BASE`.

## Developer / user flow (end-to-end)
1. User signs in (Auth depends on your config) and lands in the workspace.
2. Create a new session: frontend calls `POST ${API_BASE}/new-session` (via `createNewSession` in `src/api.js`).
3. Upload documents (optional for RAG): `uploadFile(userId, sessionId, file)` → `/api/rag/upload`.
4. Run the ADK agent: user enters a prompt (or chooses a feature) and frontend sends `POST ${API_BASE}/agent/run` with `{ user_id, session_id, message }` using `runAgent` in `src/api.js`.
5. The backend MasterAgent invokes the ADK pipeline and writes results to session state. Frontend polls or fetches messages via `GET ${API_BASE}/sessions/{session_id}/messages`.
6. User reviews generated testcases in the Review UI and can refine, request a re-run (calls `/agent/run` again) or run enhancement flow.
7. Export to Jira: frontend calls `/api/jira/create-test-case` (via `createJiraTestCase`), or uses OAuth flows provided by `/api/jira/*` endpoints.

## Mapping of screens → code
- Upload documents: `src/components/UploadView.jsx` (uses `uploadFile` from `src/api.js`)
- Run test / prompt: `src/components/RunTestForm.jsx` (calls `runAgent`)
- Review & refine: `src/components/ReviewRefineView.jsx`, `src/components/TestCaseCard.jsx`
- Chat / message timeline: `src/components/chat/ChatPanel.tsx`, `ChatWorkspace.tsx` (uses `fetchMessages`, `sendMessage`)
- Session list: code uses `fetchSessions(userId)` in `src/api.js` to list sessions

## API configuration
- The frontend reads `API_BASE` from `src/api.js` constant or you can create `.env.local` with `VITE_API_BASE` and adapt `src/api.js` to read `process.env.VITE_API_BASE`.
- Example `.env.local`:
  - VITE_API_BASE="http://localhost:8080"

## Local setup (Windows / PowerShell)
1. Open folder:
   - cd "d:\Gen AI Hackathon\ai-testgen-frontend"
2. Install dependencies:
   - npm install
3. Set env (PowerShell):
   - $env:VITE_API_BASE = "http://localhost:8080"
   - Or create `.env.local` with `VITE_API_BASE`.
4. Run dev server:
   - npm run dev
5. Build for production:
   - npm run build
6. Preview production build:
   - npm run preview

## Integration & endpoints used (from `src/api.js`)
- `runAgent(userId, sessionId, message)` → POST `${API_BASE}/agent/run`
- `createNewSession(userId)` → POST `${API_BASE}/new-session`
- `uploadFile(...)` → POST `${API_BASE}/api/rag/upload`
- `fetchSessionDocuments(userId, sessionId)` → GET `${API_BASE}/api/rag/documents/session/${sessionId}`
- `toggleDocumentActive(userId, documentId, state)` → PATCH `${API_BASE}/api/rag/documents/${documentId}/toggle`
- Jira flows: `/api/jira/*` endpoints for connect/status/projects/create-test-case/import etc.

## CORS and local dev
- If you run frontend on `localhost:5173` and backend on `localhost:8080`, ensure the backend allows CORS. Update `main.py` to include `fastapi.middleware.cors.CORSMiddleware` for local dev origins.

## Testing & linting
- Test runner or unit tests: project may not include tests by default. Use your preferred test framework (Jest, React Testing Library).
- Linting: if present, use `npm run lint`.

## Deployment suggestions
- Host static app on Vercel/Netlify/Firebase Hosting or a static bucket behind a CDN.
- In production, set `VITE_API_BASE` in the hosting environment to the backend URL.

## Troubleshooting
- If requests to backend fail: open browser devtools Network tab and inspect calls the frontend makes (see `src/api.js` for exact paths).
- For authentication issues: confirm any auth tokens are forwarded in API requests.

## Quick notes for maintainers
- Keep `src/api.js` as single source-of-truth for backend endpoints. Update `API_BASE` for different deployments.
- Document any changes to API endpoints in the backend README so frontend can be updated accordingly.

---
If you'd like I can add a short visual user-flow SVG or Mermaid diagram into this README and produce sample cURL snippets for the most important flows.

## Features (core)
- Authentication / Authorization (pluggable)
- Session management (create/list/rename sessions)
- Document ingestion (RAG): upload documents, view session documents, toggle active docs
- Run ADK Agent: send prompts and trigger the MasterAgent orchestration
- Testcase generation pipeline: review, refine, accept/reject generated testcases
- Enhancement flow: request enhancements (improve clarity, add steps, add validations)
- Jira integration: OAuth connect, fetch projects/requirements, export testcases as Jira test cases
- Message/chat timeline: conversation-style assistant messages and agent responses
- Export / download: export testcases to Jira or export locally (JSON)

## User flow (mermaid)
Below is a compact visual user flow you can render with Mermaid-enabled viewers (GitHub supports Mermaid in README):

```mermaid
flowchart TD
   U[User (Browser)] -->|1. Sign in| Auth[Auth System]
   U -->|2. Create session| FrontendApp[Frontend App]
   FrontendApp -->|POST /new-session| BackendAPI[Backend API]
   U -->|3. Upload docs (optional)| Upload[Upload View]
   Upload -->|POST /api/rag/upload| BackendAPI
   FrontendApp -->|4. Run agent (message)| RunForm[Run Test Form]
   RunForm -->|POST /agent/run {user_id, session_id, message}| BackendAPI
   BackendAPI -->|invoke| MasterAgent[MasterAgent (ADK)]
   MasterAgent -->|delegate| Orchestrator[Testcase Orchestrator]
   Orchestrator -->|spawn| Subagents[Testcase Generator / Reviewer / Refiner / Collector]
   Subagents -->|write| SessionState[session.state / models]
   BackendAPI -->|5. Poll / fetch messages| FrontendApp
   FrontendApp -->|6. Review & refine UI| ReviewUI[ReviewRefineView]
   ReviewUI -->|PATCH/POST| BackendAPI
   FrontendApp -->|7. Export to Jira| JiraFlow[Jira connect / create test case]
   JiraFlow -->|calls| BackendAPI
   BackendAPI -->|call| JiraService[Jira Service]
```

### Step-by-step mapping (detailed)
- 1 — Sign in: optional depending on your auth (not included in repo by default). If implemented, ensure token is attached to requests from frontend.
- 2 — Create session: `createNewSession(userId)` -> POST `/new-session`. Frontend stores session id locally and shows in the session list.
- 3 — Upload documents (optional): `uploadFile(userId, sessionId, file)` -> POST `/api/rag/upload`. Backend will index/ingest and link documents to session; frontend can call `fetchSessionDocuments` to list them.
- 4 — Run the agent: `runAgent(userId, sessionId, message)` -> POST `/agent/run`. Backend routes to MasterAgent which delegates to the orchestrator or enhancer depending on the request/context.
- 5 — Fetch / Poll results: `fetchMessages(userId, sessionId)` -> GET `/sessions/{sessionId}/messages` to read assistant/agent outputs and render them in chat/review UI.
- 6 — Review & refine: UI lets the user accept, edit, or request refinements; these actions generally trigger new calls to `/agent/run` or specific endpoints for reviewer/refiner subagents.
- 7 — Jira export: `createJiraTestCase(userId, projectKey, testCase, requirementKey)` -> POST `/api/jira/create-test-case`.

### Screens → endpoints quick mapping
- UploadView.jsx → `uploadFile` → `/api/rag/upload`
- RunTestForm.jsx → `runAgent` → `/agent/run`
- ChatPanel.tsx → `sendMessage` & `fetchMessages` → `/sessions/{session_id}/messages`
- ReviewRefineView.jsx → UI triggers additional `/agent/run` flows and may call `/api/rag/*` or `/api/jira/*`

## Example cURL snippets (quick smoke tests)
- Create a new session:

```bash
curl -X POST "http://localhost:8080/new-session" -H "Content-Type: application/json" -d '{"user_id":"user123"}'
```

- Run the agent (simple):

```bash
curl -X POST "http://localhost:8080/agent/run" -H "Content-Type: application/json" -d '{"user_id":"user123","session_id":"sess123","message":"Generate testcases for feature X"}'
```

---
I added core features and a visual user flow to help you generate diagrams and documentation quickly.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

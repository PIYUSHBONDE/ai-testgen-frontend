import { useState } from "react";
import { Routes, Route } from "react-router-dom"; // <--- IMPORT THIS
import "./index.css";
// ... other imports ...
import TestsProvider from "./context/TestContext";
import { useAuth } from "./context/AuthContext";
import AuthGate from "./components/AuthGate";
import EmailVerificationNotice from "./components/EmailVerificationNotice";
import ChatWorkspace from "./components/chat/ChatWorkspace";
import JiraCallback from "./components/JiraCallback"; // <--- IMPORT NEW FILE

function App() {
  const { user, loading } = useAuth()

  if (loading) return null;
  if (!user) return <AuthGate />;
  if (!user.emailVerified) return <EmailVerificationNotice />;
  
  return (
    <TestsProvider initialTests={""}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
        <main className="mt-0">
          {/* REPLACE <ChatWorkspace /> WITH ROUTES */}
          <Routes>
            <Route path="/" element={<ChatWorkspace />} />
            <Route path="/jira-callback" element={<JiraCallback />} />
          </Routes>
        </main>
      </div>
    </TestsProvider>
  );
}

export default App;
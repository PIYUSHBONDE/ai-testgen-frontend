import { useState } from "react";
import "./index.css";
import UploadView from "./components/UploadView";
import FeatureSelectionView from "./components/FeatureSelectionView";
import ReviewRefineView from "./components/ReviewRefineView";
import ExportModal from "./components/ExportModal";
import TestsProvider from "./context/TestContext";
import RunTestsForm from "./components/RunTestForm";
import { useAuth } from "./context/AuthContext";
import AuthGate from "./components/AuthGate";
import EmailVerificationNotice from "./components/EmailVerificationNotice";
import ChatWorkspace from "./components/chat/ChatWorkspace"

function App() {
  const { user, loading } = useAuth()
  const [step, setStep] = useState(2);

  const handleExport = () => {
    const doc = new jsPDF();
    const jsonString = JSON.stringify(jsonData, null, 2);
    const lines = doc.splitTextToSize(jsonString, 180);
    doc.text(lines, 10, 10);
    doc.save("exported-data.pdf");
  };

  const goNext = () => setStep((s) => Math.min(4, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  // If still loading auth state, show nothing (or loading indicator)
  if (loading) return null

  // If no user, show the full-screen auth gate that prevents access
  if (!user) return <AuthGate />

  if (!user.emailVerified) {
    return <EmailVerificationNotice />; // If user exists but email is not verified, show verification page
  }
  
  return (
    <TestsProvider initialTests={""}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
        <main className="mt-0">
          <ChatWorkspace />
        </main>
      </div>
    </TestsProvider>
  );
}

export default App;

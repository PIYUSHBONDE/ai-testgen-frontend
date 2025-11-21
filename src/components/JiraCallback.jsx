import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { exchangeJiraCode } from '../api'; 
import { useAuth } from '../context/AuthContext';

export default function JiraCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Get logged in user from context
  const [status, setStatus] = useState("Processing Jira connection...");
  
  // Prevent double-execution in React StrictMode
  const hasCalled = useRef(false); 

  useEffect(() => {
    if (hasCalled.current) return;

    const code = searchParams.get('code');
    
    // 1. Validation
    if (!code) {
      setStatus("Error: No authorization code received from Jira.");
      return;
    }
    
    // 2. Wait for Auth to be ready
    if (!user) {
      setStatus("Waiting for user session...");
      return;
    }

    // Mark as called so we don't fire twice
    hasCalled.current = true;

    const connectJira = async () => {
      try {
        setStatus("Connecting your Jira account...");
        
        // 3. Exchange the code for a token via your API
        // We use user.uid from Firebase Auth
        await exchangeJiraCode(user.uid, code);
        
        setStatus("Success! Redirecting...");
        
        // 4. Redirect back to the main app (ChatWorkspace)
        setTimeout(() => {
            navigate('/'); 
        }, 1500);

      } catch (error) {
        console.error("Jira Auth Failed:", error);
        setStatus("Connection failed. Please try again.");
      }
    };

    connectJira();

  }, [searchParams, navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-center max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Jira Integration</h2>
        
        <div className="text-slate-600 dark:text-slate-300 mb-6">
            {status}
        </div>

        {/* Loading Spinner */}
        {status.includes("Connecting") || status.includes("Processing") ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
        ) : null}
        
        {/* Error State Button */}
        {status.includes("Error") || status.includes("failed") ? (
           <button 
             onClick={() => navigate('/')}
             className="mt-4 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-sm"
           >
             Return to Dashboard
           </button>
        ) : null}
      </div>
    </div>
  );
};
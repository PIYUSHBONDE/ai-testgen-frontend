// src/components/VerifyEmail.js

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import { Button } from './ui'; // Assuming you have a reusable Button component

export default function VerifyEmail() {
  const { user, logout } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResendEmail = async () => {
    setMessage('');
    setError('');
    if (!user) {
      setError('No user is logged in.');
      return;
    }
    try {
      await sendEmailVerification(user);
      setMessage('A new verification email has been sent to your inbox.');
    } catch (err) {
      setError('Failed to send verification email. Please try again later.');
    }
  };
  
  const handleCheckVerification = async () => {
    if (user) {
      await user.reload(); // This reloads the user's data from Firebase
      // The onAuthStateChanged listener in your AuthContext will automatically
      // pick up the change in emailVerified status and redirect.
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="max-w-md w-full text-center p-8 rounded-xl shadow-lg bg-white dark:bg-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Verify Your Email
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          A verification link has been sent to your email address:
          <strong className="block mt-2">{user?.email}</strong>
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          Please check your inbox (and spam folder) and click the link to activate your account.
        </p>
        
        <Button onClick={handleCheckVerification} className="w-full mb-4 bg-emerald-600">
          I've verified my email, let's go!
        </Button>

        <div className="text-sm">
          <span className="text-slate-600 dark:text-slate-400">Didn't receive the email? </span>
          <button onClick={handleResendEmail} className="font-medium text-emerald-600 hover:underline">
            Resend it
          </button>
        </div>

        {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
          <button onClick={logout} className="text-sm text-slate-500 hover:underline">
            Use a different account
          </button>
        </div>
      </div>
    </div>
  );
}
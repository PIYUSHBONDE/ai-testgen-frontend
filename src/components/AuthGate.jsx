import React, { useEffect, useState } from 'react'
import { Button } from './ui' // Assuming a reusable Button component
import { useAuth } from '../context/AuthContext'
import { useToast } from './ToastProvider'

// Helper icon for the feature list
function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// Google Icon for the sign-in button
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.35 11.1H12v2.8h5.35c-.25 1.4-1.05 2.6-2.24 3.4v2.8h3.62c2.12-1.96 3.34-4.82 3.34-8.4 0-.7-.06-1.38-.17-2.05z" fill="#4285F4"/>
      <path d="M12 22c2.7 0 4.97-.9 6.63-2.46l-3.62-2.8c-.99.66-2.26 1.06-3.01 1.06-2.32 0-4.29-1.56-4.99-3.68H3.14v2.31C4.78 19.9 8.12 22 12 22z" fill="#34A853"/>
      <path d="M7.01 13.12A5.41 5.41 0 0 1 6.7 12c0-.4.06-.8.16-1.18V8.5H3.14A9.99 9.99 0 0 0 2 12c0 1.6 .38 3.12 1.05 4.45l3.96-3.33z" fill="#FBBC05"/>
      <path d="M12 6.5c1.47 0 2.78 .5 3.82 1.48l2.86-2.86C16.96 3.52 14.7 2.5 12 2.5 8.12 2.5 4.78 4.6 3.14 7.69l3.72 2.31C7.71 8.06 9.68 6.5 12 6.5z" fill="#EA4335"/>
    </svg>
  )
}

export default function AuthGate() {
  const { login, signup, signInWithGoogle } = useAuth()
  const { addToast } = useToast()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10)
    return () => clearTimeout(t)
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      if (mode === 'login') {
        await login(email, password)
        addToast({ title: 'Signed in', description: 'Welcome back!', type: 'success' })
      } else {
        await signup(email, password, name)
        // Note: The success toast for signup is best handled after email verification
        // or in the signup function itself if you want immediate feedback.
      }
    } catch (err) {
      const msg = mapAuthError(err)
      setError(msg)
      addToast({ title: 'Authentication error', description: msg, type: 'error' })
    }
  }

  const handleGoogle = async () => {
    setError(null)
    try {
      await signInWithGoogle()
      addToast({ title: 'Signed in', description: 'Welcome back!', type: 'success' })
    } catch (err) {
      const msg = mapAuthError(err)
      setError(msg)
      addToast({ title: 'Google sign-in failed', description: msg, type: 'error' })
    }
  }

  function mapAuthError(err) {
    if (!err) return 'Unknown error'
    const code = err.code || ''
    const message = err.message || ''
    if (code.includes('auth/user-not-found')) return 'No user found with this email.'
    if (code.includes('auth/wrong-password')) return 'Incorrect password.'
    if (code.includes('auth/email-already-in-use')) return 'Email is already registered.'
    if (code.includes('auth/invalid-email')) return 'Please provide a valid email.'
    if (code.includes('auth/weak-password')) return 'Password is too weak (min 6 characters).'
    return message
  }

  // Shared classes for consistent input styling and better focus states
  const inputClasses = "w-full rounded-xl p-3 border border-slate-200 dark:border-slate-700 bg-transparent dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="w-[1200px] h-[1200px] bg-emerald-100 opacity-10 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/4 transform" />
      </div>

      <div className={`relative z-10 w-full max-w-4xl p-8 rounded-3xl shadow-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 transition-transform duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-bold text-lg">HC</div>
          <div>
            <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Welcome to HealthCase AI</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Sign in to continue to the Test Case Generator</div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* ----- Left Panel (Polished Form) ----- */}
          <div className="w-full md:w-1/2 md:pr-8 md:border-r border-slate-200 dark:border-slate-700">
            <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-900/40 rounded-full">
              <button onClick={() => setMode('login')} className={`w-1/2 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ${mode === 'login' ? 'bg-white dark:bg-emerald-600 text-slate-800 dark:text-white shadow-sm' : 'bg-transparent text-slate-600 dark:text-slate-300'}`}>Login</button>
              <button onClick={() => setMode('signup')} className={`w-1/2 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ${mode === 'signup' ? 'bg-white dark:bg-emerald-600 text-slate-800 dark:text-white shadow-sm' : 'bg-transparent text-slate-600 dark:text-slate-300'}`}>Sign up</button>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-4">
              {mode === 'signup' && (
                <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
              )}
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClasses} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClasses} />
              
              {error && <div className="text-sm text-red-500 text-center">{error}</div>}
              
              <div className="flex items-center gap-3 mt-2">
                <Button type="submit" className="flex-1 transition-transform duration-200 hover:scale-[1.02]">{mode === 'login' ? 'Sign in' : 'Create account'}</Button>
                <Button type="button" variant="ghost" onClick={() => { setEmail(''); setPassword(''); setName(''); }}>Clear</Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200 dark:border-slate-700"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white/80 dark:bg-slate-800/80 px-2 text-slate-500">Or continue with</span></div>
              </div>
              <Button onClick={handleGoogle} className="w-full mt-4 flex items-center gap-3 justify-center bg-white text-slate-800 border border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-600">
                <GoogleIcon />
                Continue with Google
              </Button>
            </div>
          </div>

          {/* ----- Right Panel (Polished Content) ----- */}
          <div className="w-full md:w-1/2 md:pl-8 mt-8 md:mt-0 flex flex-col justify-center">
            <h2 className="font-bold text-lg bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
              Secure Your AI-Powered Workspace
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-300 mb-6">
              Sign in to access your saved projects and generate intelligent test cases with the power of AI.
            </p>
            <div className="mt-4 p-4 rounded-xl bg-emerald-500/5 dark:bg-slate-700/30">
              <div className="text-sm font-medium text-slate-800 dark:text-slate-100">Your Account Unlocks:</div>
              <ul className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start">
                  <CheckIcon />
                  <span><strong>Securely Save & Export</strong> your generated test case projects.</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon />
                  <span>A <strong>Personalized History</strong> of all your AI-generated data.</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon />
                  <span>Access to <strong>Advanced Features</strong> and priority processing.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
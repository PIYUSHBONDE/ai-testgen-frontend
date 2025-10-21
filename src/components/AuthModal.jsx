import React, { useState } from 'react'
import Dialog from './ui/Dialog'
import { Button } from './ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from './ToastProvider'

export default function AuthModal({ open, onOpenChange }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const { login, signup, signInWithGoogle } = useAuth()

  const { addToast } = useToast()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      if (mode === 'login') {
        await login(email, password)
        addToast({ title: 'Signed in', description: 'Welcome back!', type: 'success' })
      } else {
        await signup(email, password, name)
        addToast({ title: 'Account created', description: 'You are signed in now', type: 'success' })
      }
      onOpenChange(false)
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
      onOpenChange(false)
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
    if (code.includes('auth/email-already-in-use')) return 'Email already registered.'
    if (code.includes('auth/invalid-email')) return 'Please provide a valid email.'
    if (code.includes('auth/weak-password')) return 'Password is too weak (min 6 characters).'
    return message
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">{mode === 'login' ? 'Sign in' : 'Create account'}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Continue with your email or Google</div>
          </div>
          <div className="flex gap-2">
            <button className={`px-3 py-1 rounded-full ${mode === 'login' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-700/40'}`} onClick={() => setMode('login')}>Login</button>
            <button className={`px-3 py-1 rounded-full ${mode === 'signup' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-700/40'}`} onClick={() => setMode('signup')}>Sign up</button>
          </div>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <input className="rounded-xl p-3 border border-slate-200 dark:border-slate-700 bg-transparent" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          )}

          <input type="email" className="rounded-xl p-3 border border-slate-200 dark:border-slate-700 bg-transparent" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" className="rounded-xl p-3 border border-slate-200 dark:border-slate-700 bg-transparent" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">{mode === 'login' ? 'Sign in' : 'Create account'}</Button>
            <Button type="button" variant="ghost" onClick={() => { setEmail(''); setPassword(''); setName(''); onOpenChange(false) }}>Cancel</Button>
          </div>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px bg-slate-200 flex-1" />
          <div className="text-xs text-slate-500">OR</div>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        <div>
          <Button onClick={handleGoogle} className="w-full flex items-center justify-center gap-2 bg-white text-slate-800 border">
            <img src="/vite.svg" alt="google" className="w-5 h-5" />
            Continue with Google
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

import React, { useEffect, useState } from 'react'
import { Sun, DownloadCloud } from 'lucide-react'
import { Button, IconButton, Toggle } from './ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from './ToastProvider'

export default function Navbar({ step = 1, onExport = () => {} }) {
  const [dark, setDark] = useState(false)
  const { user, logout } = useAuth()
  const { addToast } = useToast()

  useEffect(() => {
    const root = document.documentElement
    if (dark) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [dark])

  const steps = ['Upload', 'Input', 'Refine', 'Export']

  return (
    <>
      <header className="w-full flex items-center justify-between py-4 px-6 bg-gradient-to-b from-white/50 to-white/10 dark:from-slate-900/80 dark:to-transparent">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-bold">HC</div>
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-100">HealthCase AI</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Test Case Generator</div>
            </div>
          </div>

          <nav className="ml-6 flex items-center gap-4">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-sm ${i+1 <= step ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300'}`}>
                  {s}
                </div>
                {i < steps.length -1 && <div className="w-6 h-0.5 bg-slate-200 dark:bg-slate-600" />}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={onExport} className="flex items-center gap-2 bg-emerald-600">
            <DownloadCloud size={16} />
            Export
          </Button>
          <IconButton onClick={() => setDark(!dark)}>
            <Sun size={16} />
          </IconButton>
          <Toggle checked={dark} onChange={setDark} />

          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-700 dark:text-slate-200">{user.displayName || user.email}</div>
              <Button
                variant="ghost"
                onClick={async () => {
                  try {
                    await logout()
                    addToast({ title: 'Signed out', description: 'You have been signed out', type: 'info' })
                  } catch (err) {
                    addToast({ title: 'Sign out failed', description: err.message || 'Unable to sign out', type: 'error' })
                  }
                }}
              >
                Sign out
              </Button>
            </div>
          ) : null}
        </div>
      </header>

    </>
  )
}

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ title, description, type = 'info', duration = 4000 }) => {
    const id = ++idCounter
    setToasts((t) => [...t, { id, title, description, type }])
    if (duration > 0) {
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id))
      }, duration)
    }
    return id
  }, [])

  const removeToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast])

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((t) => (
          // --- CHANGE IS HERE ---
          // The `backdrop-blur-sm` class was added to create the blur effect.
          // I also made the dark backgrounds slightly more opaque (`/40` and `/30`) to enhance it.
          <div 
            key={t.id} 
            className={`
              rounded-xl p-3 shadow-lg backdrop-blur-sm 
              transform transition-all duration-300
              ${t.type === 'error' 
                ? 'bg-red-50/80 dark:bg-red-900/40 border border-red-200 dark:border-red-500/30' 
                : t.type === 'success' 
                ? 'bg-emerald-50/80 dark:bg-emerald-800/40 border border-emerald-200 dark:border-emerald-500/30' 
                : 'bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-500/30'
              }`
            }
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                {t.title && <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{t.title}</div>}
                {t.description && <div className="text-sm text-slate-700 dark:text-slate-300">{t.description}</div>}
              </div>
              <button 
                className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors text-2xl leading-none" 
                onClick={() => removeToast(t.id)}
              >×</button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
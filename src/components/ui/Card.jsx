import React from 'react'

export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl bg-white/60 dark:bg-slate-800/60 p-4 shadow-soft border border-transparent dark:border-slate-700/40 ${className}`}>
      {children}
    </div>
  )
}

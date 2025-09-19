import React from 'react'

export default function Button({ children, className = '', variant = 'default', ...props }) {
  const base = 'rounded-2xl px-4 py-2 shadow-soft focus:outline-none font-medium'
  const variants = {
    default: 'bg-emerald-600 text-white hover:opacity-95',
    ghost: 'bg-transparent text-slate-700 dark:text-slate-200 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-700/40',
    secondary: 'bg-slate-100 text-slate-900 dark:bg-slate-700/40 dark:text-slate-100',
  }

  return (
    <button {...props} className={`${base} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </button>
  )
}

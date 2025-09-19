import React from 'react'

export default function IconButton({ children, className = '', ...props }) {
  return (
    <button {...props} className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-700/40 ${className}`}>
      {children}
    </button>
  )
}

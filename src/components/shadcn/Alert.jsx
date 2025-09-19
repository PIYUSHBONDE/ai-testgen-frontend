import React from 'react'

export default function Alert({ children, variant = 'info' }) {
  const bg = variant === 'info' ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-amber-50 dark:bg-amber-900/30'
  return (
    <div className={`rounded-2xl p-3 ${bg} text-sm`}>{children}</div>
  )
}

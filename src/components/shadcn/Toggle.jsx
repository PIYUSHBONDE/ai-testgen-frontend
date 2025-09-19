import React from 'react'

export default function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} className={`w-12 h-6 rounded-full p-1 ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}>
      <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`} />
    </button>
  )
}

import React, { useState } from 'react'
import { Card, Button } from './ui'
import { Star, Layers } from 'lucide-react'

function FeatureCard({ feature, onSelect, selected }) {
  return (
    <div onClick={() => onSelect(feature)} className={`p-3 rounded-xl cursor-pointer transition-shadow ${selected ? 'shadow-lg border border-emerald-500' : 'hover:shadow-md'} bg-white/60 dark:bg-slate-800/60` }>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{feature.title}</div>
          <div className="text-xs text-slate-500">Confidence: {Math.round(feature.confidence * 100)}%</div>
        </div>
        <div className="text-amber-500"><Star size={16} /></div>
      </div>
    </div>
  )
}

export default function FeatureSelectionView({ onBack, onGenerate }) {
  const [features] = useState([
    { id: 'f1', title: 'Heart Rate Detection', confidence: 0.92 },
    { id: 'f2', title: 'ECG Lead Identification', confidence: 0.84 },
    { id: 'f3', title: 'Battery Safety Requirement', confidence: 0.78 },
  ])
  const [selected, setSelected] = useState(features[0])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Identified Features</h3>
            <div className="flex items-center gap-3">
              <Button variant="ghost">Merge</Button>
              <Button variant="ghost">Split</Button>
            </div>
          </div>

          <div className="space-y-3">
            {features.map(f => (
              <FeatureCard key={f.id} feature={f} onSelect={setSelected} selected={selected?.id === f.id} />
            ))}
          </div>
        </div>

        <aside className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/60 shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            <Layers />
            <h4 className="font-semibold">Requirements Preview</h4>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <div className="font-medium mb-2">{selected.title}</div>
            <div>- Requirement A: The system shall detect heart rate from ECG within ±5 bpm.</div>
            <div>- Requirement B: The system shall log timestamps and lead IDs for each recording.</div>
          </div>
        </aside>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={onBack}>← Back</Button>
        </div>
        <div>
          <Button onClick={onGenerate}>Generate Test Suite →</Button>
        </div>
      </div>
    </div>
  )
}

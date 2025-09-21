import React, { useState } from 'react'
import { Card, Button } from './ui'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase'
import { BadgeCheck, Clock, MessageSquare } from 'lucide-react'
import { useTests } from '../context/TestContext'

function Navigator({ tests, onSelect, filter, setFilter }) {
  return (
    <aside className="w-full md:w-64 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold">Test Cases</h4>
        <div className="text-sm text-slate-500">{tests.length}</div>
      </div>

      <div className="space-y-2 mb-4">
        <button className={`w-full text-left p-2 rounded-lg ${filter==='all' ? 'bg-emerald-100 dark:bg-emerald-900/20' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`w-full text-left p-2 rounded-lg ${filter==='high' ? 'bg-amber-100 dark:bg-amber-900/20' : ''}`} onClick={() => setFilter('high')}>High</button>
        <button className={`w-full text-left p-2 rounded-lg ${filter==='medium' ? 'bg-sky-100 dark:bg-sky-900/20' : ''}`} onClick={() => setFilter('medium')}>Medium</button>
        <button className={`w-full text-left p-2 rounded-lg ${filter==='low' ? 'bg-slate-100 dark:bg-slate-700/20' : ''}`} onClick={() => setFilter('low')}>Low</button>
      </div>

      <div className="space-y-2">
        {tests.filter(t => filter==='all' ? true : t.priority === filter).map(t => (
          <div key={t.id} onClick={() => onSelect(t)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/40 cursor-pointer">
            <div className="font-medium">{t.title}</div>
          </div>
        ))}
      </div>
    </aside>
  )
}

function DetailView({ test, onEdit }) {
  if (!test) {
    return (
      <div className="p-6 text-white">
        Select a test case to view details
      </div>
    );
  }

  const {
    id,
    title,
    preconditions = [],
    steps = [],
    expected,
    risk,
    regulatory_refs = [],
    rationale,
  } = test || {};

  // Remove any "1. " prefixes so <ol> renders clean numbering
  const normalizedSteps = steps.map((s) => s.replace(/^\s*\d+\.\s*/, ""));

  return (
    <div className="p-6 text-white bg-slate-900">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <div className="text-sm text-white">Risk: {risk || "—"}</div>
          <div className="text-xs text-white">ID: {id || "—"}</div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {regulatory_refs.map((ref, i) => (
            <div
              key={`${ref}-${i}`}
              className="text-xs px-2 py-1 rounded-full bg-slate-700 text-white flex items-center gap-2"
            >
              <BadgeCheck size={14} />
              {ref}
            </div>
          ))}
        </div>
      </div>

      <Card className="bg-slate-800 border border-slate-700 text-white">
        {preconditions.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 font-medium text-white">Preconditions</div>
            <ul className="list-disc ml-5 space-y-2 text-sm text-white">
              {preconditions.map((p, i) => (
                <li key={`pre-${i}`}>{p}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-3 font-medium text-white">Steps</div>
        <ol className="list-decimal ml-5 space-y-2 text-sm">
          {normalizedSteps.map((s, i) => (
            <li key={`step-${i}`} className="text-white font-semibold">
              {s}
            </li>
          ))}
        </ol>

        {expected && (
          <div className="mt-4">
            <div className="font-medium text-white">Expected Result</div>
            <div className="text-sm text-white mt-1">{expected}</div>
          </div>
        )}

        {rationale && (
          <div className="mt-4">
            <div className="font-medium text-white">Rationale</div>
            <div className="text-sm text-white mt-1">{rationale}</div>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Button variant="secondary" onClick={() => onEdit(test)}>
            Edit
          </Button>
          <Button variant="ghost">Audit Trail</Button>
        </div>
      </Card>
    </div>
  );
}

function CoPilot({ onSuggest }) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([
    { id: 1, from: 'ai', text: 'Try increasing timeout for intermittent failures.' }
  ])

  const send = () => {
    if (!input) return
    const msg = { id: Date.now(), from: 'user', text: input }
    setHistory(h => [...h, msg])
    setInput('')
    setTimeout(() => {
      // simulate ai suggestion then also attempt calling backend callable if available
      const suggestion = { id: Date.now()+1, from: 'ai', text: 'Suggestion: add step to validate sensor warmup.' }
      setHistory(h => [...h, suggestion])
      onSuggest && onSuggest(suggestion)

      // demo callable function invocation (if functions configured)
      try {
        const callable = httpsCallable(functions, 'callVertexAgent')
        callable({ text: input, requirementId: selected?.trace || null })
          .then(res => {
            const aiText = res.data && res.data.agentResponse ? JSON.stringify(res.data.agentResponse).slice(0,300) : 'AI: no response'
            const remote = { id: Date.now()+2, from: 'ai', text: `Remote AI: ${aiText}` }
            setHistory(h => [...h, remote])
          })
          .catch(err => {
            const errMsg = { id: Date.now()+3, from: 'ai', text: `Remote AI error: ${err.message}` }
            setHistory(h => [...h, errMsg])
          })
      } catch (e) {
        // not configured or firebase not initialized; ignore
      }
    }, 900)
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3"><MessageSquare /> <h4 className="font-semibold">AI Co-pilot</h4></div>
      <div className="flex-1 overflow-auto space-y-3 mb-3">
        {history.map(h => (
          <div key={h.id} className={`p-2 rounded-lg ${h.from === 'ai' ? 'bg-slate-100 dark:bg-slate-700/40' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
            <div className="text-sm">{h.text}</div>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <div className="flex gap-2">
          <input value={input} onChange={(e)=>setInput(e.target.value)} className="flex-1 rounded-lg p-2 border border-slate-200 dark:border-slate-700/40 bg-white/60 dark:bg-slate-800/60" placeholder="Ask the AI to refine this test" />
          <Button onClick={send}>Send</Button>
        </div>
      </div>
    </div>
  )
}

export default function ReviewRefineView({ onBack }) {
  // const [tests, setTests] = useState([
  //   {
  //        "id":"TC-LAB-001",
  //        "title":"Create and Place a New Laboratory Order",
  //        "preconditions":[
  //           "A clinician is logged into the system.",
  //           "A patient record is open."
  //        ],
  //        "steps":[
  //           "1. Navigate to the 'Laboratory Orders' section for the patient.",
  //           "2. Select a diagnostic test from the available list.",
  //           "3. Fill in any required information for the order (e.g., diagnosis code, notes).",
  //           "4. Click 'Submit' or 'Place Order'.",
  //           "5. Verify that the system confirms the order has been placed successfully.",
  //           "6. Check the patient's record to ensure the new lab order is listed in their order history."
  //        ],
  //        "expected":"The system must allow a clinician to successfully order a diagnostic test for a patient, and the order must be recorded in the patient's history.",
  //        "risk":"high",
  //        "regulatory_refs":[
  //           "IEC 62304",
  //           "sample_healthcare_requirements.txt"
  //        ],
  //        "rationale":"This test validates the core functionality of the laboratory ordering feature. A failure here would mean clinicians cannot order necessary tests, directly impacting patient care."
  //     },    { id: 't2', title: 'Battery Safety', priority: 'medium', steps: ['Check voltage', 'Run discharge'], expected: 'No overheating', trace: 'REQ-5' },
  // ])
  const { tests } = useTests();
  const [selected, setSelected] = useState(tests[0])
  const [filter, setFilter] = useState('all')

  const handleSuggest = (sugg) => {
    // attach suggestion as a note on selected test (mock)
    console.log('AI suggestion', sugg)
  }

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <div className="text-sm text-slate-500">Review & Refine</div>
        <div />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3">
          <Navigator tests={tests} onSelect={setSelected} filter={filter} setFilter={setFilter} />
        </div>

        <div className="md:col-span-6">
          <DetailView test={selected} onEdit={(t) => alert('Edit dialog for '+t.title)} />
        </div>

        <div className="md:col-span-3">
          <div className="h-full bg-white/40 dark:bg-slate-900/60 rounded-2xl p-2">
            <CoPilot onSuggest={handleSuggest} />
          </div>
        </div>
      </div>
    </div>
  )
}

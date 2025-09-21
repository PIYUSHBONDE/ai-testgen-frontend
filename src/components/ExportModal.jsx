import React, { useState } from 'react'
import Dialog from './ui/Dialog'
import { Button, Card } from './ui'
import { Check, DownloadCloud, FileText } from 'lucide-react'
import { useTests } from '../context/TestContext'
import { jsPDF } from "jspdf";

export default function ExportModal({ open, onOpenChange = () => {} }) {
  const [targets, setTargets] = useState({ json: true, pdf: false })
  const [progress, setProgress] = useState(null) // null | number | 'done'
  const { tests } = useTests();

  function toggleTarget(key) {
    setTargets((t) => ({ ...t, [key]: !t[key] }))
  }

  const handleExport = () => {
    const doc = new jsPDF();
    if(tests.length === 0) return;
    const jsonString = JSON.stringify(tests[0], null, 2);
    const lines = doc.splitTextToSize(jsonString, 180);
    doc.text(lines, 10, 10);
    doc.save("exported-data.pdf");
  };

  async function doExport() {
    setProgress(0)
    // simulate export progress
    for (let i = 1; i <= 5; i++) {
      // small delay
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 250))
      setProgress(i * 20)
    }
    setProgress('done')
    // keep modal open for a moment to show success, then close
    setTimeout(() => {
      setProgress(null)
      onOpenChange(false)
    }, 900)
    console.log('Exporting to:', tests[0]);
    handleExport();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          <DownloadCloud className="text-indigo-600" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold">Export Test Suite</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Choose export targets and formats. You can export results to a local file or push to BigQuery for analytics.</p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className={`p-4 cursor-pointer ${targets.json ? 'ring-2 ring-indigo-300' : ''}`} onClick={() => toggleTarget('json')}>
              <div className="flex items-center gap-3">
                <FileText />
                <div>
                  <div className="font-medium">JSON</div>
                  <div className="text-xs text-slate-500">Structured export for tooling</div>
                </div>
              </div>
            </Card>

            <Card className={`p-4 cursor-pointer ${targets.csv ? 'ring-2 ring-indigo-300' : ''}`} onClick={() => toggleTarget('csv')}>
              <div className="font-medium">CSV</div>
              <div className="text-xs text-slate-500">Spreadsheet-friendly</div>
            </Card>

            <Card className={`p-4 cursor-pointer ${targets.bigquery ? 'ring-2 ring-indigo-300' : ''}`} onClick={() => toggleTarget('bigquery')}>
              <div className="font-medium">BigQuery</div>
              <div className="text-xs text-slate-500">Push to cloud warehouse</div>
            </Card>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-slate-500">Selected: {Object.entries(targets).filter(([,v]) => v).map(([k]) => k.toUpperCase()).join(', ') || 'None'}</div>
            <div className="flex items-center gap-3">
              {progress === null && <Button onClick={() => onOpenChange(false)} className="bg-slate-200 text-slate-800">Cancel</Button>}
              {progress === null && <Button onClick={doExport} className="bg-indigo-600 flex items-center gap-2"><Check size={16} /> Export Now</Button>}
              {typeof progress === 'number' && <div className="text-sm text-slate-600">Exporting... {progress}%</div>}
              {progress === 'done' && <div className="flex items-center gap-2 text-emerald-600"><Check /> Done</div>}
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

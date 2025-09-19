import { useState } from 'react'
import './index.css'
import Navbar from './components/Navbar'
import UploadView from './components/UploadView'
import FeatureSelectionView from './components/FeatureSelectionView'
import ReviewRefineView from './components/ReviewRefineView'
import ExportModal from './components/ExportModal'

function App() {
  const [step, setStep] = useState(4)

  const goNext = () => setStep((s) => Math.min(4, s+1))
  const goBack = () => setStep((s) => Math.max(1, s-1))

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
      <Navbar step={step} onExport={() => setStep(4)} />
      <main className="mt-6">
        {step === 1 && <UploadView onNext={() => setStep(2)} />}
        {step === 2 && <FeatureSelectionView onBack={() => setStep(1)} onGenerate={() => setStep(3)} />}
        {step === 3 && <ReviewRefineView onBack={() => setStep(2)} />}
        {step === 4 && (
          <ExportModal open={true} onOpenChange={(v) => { if (!v) setStep(3) }} />
        )}
      </main>
    </div>
  )
}

export default App

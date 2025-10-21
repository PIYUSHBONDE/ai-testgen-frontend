// import React, { useState } from 'react';
// import { Maximize2, X, Download } from 'lucide-react';
// import TestCaseCard from './TestCaseCard';
// import ExportView from './ExportView'; // Import the new component
// import { IconButton } from './ui';

// type TestCase = {
//   id: string;
//   title: string;
//   // ... add other properties
// };

// interface TestCasesMessageProps {
//   testcases: TestCase[];
// }

// export default function TestCasesMessage({ testcases }: TestCasesMessageProps) {
//   const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
//   const [isExportViewOpen, setIsExportViewOpen] = useState(false);
//   const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(testcases[0] || null);

//   const handleExport = (selectedIds: Set<string>) => {
//     console.log('Exporting these test case IDs to Jira:', Array.from(selectedIds));
//     // TODO: Call your FastAPI backend here.
//     // For each ID, call the `/create-jira-test-case` endpoint, passing the test case data.
//     setIsExportViewOpen(false);
//   };

//   if (isExportViewOpen) {
//     return <ExportView testcases={testcases} onClose={() => setIsExportViewOpen(false)} onExport={handleExport} />;
//   }

//   return (
//     <>
//       {/* --- COMPACT VIEW --- */}
//       <div className="bg-white dark:bg-slate-700 rounded-xl p-4 max-w-xl text-slate-800 dark:text-slate-100">
//         <div className="flex justify-between items-center mb-3">
//           <h4 className="font-semibold">Generated Test Cases</h4>
//           <div className="flex items-center gap-2">
//             <IconButton onClick={() => setIsExportViewOpen(true)} title="Export">
//               <Download size={16} />
//             </IconButton>
//             <IconButton onClick={() => setIsDetailModalOpen(true)} title="Expand View">
//               <Maximize2 size={16} />
//             </IconButton>
//           </div>
//         </div>
//         <ol className="list-decimal list-inside space-y-1 text-sm">
//           {testcases.map((tc) => (
//             <li key={tc.id} className="truncate">{tc.title}</li>
//           ))}
//         </ol>
//       </div>

//       {/* --- REDESIGNED MODAL VIEW --- */}
//       {isDetailModalOpen && (
//         <div 
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
//           onClick={() => setIsDetailModalOpen(false)}
//         >
//           <div 
//             className="bg-slate-50 dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Modal Header */}
//             <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
//               <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
//                 Detailed Test Case View
//               </h3>
//               <IconButton onClick={() => setIsDetailModalOpen(false)} title="Close">
//                 <X size={20} />
//               </IconButton>
//             </div>
            
//             <div className="flex-1 flex overflow-hidden">
//               {/* Left Panel: Clickable Title List */}
//               <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 overflow-y-auto p-2">
//                 {testcases.map(tc => (
//                   <button
//                     key={tc.id}
//                     onClick={() => setSelectedTestCase(tc)}
//                     className={`w-full text-left p-3 rounded-md ${selectedTestCase?.id === tc.id ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
//                   >
//                     <div className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">{tc.title}</div>
//                     <div className="text-xs text-slate-500">{tc.id}</div>
//                   </button>
//                 ))}
//               </div>

//               {/* Right Panel: Detail View */}
//               <div className="w-2/3 overflow-y-auto p-6">
//                 {selectedTestCase ? <TestCaseCard testcase={selectedTestCase} /> : <div className="text-slate-500">Select a test case to view its details.</div>}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }


import React, { useState } from 'react';
import { Maximize2, X, CheckSquare, Square, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import TestCaseCard from './TestCaseCard';
import { Button, IconButton } from './ui';
import { useToast } from './ToastProvider';
import { exportTestCaseToJira } from '../api'; // Your API function

// Define the shape of a single test case object
type TestCase = {
  id: string;
  title: string;
  // Add other properties like preconditions, steps, etc.
};

// Define the status types for progress tracking
type ExportStatus = 'pending' | 'exporting' | 'success' | 'error';

// Helper component to render the correct status icon
const StatusIcon = ({ status }: { status?: ExportStatus }) => {
  switch (status) {
    case 'exporting': return <Loader2 size={16} className="animate-spin text-slate-400" />;
    case 'success': return <CheckCircle2 size={16} className="text-emerald-500" />;
    case 'error': return <XCircle size={16} className="text-red-500" />;
    default: return null;
  }
};

interface TestCasesMessageProps {
  testcases: TestCase[];
}

export default function TestCasesMessage({ testcases }: TestCasesMessageProps) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(testcases[0] || null);

  // --- State for selection and export, moved from ExportView ---
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(testcases.map(tc => tc.id)));
  const [exportStatus, setExportStatus] = useState<Record<string, ExportStatus>>({});
  const [isExporting, setIsExporting] = useState(false);
  const { addToast } = useToast();

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(testcases.map(tc => tc.id)));
  const deselectAll = () => setSelectedIds(new Set());

  // --- Export logic, now part of this component ---
  const handleExport = async () => {
    setIsExporting(true);
    const testCasesToExport = testcases.filter(tc => selectedIds.has(tc.id));
    
    const initialStatus: Record<string, ExportStatus> = {};
    testCasesToExport.forEach(tc => {
      initialStatus[tc.id] = 'exporting';
    });
    setExportStatus(initialStatus);

    let successCount = 0;
    
    for (const testCase of testCasesToExport) {
      try {
        await exportTestCaseToJira(testCase);
        setExportStatus(prev => ({ ...prev, [testCase.id]: 'success' }));
        successCount++;
      } catch (error) {
        setExportStatus(prev => ({ ...prev, [testCase.id]: 'error' }));
        console.error(`Failed to export ${testCase.id}:`, error);
      }
    }

    setIsExporting(false);
    addToast({
      title: 'Export Complete',
      description: `${successCount} of ${testCasesToExport.length} test cases exported successfully.`,
      type: successCount === testCasesToExport.length ? 'success' : 'info'
    });
  };

  return (
    <>
      {/* --- COMPACT VIEW (Export button removed) --- */}
      <div className="bg-white dark:bg-slate-700 rounded-xl p-4 max-w-xl text-slate-800 dark:text-slate-100">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold">Generated Test Cases</h4>
          <div className="flex items-center gap-2">
            <IconButton onClick={() => setIsDetailModalOpen(true)} title="Expand and Export">
              <Maximize2 size={16} />
            </IconButton>
          </div>
        </div>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          {testcases.map((tc) => (
            <li key={tc.id} className="truncate">{tc.title}</li>
          ))}
        </ol>
      </div>

      {/* --- MERGED DETAIL & EXPORT MODAL VIEW --- */}
      {isDetailModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => !isExporting && setIsDetailModalOpen(false)}
        >
          <div 
            className="bg-slate-50 dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                Test Case Details & Export
              </h3>
              <IconButton onClick={() => setIsDetailModalOpen(false)} title="Close" disabled={isExporting}>
                <X size={20} />
              </IconButton>
            </div>
            
            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel: Selection List */}
              <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col">
                <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAll} disabled={isExporting}>Select All</Button>
                    <Button variant="outline" size="sm" onClick={deselectAll} disabled={isExporting}>Deselect All</Button>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">{selectedIds.size} of {testcases.length} selected</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {testcases.map(tc => (
                    <div 
                      key={tc.id} 
                      onClick={() => !isExporting && setSelectedTestCase(tc)}
                      className={`p-3 rounded-md flex items-start gap-3 ${!isExporting ? 'cursor-pointer' : ''} ${selectedTestCase?.id === tc.id ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                      <div className="mt-1" onClick={(e) => { e.stopPropagation(); if (!isExporting) toggleSelection(tc.id); }}>
                        {selectedIds.has(tc.id) ? <CheckSquare className="text-emerald-600"/> : <Square className="text-slate-400"/>}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-slate-800 dark:text-slate-200">{tc.title}</div>
                        <div className="text-xs text-slate-500">{tc.id}</div>
                      </div>
                      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <StatusIcon status={exportStatus[tc.id]} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Panel: Detail Preview */}
              <div className="w-2/3 overflow-y-auto p-6">
                {selectedTestCase ? <TestCaseCard testcase={selectedTestCase} /> : <div className="text-slate-500">Select a test case to view its details.</div>}
              </div>
            </div>

             {/* Modal Footer with Export Button */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 flex-shrink-0">
              <Button variant="ghost" onClick={() => setIsDetailModalOpen(false)} disabled={isExporting}>Cancel</Button>
              <Button className="bg-emerald-600 min-w-[180px]" onClick={handleExport} disabled={isExporting || selectedIds.size === 0}>
                {isExporting ? <Loader2 className="animate-spin mr-2" /> : null}
                {isExporting ? 'Exporting...' : `Export ${selectedIds.size} to Jira`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
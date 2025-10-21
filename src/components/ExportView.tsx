import React, { useState } from 'react';
import { X, CheckSquare, Square, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button, IconButton } from './ui';
import TestCaseCard from './TestCaseCard';
import { useToast } from './ToastProvider';
import { exportTestCaseToJira } from '../api'; // Ensure you import your API function

// Define the shape of a single test case object
type TestCase = {
  id: string;
  title: string;
  // ... other properties from your test case object
};

interface ExportViewProps {
  testcases: TestCase[];
  onClose: () => void;
  // The onExport function is no longer needed as the logic is now inside this component
}

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


export default function ExportView({ testcases, onClose }: ExportViewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(testcases.map(tc => tc.id)));
  const [previewTestCase, setPreviewTestCase] = useState<TestCase | null>(testcases[0] || null);

  // --- State for tracking progress ---
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
  
  // --- This is the corrected export logic with progress tracking ---
  const handleExport = async () => {
    setIsExporting(true);
    const testCasesToExport = testcases.filter(tc => selectedIds.has(tc.id));
    
    // Initialize status for all selected items to 'exporting'
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
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
        <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
          Export Test Cases to Jira
        </h3>
        <IconButton onClick={onClose} title="Close" disabled={isExporting}>
          <X size={20} />
        </IconButton>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Selection List with Status Icons */}
        <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex gap-2">
              <Button variant="outline" onClick={selectAll} disabled={isExporting}>Select All</Button>
              <Button variant="outline" onClick={deselectAll} disabled={isExporting}>Deselect All</Button>
            </div>
            <p className="text-sm text-slate-500 mt-2">{selectedIds.size} of {testcases.length} selected</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {testcases.map(tc => (
              <div 
                key={tc.id} 
                onClick={() => !isExporting && setPreviewTestCase(tc)}
                className={`p-3 rounded-md ${!isExporting ? 'cursor-pointer' : ''} ${previewTestCase?.id === tc.id ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-1" onClick={(e) => { e.stopPropagation(); !isExporting && toggleSelection(tc.id); }}>
                    {selectedIds.has(tc.id) ? <CheckSquare className="text-emerald-600"/> : <Square className="text-slate-400"/>}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-slate-800 dark:text-slate-200">{tc.title}</div>
                    <div className="text-xs text-slate-500">{tc.id}</div>
                  </div>
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    <StatusIcon status={exportStatus[tc.id]} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right Panel: Preview */}
        <div className="w-2/3 overflow-y-auto p-6">
          {previewTestCase ? <TestCaseCard testcase={previewTestCase} /> : <div className="text-slate-500">Select a test case to preview</div>}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose} disabled={isExporting}>Cancel</Button>
        <Button className="bg-emerald-600 w-52" onClick={handleExport} disabled={isExporting || selectedIds.size === 0}>
          {isExporting ? <Loader2 className="animate-spin mr-2" /> : null}
          {isExporting ? 'Exporting...' : `Export ${selectedIds.size} to Jira`}
        </Button>
      </div>
    </div>
  );
}
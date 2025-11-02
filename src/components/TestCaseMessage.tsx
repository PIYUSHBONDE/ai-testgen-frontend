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

import React, { useState , useEffect} from 'react';
import { Maximize2, X, CheckSquare, Square, Loader2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import TestCaseCard from './TestCaseCard';
import { Button, IconButton } from './ui';
import { useToast } from './ToastProvider';
import { exportTestCaseToJira, fetchJiraProjects, fetchJiraRequirements } from '../api'; // Your API function


import * as XLSX from 'xlsx';

// Define the shape of a single test case object
type TestCase = {
  id: string;
  title: string;
  stepDetails: { step: string, expected: string }[];
  [key: string]: any; 
};

/**
 * Generates an Excel file from a test case object
 * @param {Object} testCase - The test case object containing id, title, stepDetails, and regulatory_refs
 * @param {string} [outputFileName] - Optional custom filename (defaults to testCase.title)
 */



// Define the status types for progress tracking
type ExportStatus = 'pending' | 'exporting' | 'success' | 'error';
type StatusState = {
  status: ExportStatus;
  jiraKey?: string;
  jiraUrl?: string;
};

// --- CHANGED: Renamed to StatusDisplay and added link logic ---
const StatusDisplay = ({ state }: { state?: StatusState }) => {
  if (!state) return null;

  switch (state.status) {
    case 'exporting': 
      return <Loader2 size={16} className="animate-spin text-slate-400" />;
    case 'error': 
      return <XCircle size={16} className="text-red-500" title="Error" />;
    
    // --- THIS IS THE NEW LOGIC ---
    case 'success':
      if (state.jiraUrl && state.jiraKey) {
        return (
          <a 
            href={state.jiraUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            title={`View ${state.jiraKey} in Jira`}
            className="text-blue-500 hover:text-blue-600"
            onClick={(e) => e.stopPropagation()} // Keep the click inside the link
          >
            <ExternalLink size={16} />
          </a>
        );
      }
      return <CheckCircle2 size={16} className="text-emerald-500" title="Success" />;
    // --- END NEW LOGIC ---

    default: 
      return null;
  }
};

interface TestCasesMessageProps {
  testcases: TestCase[];
  userId: string;
}

export default function TestCasesMessage({ testcases, userId }: TestCasesMessageProps) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(testcases[0] || null);

  // --- State for selection and export, moved from ExportView ---
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(testcases.map(tc => tc.id)));
  // --- CHANGED: Update state type ---
  const [exportStatus, setExportStatus] = useState<Record<string, StatusState>>({});
  const [isExporting, setIsExporting] = useState(false);
  const { addToast } = useToast();

  // --- NEW: State for Jira linking ---
  const [jiraProjects, setJiraProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [jiraRequirements, setJiraRequirements] = useState<any[]>([]);
  const [selectedRequirementKey, setSelectedRequirementKey] = useState<string | null>(null);
  
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);

  function generateTestCaseExcel(testCase, outputFileName = null) {
  try {
    // Validate input
    if (!testCase || !testCase.id || !testCase.title) {
      throw new Error('Invalid test case object: missing required fields (id, title)');
    }
    console.log('Generating Excel for test case:', testCase);

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Basic Info
    const infoData = [
      { ID: testCase.id, Title: testCase.title }
    ];
    
    // Add optional fields if they exist
    if (testCase.risk) {
      infoData[0].Risk = testCase.risk;
    }
    if (testCase.rationale) {
      infoData[0].Rationale = testCase.rationale;
    }
    
    const infoSheet = XLSX.utils.json_to_sheet(infoData);
    XLSX.utils.book_append_sheet(workbook, infoSheet, "Info");

    // Sheet 2: Preconditions (if any)
    if (testCase.preconditions && testCase.preconditions.length > 0) {
      const preconditionsSheet = XLSX.utils.json_to_sheet(
        testCase.preconditions.map((precondition, index) => ({ 
          No: index + 1,
          Precondition: precondition 
        }))
      );
      XLSX.utils.book_append_sheet(workbook, preconditionsSheet, "Preconditions");
    }

    // Sheet 3: Step Details
    if (testCase.stepDetails && testCase.stepDetails.length > 0) {
      const stepsWithNumbers = testCase.stepDetails.map((detail, index) => ({
        No: index + 1,
        Step: detail.step,
        Expected: detail.expected
      }));
      const stepsSheet = XLSX.utils.json_to_sheet(stepsWithNumbers);
      XLSX.utils.book_append_sheet(workbook, stepsSheet, "Steps");
    }

    // Sheet 4: Regulatory References
    if (testCase.regulatory_refs && testCase.regulatory_refs.length > 0) {
      const regSheet = XLSX.utils.json_to_sheet(
        testCase.regulatory_refs.map((ref, index) => ({ 
          No: index + 1,
          Regulatory_Reference: ref 
        }))
      );
      XLSX.utils.book_append_sheet(workbook, regSheet, "Regulatory_Refs");
    }

    // Generate filename
    const fileName = outputFileName || `${sanitizeFileName(testCase.title)}.xlsx`;
    
    // Write to Excel file
    XLSX.writeFile(workbook, fileName);

    console.log(`Excel file "${fileName}" generated successfully!`);
    addToast({
      title: 'Excel Export Complete',
      description: `Test case exported successfully in excel to local system.`,
      type: 'success'
    });
    return fileName;
    
  } catch (error) {
    addToast({
      title: 'Failed to Generate Excel',
      description: `Test case export failed.`,
      type: 'error'
    });
    console.error('Error generating Excel file:', error.message);
    throw error;
  }
}

/**
 * Helper function to sanitize filename
 * @param {string} filename - The filename to sanitize
 * @returns {string} Sanitized filename
 */
function sanitizeFileName(filename) {
  // Remove or replace invalid filename characters
  return filename
    .replace(/[<>:"/\\|?*]/g, '-') // Replace invalid chars with dash
    .replace(/\s+/g, '_') // Replace spaces with underscore
    .substring(0, 200); // Limit length to avoid filesystem issues
}

  useEffect(() => {
    // Only run if modal is open and we have a user ID
    if (isDetailModalOpen && userId) {
      setIsLoadingProjects(true);
      setJiraProjects([]);
      setJiraRequirements([]);
      setSelectedProject('');
      setSelectedRequirementKey(null);

      fetchJiraProjects(userId)
        .then(data => {
          if (data.projects) {
            setJiraProjects(data.projects);
          } else if (data.error) {
            addToast({ title: 'Jira Error', description: data.error, type: 'error' });
          }
        })
        .catch(err => addToast({ title: 'Failed to load Jira projects', description: err.message, type: 'error' }))
        .finally(() => setIsLoadingProjects(false));
    }
  }, [isDetailModalOpen, userId, addToast]); // Re-run if modal opens

  useEffect(() => {
    if (selectedProject && userId) {
      setIsLoadingRequirements(true);
      setJiraRequirements([]);
      setSelectedRequirementKey(null);
      
      fetchJiraRequirements(userId, selectedProject)
        .then(data => {
          if (data.requirements) {
            setJiraRequirements(data.requirements);
          } else if (data.error) {
            addToast({ title: 'Jira Error', description: data.error, type: 'error' });
          }
        })
        .catch(err => addToast({ title: 'Failed to load Jira requirements', description: err.message, type: 'error' }))
        .finally(() => setIsLoadingRequirements(false));
    }
  }, [selectedProject, userId, addToast]); // Re-run if project changes

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
    // 1. Check for project selection
    if (!selectedProject) {
      addToast({ title: 'Project Not Selected', description: 'Please select a Jira project first.', type: 'warning' });
      return;
    }

    setIsExporting(true);
    const testCasesToExport = testcases.filter(tc => selectedIds.has(tc.id));
    
    // Set initial status to "exporting"
    const initialStatus: Record<string, StatusState> = {};
    testCasesToExport.forEach(tc => { 
      initialStatus[tc.id] = { status: 'exporting' }; 
    });
    setExportStatus(initialStatus);

    let successCount = 0;
    
    for (const testCase of testCasesToExport) {
      try {
        // 2. "Reverse-transform" data for the API
        // The API expects `steps: [string]` and `expected: string`
        const apiTestCase = {
          ...testCase,
          // Remove markdown and combine steps
          steps: testCase.stepDetails.map(sd => sd.step.replace(/^\*?\*?\.?\s*/, '').replace(/\*\*/g, '')),
          // Combine all expected results into one string
          expected: testCase.stepDetails
                        .map(sd => sd.expected)
                        .filter(Boolean) // Remove empty strings
                        .join('\n') 
        };
        delete (apiTestCase as any).stepDetails; // Clean up prop API doesn't need

        // 3. Call the API with all parameters
        const responseData = await exportTestCaseToJira(
          userId, 
          selectedProject, 
          apiTestCase, 
          selectedRequirementKey // This is the link!
        );
        
        // 4. Store the link data from the response in our state
        setExportStatus(prev => ({ 
          ...prev, 
          [testCase.id]: { 
            status: 'success', 
            jiraKey: responseData.jira_key, 
            jiraUrl: responseData.jira_url 
          } 
        }));
        successCount++;
        
      } catch (error) {
        setExportStatus(prev => ({ 
          ...prev, 
          [testCase.id]: { status: 'error' } 
        }));
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
      {/* ✨ Classy Compact Card */}
      
      <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-lg border border-slate-200 dark:border-slate-700 shadow-md rounded-xl p-4 transition-all duration-300">

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
              🧪 Test Cases Generated
            </p>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {testcases.length} cases
            </span>
          </div>

          <button
            onClick={() => setIsDetailModalOpen(true)}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 hover:opacity-90 transition flex items-center gap-2"
          >
            <Maximize2 size={14} /> View
          </button>
        </div>

        <div className="max-h-32 overflow-y-auto pr-1 custom-scroll">
          <ol className="list-decimal pl-4 space-y-1 text-[13px]">
            {testcases.map((tc) => (
              <li key={tc.id} className="truncate hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                {tc.title}
              </li>
            ))}
          </ol>
        </div>

        {/* Fade bottom */}
        <div className="pointer-events-none bg-gradient-to-t from-white dark:from-slate-900 to-transparent h-6 w-full -mt-6"></div>
      </div>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(120, 120, 120, 0.35);
          border-radius: 6px;
        }
      `}</style>


      {/* --- MERGED DETAIL & EXPORT MODAL VIEW --- */}
      {isDetailModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex flex-col"
          onClick={() => !isExporting && setIsDetailModalOpen(false)}
        >
          <div 
            className="bg-slate-50 dark:bg-slate-800 w-full h-full flex flex-col overflow-hidden shadow-xl rounded-none"
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
                
                {/* --- 💡 CHANGED: Added 'scrollbar-hide' --- */}
                <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
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
                        <StatusDisplay state={exportStatus[tc.id]} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Panel: Detail Preview */}
              {/* --- 💡 CHANGED: Added 'scrollbar-hide' --- */}
              <div className="w-2/3 overflow-y-auto p-6 scrollbar-hide">
                {selectedTestCase ? <TestCaseCard testcase={selectedTestCase} /> : <div className="text-slate-500">Select a test case to view its details.</div>}
              </div>
            </div>

             {/* Modal Footer with Export Button */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center gap-3 flex-shrink-0">
              
              {/* NEW: Jira Linker */}
              <div className="flex-1 grid grid-cols-2 gap-3 max-w-lg">
                <div className="flex flex-col gap-1">
                  <label htmlFor="jiraProject" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Jira Project
                  </label>
                  <select
                    id="jiraProject"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    disabled={isLoadingProjects || isExporting}
                    className="text-sm rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">{isLoadingProjects ? 'Loading projects...' : 'Select project...'}</option>
                    {jiraProjects.map(p => (
                      <option key={p.key} value={p.key}>{p.name} ({p.key})</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label htmlFor="jiraRequirement" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Link to Requirement (Optional)
                  </label>
                  <select
                    id="jiraRequirement"
                    value={selectedRequirementKey || ''}
                    onChange={(e) => setSelectedRequirementKey(e.target.value || null)}
                    disabled={!selectedProject || isLoadingRequirements || isExporting}
                    className="text-sm rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">{isLoadingRequirements ? 'Loading...' : 'None'}</option>
                    {jiraRequirements.map((r: any) => (
                      <option key={r.jira_key} value={r.jira_key}>
                        {r.jira_key}: {r.text.substring(0, 40)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* End Jira Linker */}

              {/* Export Buttons */}
              
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setIsDetailModalOpen(false)} disabled={isExporting}>Cancel</Button>
                <Button 
                  className="bg-emerald-600 min-w-[180px]" 
                  onClick={()=>{generateTestCaseExcel(selectedTestCase!);console.log('Excel generated')}} 
                  // Disable if exporting, no items, or no project
                  disabled={isExporting || selectedIds.size === 0 }
                >
                  {isExporting ? <Loader2 className="animate-spin mr-2" /> : null}
                  {isExporting ? 'Exporting...' : `Export ${selectedIds.size} to excel`}
                </Button>
                <Button 
                  className="bg-emerald-600 min-w-[180px]" 
                  onClick={handleExport} 
                  // Disable if exporting, no items, or no project
                  disabled={isExporting || selectedIds.size === 0 || !selectedProject}
                >
                  {isExporting ? <Loader2 className="animate-spin mr-2" /> : null}
                  {isExporting ? 'Exporting...' : `Export ${selectedIds.size} to Jira`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
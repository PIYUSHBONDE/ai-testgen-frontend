import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X, CheckSquare, Square, Loader2, CheckCircle2, XCircle, ExternalLink, FileText } from 'lucide-react';
import TestCaseCard from './TestCaseCard'; 
import { Button, IconButton } from './ui';
import { useToast } from './ToastProvider';
import { exportTestCaseToJira, fetchJiraProjects, fetchJiraRequirements, fetchJiraExports } from '../api';
import * as XLSX from 'xlsx';

// Define the shape of a single test case object
type TestCase = {
  id: string;
  title: string;
  stepDetails?: { step: string, expected: string }[]; // New Format
  steps?: string[]; // Old Format Fallback
  expected?: string; // Old Format Fallback
  [key: string]: any; 
};

const StatusDisplay = ({ state }: { state?: any }) => {
  if (!state) return null;
  if (state.status === 'exporting') return <Loader2 size={16} className="animate-spin text-slate-400" />;
  if (state.status === 'error') return <XCircle size={16} className="text-red-500" title="Error" />;
  if (state.status === 'success') {
      if (state.jiraUrl && state.jiraKey) {
        return (
          <a 
            href={state.jiraUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            title={`View ${state.jiraKey} in Jira`}
            className="text-blue-500 hover:text-blue-600"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={16} />
          </a>
        );
      }
      return <CheckCircle2 size={16} className="text-emerald-500" title="Success" />;
  }
  return null;
};

interface TestCasesMessageProps {
  testcases: TestCase[];
  userId: string;
  sessionId?: string | null; // Active session id from ChatWorkspace
}

export default function TestCasesMessage({ testcases, userId, sessionId }: TestCasesMessageProps) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(testcases[0] || null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(testcases.map(tc => tc.id)));
  const [exportStatus, setExportStatus] = useState<Record<string, any>>({});
  const [isExporting, setIsExporting] = useState(false);
  const { addToast } = useToast();

  // Jira State
  const [jiraProjects, setJiraProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [jiraRequirements, setJiraRequirements] = useState<any[]>([]);
  const [selectedRequirementKey, setSelectedRequirementKey] = useState<string | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);

  useEffect(() => {
    if (isDetailModalOpen && userId) {
      setIsLoadingProjects(true);
      setJiraProjects([]);
      setJiraRequirements([]);
      setSelectedProject('');
      setSelectedRequirementKey(null);

      fetchJiraProjects(userId)
        .then((data: any) => {
          if (data.projects) {
            setJiraProjects(data.projects);
          } else if (data.error) {
            addToast({ title: 'Jira Error', description: data.error, type: 'error' });
          }
        })
        .catch((err: any) => addToast({ title: 'Failed to load Jira projects', description: err.message, type: 'error' }))
        .finally(() => setIsLoadingProjects(false));
    }
  }, [isDetailModalOpen, userId, addToast]);

  // Load persisted Jira exports for this session so we can show permanent success state
  useEffect(() => {
    if (!isDetailModalOpen || !sessionId || !userId) return;

    let mounted = true;
    fetchJiraExports(sessionId, userId)
      .then((data: any) => {
        if (!mounted) return;
        if (data && Array.isArray(data.exports)) {
          const statusMap: Record<string, any> = {};
          data.exports.forEach((e: any) => {
            // try matching by testcase_id first
            if (e.testcase_id) {
              statusMap[e.testcase_id] = {
                status: 'success',
                jiraKey: e.jira_key,
                jiraUrl: e.jira_url,
                export_id: e.id,
              };
            } else if (e.testcase_data && e.testcase_data.id) {
              // fallback: match by embedded testcase_data id
              statusMap[e.testcase_data.id] = {
                status: 'success',
                jiraKey: e.jira_key,
                jiraUrl: e.jira_url,
                export_id: e.id,
              };
            }
          });
          setExportStatus(prev => ({ ...prev, ...statusMap }));
        }
      })
      .catch(err => {
        console.warn('Failed to fetch persisted Jira exports', err);
      });

    return () => { mounted = false; };
  }, [isDetailModalOpen, sessionId, userId]);

  useEffect(() => {
    if (selectedProject && userId) {
      setIsLoadingRequirements(true);
      setJiraRequirements([]);
      setSelectedRequirementKey(null);
      
      fetchJiraRequirements(userId, selectedProject)
        .then((data: any) => {
          if (data.requirements) {
            setJiraRequirements(data.requirements);
          } else if (data.error) {
            addToast({ title: 'Jira Error', description: data.error, type: 'error' });
          }
        })
        .catch((err: any) => addToast({ title: 'Failed to load Jira requirements', description: err.message, type: 'error' }))
        .finally(() => setIsLoadingRequirements(false));
    }
  }, [selectedProject, userId, addToast]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(testcases.map(tc => tc.id)));
  const deselectAll = () => setSelectedIds(new Set());

  // --- 🎨 HELPER: Generate Beautiful Jira Markup ---
  const generateJiraDescription = (tc: TestCase) => {
    // 1. Header
    let desc = `h2. ${tc.title}\n\n`;

    // 2. Metadata Panel (Gray background panel for metadata)
    desc += `{panel:title=Test Case Details|borderStyle=solid|borderColor=#dfe1e6|titleBGColor=#f4f5f7|bgColor=#ffffff}\n`;
    desc += `* *ID:* ${tc.id}\n`;
    desc += `* *Risk:* ${tc.risk || 'N/A'}\n`;
    desc += `* *Regulatory Refs:* ${Array.isArray(tc.regulatory_refs) ? tc.regulatory_refs.join(', ') : 'N/A'}\n`;
    desc += `{panel}\n\n`;

    // 3. Rationale (Quoted text)
    if (tc.rationale) {
      desc += `*Rationale:*\n{quote}${tc.rationale}{quote}\n\n`;
    }

    // 4. Preconditions (Bulleted List)
    if (Array.isArray(tc.preconditions) && tc.preconditions.length > 0) {
      desc += `h3. Preconditions\n`;
      tc.preconditions.forEach(p => desc += `* ${p}\n`);
      desc += `\n`;
    }

    // 5. Test Steps Table (Double pipe || creates header)
    desc += `h3. Test Steps\n`;
    desc += `||#||Step Description||Expected Result||\n`;

    if (Array.isArray(tc.stepDetails) && tc.stepDetails.length > 0) {
       tc.stepDetails.forEach((s, i) => {
         // Escape pipes to prevent breaking the table syntax
         const safeStep = (s.step || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
         const safeExpected = (s.expected || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
         desc += `|${i+1}|${safeStep}|${safeExpected}|\n`;
       });
    } else if (Array.isArray(tc.steps) && tc.steps.length > 0) {
       // Fallback for old format
       tc.steps.forEach((s, i) => {
          const safeStep = s.replace(/\|/g, '\\|');
          const safeExpected = (i === tc.steps!.length - 1 && tc.expected) ? tc.expected.replace(/\|/g, '\\|') : ' ';
          desc += `|${i+1}|${safeStep}|${safeExpected}|\n`;
       });
    }
    
    return desc;
  };

  // --- 🚀 UPDATED: Split Columns Logic ---
  const handleExportCSV = () => {
    const testCasesToExport = testcases.filter(tc => selectedIds.has(tc.id));
    
    if (testCasesToExport.length === 0) {
        addToast({ title: 'No Selection', description: 'Please select at least one test case.', type: 'warning' });
        return;
    }

    try {
        const csvData = testCasesToExport.map(tc => {
            let stepsText = '';
            let expectedText = '';

            // 1. Handle New Data Format (stepDetails array)
            if (Array.isArray(tc.stepDetails) && tc.stepDetails.length > 0) {
                // Join steps with newlines
                stepsText = tc.stepDetails.map((s, i) => `${i + 1}. ${s.step}`).join('\n');
                // Join expected results with newlines
                expectedText = tc.stepDetails.map((s, i) => `${i + 1}. ${s.expected}`).join('\n');
            } 
            // 2. Handle Old Data Format (steps array + single expected string)
            else if (Array.isArray(tc.steps) && tc.steps.length > 0) {
                stepsText = tc.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
                expectedText = tc.expected || '';
            }

            return {
                ID: tc.id,
                Title: tc.title,
                Risk: tc.risk || 'N/A',
                'Test Steps': stepsText,      // Column 1
                'Expected Result': expectedText, // Column 2 (Separate)
                Preconditions: Array.isArray(tc.preconditions) ? tc.preconditions.join('\n') : '',
                Rationale: tc.rationale || '',
                Regulatory_Refs: Array.isArray(tc.regulatory_refs) ? tc.regulatory_refs.join(', ') : ''
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(csvData);
        
        // Adjust column widths (wider for Steps and Expected)
        const wscols = [
            { wch: 15 }, // ID
            { wch: 40 }, // Title
            { wch: 10 }, // Risk
            { wch: 50 }, // Test Steps
            { wch: 50 }, // Expected Result
            { wch: 30 }, // Preconditions
            { wch: 30 }, // Rationale
            { wch: 20 }, // Refs
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "TestCases");

        const fileName = `TestCases_${new Date().toISOString().slice(0,10)}.csv`;
        XLSX.writeFile(workbook, fileName);

        addToast({ 
            title: 'Export Successful', 
            description: `Downloaded ${fileName}`, 
            type: 'success' 
        });
    } catch (error) {
        console.error("CSV Export failed:", error);
        addToast({ title: 'Export Failed', description: 'Could not generate CSV file.', type: 'error' });
    }
  };

  const handleExportJira = async () => {
    if (!selectedProject) {
      addToast({ title: 'Project Not Selected', description: 'Please select a Jira project first.', type: 'warning' });
      return;
    }

    setIsExporting(true);
    const testCasesToExport = testcases.filter(tc => selectedIds.has(tc.id));
    
    const initialStatus: Record<string, any> = {};
    testCasesToExport.forEach(tc => { initialStatus[tc.id] = { status: 'exporting' }; });
    setExportStatus(initialStatus);

    let successCount = 0;
    
    for (const testCase of testCasesToExport) {
      try {
        // 1. Generate the beautiful description
        const formattedDescription = generateJiraDescription(testCase);

        console.log("Formatted Description for TC ID", testCase.id, ":\n", formattedDescription);

        // 2. Prepare Payload
        // We still prepare raw steps/expected in case the backend logic uses them separately,
        // but we explicitly override 'description' with our formatted version.
        let stepsPayload: string[] = [];
        let expectedPayload: string = "";

        if (testCase.stepDetails) {
            stepsPayload = testCase.stepDetails.map(sd => sd.step.replace(/^\*?\*?\.?\s*/, '').replace(/\*\*/g, ''));
            expectedPayload = testCase.stepDetails.map(sd => sd.expected).filter(Boolean).join('\n');
        } else if (testCase.steps) {
            stepsPayload = testCase.steps;
            expectedPayload = testCase.expected || "";
        }

        const apiTestCase = {
          ...testCase,
          description: formattedDescription, // <--- INJECTED BEAUTIFUL DESCRIPTION
          steps: stepsPayload,
          expected: expectedPayload
        };
        delete (apiTestCase as any).stepDetails;

        const responseData = await exportTestCaseToJira(
          userId,
          sessionId || null,
          selectedProject,
          apiTestCase,
          selectedRequirementKey
        );
        
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
        setExportStatus(prev => ({ ...prev, [testCase.id]: { status: 'error' } }));
      }
    }

    setIsExporting(false);
    addToast({
      title: 'Jira Export Complete',
      description: `${successCount} of ${testCasesToExport.length} test cases exported successfully.`,
      type: successCount === testCasesToExport.length ? 'success' : 'info'
    });
  };

  return (
    <>
      {/* --- Compact Card (In Chat) --- */}
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
        <div className="pointer-events-none bg-gradient-to-t from-white dark:from-slate-900 to-transparent h-6 w-full -mt-6"></div>
      </div>

      {/* --- Modal (Portal to Body) --- */}
      {isDetailModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          onClick={() => !isExporting && setIsDetailModalOpen(false)}
        >
          <div 
            className="bg-slate-50 dark:bg-slate-800 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0 bg-white dark:bg-slate-800/50">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                Test Case Details & Export
              </h3>
              <IconButton onClick={() => setIsDetailModalOpen(false)} title="Close" disabled={isExporting}>
                <X size={20} />
              </IconButton>
            </div>
            
            <div className="flex-1 flex overflow-hidden">
              {/* Left Selection Panel */}
              <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-white/50 dark:bg-slate-800/50">
                <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAll} disabled={isExporting}>Select All</Button>
                    <Button variant="outline" size="sm" onClick={deselectAll} disabled={isExporting}>Deselect All</Button>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">{selectedIds.size} of {testcases.length} selected</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                  {testcases.map(tc => (
                    <div 
                      key={tc.id} 
                      onClick={() => !isExporting && setSelectedTestCase(tc)}
                      className={`p-3 rounded-md flex items-start gap-3 mb-1 ${!isExporting ? 'cursor-pointer' : ''} ${selectedTestCase?.id === tc.id ? 'bg-emerald-100 dark:bg-emerald-900/50 ring-1 ring-emerald-500/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                      <div className="mt-1" onClick={(e) => { e.stopPropagation(); if (!isExporting) toggleSelection(tc.id); }}>
                        {selectedIds.has(tc.id) ? <CheckSquare className="text-emerald-600" size={18}/> : <Square className="text-slate-400" size={18}/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">{tc.title}</div>
                        <div className="text-xs text-slate-500 truncate">{tc.id}</div>
                      </div>
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                        <StatusDisplay state={exportStatus[tc.id]} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Detail Panel */}
              <div className="w-2/3 overflow-y-auto p-6 bg-white dark:bg-slate-900">
                        {selectedTestCase ? (
                          <div>
                            <div className="flex items-center justify-end gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                <StatusDisplay state={exportStatus[selectedTestCase.id]} />
                                {exportStatus[selectedTestCase.id] && exportStatus[selectedTestCase.id].jiraUrl ? (
                                  <a href={exportStatus[selectedTestCase.id].jiraUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-sm">
                                    {exportStatus[selectedTestCase.id].jiraKey || 'View in Jira'}
                                  </a>
                                ) : null}
                              </div>
                            </div>
                            <TestCaseCard testcase={selectedTestCase} />
                          </div>
                        ) : (
                          <div className="text-slate-500">Select a test case to view its details.</div>
                        )}
              </div>
            </div>

             {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center gap-3 flex-shrink-0 bg-slate-50 dark:bg-slate-800">
              
              {/* Jira Linker */}
              <div className="flex-1 grid grid-cols-2 gap-3 max-w-lg">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Jira Project</label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    disabled={isLoadingProjects || isExporting}
                    className="text-sm rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-1.5"
                  >
                    <option value="">{isLoadingProjects ? 'Loading...' : 'Select project...'}</option>
                    {jiraProjects.map(p => (
                      <option key={p.key} value={p.key}>{p.name} ({p.key})</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Requirement Link</label>
                  <select
                    value={selectedRequirementKey || ''}
                    onChange={(e) => setSelectedRequirementKey(e.target.value || null)}
                    disabled={!selectedProject || isLoadingRequirements || isExporting}
                    className="text-sm rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-1.5"
                  >
                    <option value="">{isLoadingRequirements ? 'Loading...' : 'None'}</option>
                    {jiraRequirements.map((r: any) => (
                      <option key={r.jira_key} value={r.jira_key}>{r.jira_key}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setIsDetailModalOpen(false)} disabled={isExporting}>Cancel</Button>
                
                <Button 
                  className="bg-emerald-600 min-w-[140px]" 
                  onClick={handleExportCSV}
                  disabled={isExporting || selectedIds.size === 0}
                  title="Download as CSV"
                >
                  {/* <FileText size={16} className="mr-2" /> */}
                  Export CSV
                </Button>

                <Button 
                  className="bg-emerald-600 min-w-[140px]" 
                  onClick={handleExportJira} 
                  disabled={isExporting || selectedIds.size === 0 || !selectedProject}
                >
                  {isExporting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                  {isExporting ? 'Exporting...' : `Export to Jira`}
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
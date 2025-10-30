// components/RequirementsManager.tsx - EVERYTHING IN ONE

import React, { useState, useEffect } from 'react';
import { FileText, ExternalLink, X, Loader2, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSessionRequirements, fetchJiraProjects, fetchJiraRequirements, importJiraRequirements, checkJiraConnectionStatus, deleteRequirement, checkDuplicateRequirements   } from '../../api';
import { useToast } from '../ToastProvider';

interface Requirement {
  id: string;  // Database ID (used for deletion)
  requirement_id?: string;  // Display ID like REQ-001
  text: string;
  risk_level: string;
  compliance_standard: string;
  jira_key?: string;
  status: string;
  test_case_count: number;
}


interface JiraRequirement {
  id: string;
  jira_key: string;
  text: string;
  type: string;
  risk_level: string;
  compliance_standard: string;
  jira_url?: string;
}

export default function RequirementsManager({
  sessionId,
  userId,
  isOpen,
  onClose
}: {
  sessionId: string | null;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { addToast } = useToast();
  
  // View state
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loadingRequirements, setLoadingRequirements] = useState(false);
  
  // Import state
  const [jiraConnected, setJiraConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [view, setView] = useState<'list' | 'import-projects' | 'import-requirements' | 'importing' | 'confirm-overwrite'>('list');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [jiraRequirements, setJiraRequirements] = useState<JiraRequirement[]>([]);
  const [selectedRequirements, setSelectedRequirements] = useState<Set<string>>(new Set());
  const [loadingImport, setLoadingImport] = useState(false);

  // Overwrite confirmation state
  const [duplicateInfo, setDuplicateInfo] = useState<{
    existing_ids: string[];
    count: number;
  } | null>(null);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && sessionId) {
      checkJiraConnection();
      fetchRequirements();
    }
  }, [isOpen, sessionId]);

  const fetchRequirements = async () => {
    if (!sessionId) return;
    
    setLoadingRequirements(true);
    try {
      const data = await getSessionRequirements(userId, sessionId);
      setRequirements(data.requirements || []);
    } catch (err) {
      console.error('Failed to fetch requirements:', err);
    } finally {
      setLoadingRequirements(false);
    }
  };

  // ========== JIRA IMPORT FUNCTIONS ==========

  // ✅ UPDATE startImport
  const startImport = async () => {
    // Check if connected first
    if (!jiraConnected) {
      addToast({ 
        title: 'Jira Not Connected', 
        description: 'Please connect your Jira account in the profile menu first.', 
        type: 'warning' 
      });
      return;
    }

    setView('import-projects');
    setLoadingImport(true);
    try {
      const data = await fetchJiraProjects(userId);
      if (data.error) {
        addToast({ title: 'Error', description: data.error, type: 'error' });
        setView('list');
        return;
      }
      setProjects(data.projects || []);
    } catch (err) {
      addToast({ title: 'Failed to load projects', type: 'error' });
      setView('list');
    } finally {
      setLoadingImport(false);
    }
  };

  const loadJiraRequirements = async (projectKey: string) => {
    setLoadingImport(true);
    try {
      const data = await fetchJiraRequirements(userId, projectKey);
      if (data.error) {
        addToast({ title: 'Error', description: data.error, type: 'error' });
        return;
      }
      setJiraRequirements(data.requirements || []);
      setView('import-requirements');
    } catch (err) {
      addToast({ title: 'Failed to load requirements', type: 'error' });
    } finally {
      setLoadingImport(false);
    }
  };

  const toggleRequirement = (reqId: string) => {
    const newSelected = new Set(selectedRequirements);
    if (newSelected.has(reqId)) {
      newSelected.delete(reqId);
    } else {
      newSelected.add(reqId);
    }
    setSelectedRequirements(newSelected);
  };

  // ✅ ADD THIS FUNCTION
  const checkJiraConnection = async () => {
    setCheckingConnection(true);
    try {
      const data = await checkJiraConnectionStatus(userId);
      setJiraConnected(data.connected);
    } catch (err) {
      console.error('Failed to check Jira connection:', err);
      setJiraConnected(false);
    } finally {
      setCheckingConnection(false);
    }
  };

  // Check for duplicates before importing
const prepareImport = async () => {
  if (!sessionId || selectedRequirements.size === 0) {
    addToast({ title: 'Please select requirements', type: 'warning' });
    return;
  }

  setLoadingImport(true);
  try {
    // Get selected requirement IDs
    const selectedReqs = jiraRequirements.filter((r) =>
      selectedRequirements.has(r.id)
    );
    const reqIds = selectedReqs.map((r) => r.id);

    // Check for duplicates
    const duplicateCheck = await checkDuplicateRequirements(
      userId,
      sessionId,
      reqIds
    );

    if (duplicateCheck.has_duplicates) {
      setDuplicateInfo({
        existing_ids: duplicateCheck.existing_requirement_ids,
        count: duplicateCheck.count,
      });
      setView('confirm-overwrite');
    } else {
      // No duplicates, proceed directly
      await performImport(false);
    }
  } catch (err) {
    addToast({ title: 'Failed to check duplicates', type: 'error' });
  } finally {
    setLoadingImport(false);
  }
};

const performImport = async (overwrite: boolean) => {
  if (!sessionId) return;

  setView('importing');
  setLoadingImport(true);
  try {
    const selectedReqs = jiraRequirements.filter((r) =>
      selectedRequirements.has(r.id)
    );
    const result = await importJiraRequirements(
      userId,
      sessionId,
      selectedReqs,
      overwrite
    );

    addToast({
      title: 'Success',
      description: result.message,
      type: 'success',
    });

    // Refresh list and go back to main view
    await fetchRequirements();
    setView('list');
    setSelectedRequirements(new Set());
    setDuplicateInfo(null);
  } catch (err) {
    addToast({ title: 'Import failed', type: 'error' });
    setView('import-requirements');
  } finally {
    setLoadingImport(false);
  }
};

  const handleDelete = async (reqId: string) => {
  if (!sessionId) return;

  if (!confirm('Are you sure you want to delete this requirement?')) {
    return;
  }

  setDeletingId(reqId);
  try {
    await deleteRequirement(userId, sessionId, reqId);
    addToast({
      title: 'Deleted',
      description: 'Requirement deleted successfully',
      type: 'success',
    });
    await fetchRequirements();
  } catch (err) {
    addToast({ title: 'Failed to delete requirement', type: 'error' });
  } finally {
    setDeletingId(null);
  }
};


  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText size={20} />
              {view === 'list' && `Requirements (${requirements.length})`}
              {view === 'import-projects' && 'Select Jira Project'}
              {view === 'import-requirements' && `Select Requirements (${selectedRequirements.size} selected)`}
              {view === 'importing' && 'Importing...'}
              {view === 'confirm-overwrite' && 'Confirm Import'}
            </h2>
            <div className="flex items-center gap-2">
              {view === 'list' && (
                <>
                {checkingConnection ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                ) : jiraConnected ? (
                    <button
                    onClick={startImport}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                    <Upload size={16} />
                    Import from Jira
                    </button>
                ) : (
                    <button
                    disabled
                    className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed text-sm"
                    title="Connect Jira account in profile menu first"
                    >
                    <Upload size={16} />
                    Jira Not Connected
                    </button>
                )}
                </>
              )}
              {view === 'import-requirements' && (
                <button
                  onClick={() => setView('import-projects')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Change Project
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* ========== VIEW: LIST (Imported Requirements) ========== */}
            {view === 'list' && (
              <>
                {loadingRequirements ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : requirements.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-semibold mb-2">No requirements yet</p>
                    <p className="text-sm">Click "Import from Jira" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {requirements.map(req => (
                      <div 
                        key={req.id} 
                        className="border dark:border-slate-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Left side - Main content */}
                          <div className="flex-1 min-w-0">
                            {/* Header with ID and Jira key */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                                {req.requirement_id || req.id}
                              </span>
                              {req.jira_key && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                                  {req.jira_key}
                                  <ExternalLink size={10} />
                                </span>
                              )}
                            </div>
                            
                            {/* Requirement text */}
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
                              {req.text}
                            </p>
                            
                            {/* Tags */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs px-2 py-1 rounded font-medium ${getRiskColor(req.risk_level)}`}>
                                {req.risk_level.toUpperCase()}
                              </span>
                              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-medium">
                                {req.compliance_standard}
                              </span>
                              {req.test_case_count > 0 && (
                                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-medium">
                                  {req.test_case_count} test cases
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Right side - Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(req.id);
                            }}
                            disabled={deletingId === req.id}
                            className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-start"
                            title="Delete requirement"
                          >
                            {deletingId === req.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ========== VIEW: SELECT PROJECT ========== */}
            {view === 'import-projects' && (
              <>
                {loadingImport ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {projects.map(project => (
                      <button
                        key={project.key}
                        onClick={() => {
                          setSelectedProject(project.key);
                          loadJiraRequirements(project.key);
                        }}
                        className="p-4 border dark:border-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 text-left"
                      >
                        <div className="font-semibold">{project.name}</div>
                        <div className="text-sm text-gray-500">{project.key}</div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ========== VIEW: SELECT REQUIREMENTS ========== */}
            {view === 'import-requirements' && (
              <>
                {loadingImport ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : jiraRequirements.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No requirements found in this project
                  </div>
                ) : (
                  <div className="space-y-2">
                    {jiraRequirements.map(req => (
                      <label
                        key={req.id}
                        className="flex items-start gap-3 p-3 border dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRequirements.has(req.id)}
                          onChange={() => toggleRequirement(req.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-semibold">{req.id}</span>
                            <span className="text-xs text-gray-500">{req.jira_key}</span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{req.text}</p>
                          <div className="flex gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded ${getRiskColor(req.risk_level)}`}>
                              {req.risk_level.toUpperCase()}
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-slate-600">
                              {req.compliance_standard}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ========== VIEW: IMPORTING ========== */}
            {view === 'importing' && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
                <p className="text-lg font-semibold">Importing requirements...</p>
                <p className="text-sm text-gray-500 mt-2">Uploading to knowledge base</p>
              </div>
            )}

                        {/* ========== VIEW: CONFIRM OVERWRITE ========== */}
            {view === 'confirm-overwrite' && duplicateInfo && (
              <div className="py-6">
                <div className="flex items-start gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-6">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      Duplicate Requirements Found
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {duplicateInfo.count} of the selected requirements already exist in
                      this session. Would you like to overwrite them or skip?
                    </p>
                    <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                      <p className="font-medium mb-1">Existing IDs:</p>
                      <p className="font-mono">{duplicateInfo.existing_ids.join(', ')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setView('import-requirements');
                      setDuplicateInfo(null);
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => performImport(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Skip Duplicates
                  </button>
                  <button
                    onClick={() => performImport(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Overwrite Existing
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Footer - Only show for import requirements step */}
          {view === 'import-requirements' && (
            <div className="flex items-center justify-end gap-2 p-4 border-t dark:border-slate-700">
              <button
                onClick={() => setView('list')}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={prepareImport}  // Changed from handleImport
                disabled={selectedRequirements.size === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import {selectedRequirements.size} Requirements
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

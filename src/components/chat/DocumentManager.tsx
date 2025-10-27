// src/components/chat/DocumentManager.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Loader2, Check } from 'lucide-react';
import { IconButton } from '../ui';
import { useToast } from '../ToastProvider';
import { fetchSessionDocuments, toggleDocumentActive } from '../../api';

export interface Document {
  id: string;
  filename: string;
  chunk_count: number;
  total_pages: number;
  summary: string;
  uploaded: string;
  is_active: boolean;
}

interface DocumentManagerProps {
  sessionId: string | null;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  refreshKey: number;
}

export default function DocumentManager({
  sessionId,
  userId,
  isOpen,
  onClose,
  refreshKey
}: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const activeCount = documents.filter(d => d.is_active).length;

  useEffect(() => {
    if (isOpen && sessionId) {
      loadDocuments();
    }
  }, [isOpen, sessionId, refreshKey]);

  const loadDocuments = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      // --- USE THE NEW API FUNCTION ---
      const data = await fetchSessionDocuments(userId, sessionId);
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
      addToast({
        title: 'Error loading documents',
        description: 'Could not fetch documents for this session',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDocument = async (docId: string, currentActive: boolean) => {
    const newActiveState = !currentActive;
    try {
      // --- USE THE NEW API FUNCTION ---
      await toggleDocumentActive(userId, docId, newActiveState);

      // Update local state
      setDocuments(docs =>
        docs.map(d =>
          d.id === docId ? { ...d, is_active: newActiveState } : d
        )
      );

      addToast({
        title: !currentActive ? 'Document activated' : 'Document deactivated',
        description: `${documents.find(d => d.id === docId)?.filename} will ${newActiveState ? 'now' : 'no longer'} be searched`,
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to toggle document:', error);
      addToast({
        title: 'Error',
        description: 'Could not update document status',
        type: 'error'
      });
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-[420px] max-w-[90vw] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Session Documents
              </h2>
              <IconButton onClick={onClose} className="hover:bg-slate-200 dark:hover:bg-slate-700">
                <X className="w-5 h-5" />
              </IconButton>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-20">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                  <p className="text-slate-600 dark:text-slate-400 mb-2">
                    No documents uploaded yet
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-500">
                    Upload a document to get started
                  </p>
                </div>
              ) : (
                <>
                  {/* Summary */}
                  <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                      {activeCount} of {documents.length} active
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                      Only active documents will be searched
                    </p>
                  </div>

                  {/* Document List */}
                  <div className="space-y-3">
                    {documents.map(doc => (
                      <motion.div
                        key={doc.id}
                        layout
                        className={`
                          p-4 rounded-lg border-2 transition-all
                          ${doc.is_active
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 opacity-60'
                          }
                        `}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 
                              className="font-medium text-slate-900 dark:text-slate-100 truncate"
                              title={doc.filename}
                            >
                              📄 {doc.filename}
                            </h3>
                            <span
                              className={`
                                inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1
                                ${doc.is_active
                                  ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                }
                              `}
                            >
                              {doc.is_active ? '✓ Active' : '○ Inactive'}
                            </span>
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
                          <span>{doc.total_pages} pages</span>
                          <span>•</span>
                          <span>{doc.chunk_count} chunks</span>
                          <span>•</span>
                          <span>{new Date(doc.uploaded).toLocaleDateString()}</span>
                        </div>

                        {/* Summary */}
                        {doc.summary && (
                          <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 line-clamp-2">
                            {doc.summary}
                          </p>
                        )}

                        {/* Toggle */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {doc.is_active ? 'Searchable' : 'Not searchable'}
                          </span>
                          <button
                            onClick={() => toggleDocument(doc.id, doc.is_active)}
                            className={`
                              relative inline-flex h-6 w-11 items-center rounded-full
                              transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                              ${doc.is_active ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'}
                            `}
                          >
                            <span
                              className={`
                                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                ${doc.is_active ? 'translate-x-6' : 'translate-x-1'}
                              `}
                            />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

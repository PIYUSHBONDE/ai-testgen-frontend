import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, File as FileIcon, UploadCloud, Loader2, Trash2 } from 'lucide-react';
import { Button, IconButton } from '../ui';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
  sessionId: string;
}

export default function FileUploadModal({ isOpen, onClose, onUpload, sessionId }: FileUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Append new files to existing selection
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/xml': ['.xml'],
      'text/markdown': ['.md'],
      'text/plain': ['.txt'],
      'text/html': ['.html'],
    },
  });

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadClick = () => {
    if (selectedFiles.length === 0) return;
    
    // Pass the entire array to the parent
    onUpload(selectedFiles);
    
    // Clear and close immediately
    setSelectedFiles([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Attach Documents</h3>
          <IconButton onClick={onClose} title="Close"><X size={20} /></IconButton>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {/* Drop Zone */}
          <div 
            {...getRootProps()} 
            className={`p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'}`
            }
          >
            <input {...getInputProps()} />
            <UploadCloud size={32} className={`mb-2 ${isDragActive ? 'text-emerald-600' : 'text-slate-400'}`} />
            {isDragActive ? (
              <p className="text-emerald-600 font-semibold">Drop files here...</p>
            ) : (
              <p className="text-slate-500">Drag & drop files, or click to select</p>
            )}
            <p className="text-xs text-slate-400 mt-1">PDF, DOCX, XML, MD, TXT supported</p>
          </div>

          {/* File List */}
          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Selected Files ({selectedFiles.length})
              </p>
              {selectedFiles.map((file, idx) => (
                <div key={`${file.name}-${idx}`} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileIcon size={20} className="text-emerald-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFile(idx)} 
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 flex-shrink-0 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            className="bg-emerald-600 min-w-[120px]" 
            onClick={handleUploadClick} 
            disabled={selectedFiles.length === 0}
          >
            {selectedFiles.length > 1 ? `Upload ${selectedFiles.length} Files` : 'Upload File'}
          </Button>
        </div>
      </div>
    </div>
  );
}
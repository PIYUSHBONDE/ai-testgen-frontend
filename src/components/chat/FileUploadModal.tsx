import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, File as FileIcon, UploadCloud, Loader2 } from 'lucide-react';
import { Button, IconButton } from '../ui';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  sessionId: string; // ADD THIS
}

export default function FileUploadModal({ isOpen, onClose, onUpload, sessionId }: FileUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/xml': ['.xml'],
      'text/markdown': ['.md'],
      'text/html': ['.html'],
    },
  });

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await onUpload(selectedFile);
      onClose(); // Close modal on successful upload
    } catch (error) {
      console.error("Upload failed in modal:", error);
      // Error toast is handled in the parent component
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Attach a Document</h3>
          <IconButton onClick={onClose} title="Close"><X size={20} /></IconButton>
        </div>
        
        <div className="p-6">
          <div 
            {...getRootProps()} 
            className={`p-10 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'}`
            }
          >
            <input {...getInputProps()} />
            <UploadCloud size={40} className={`mb-2 ${isDragActive ? 'text-emerald-600' : 'text-slate-400'}`} />
            {isDragActive ? (
              <p className="text-emerald-600 font-semibold">Drop the file here...</p>
            ) : (
              <p className="text-slate-500">Drag & drop a file here, or click to select</p>
            )}
            <p className="text-xs text-slate-400 mt-1">PDF, DOCX, XML, MD, HTML supported</p>
          </div>

          {selectedFile && (
            <div className="mt-4 p-3 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileIcon size={24} className="text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <IconButton onClick={() => setSelectedFile(null)} title="Remove file"><X size={16} /></IconButton>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isUploading}>Cancel</Button>
          <Button className="bg-emerald-600 w-32" onClick={handleUpload} disabled={!selectedFile || isUploading}>
            {isUploading ? <Loader2 className="animate-spin" /> : 'Upload File'}
          </Button>
        </div>
      </div>
    </div>
  );
}
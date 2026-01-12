import React, { useState, useRef, useEffect } from 'react'
import { Send, Plus } from 'lucide-react'
import { IconButton } from '../ui'
import FileUploadModal from './FileUploadModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ToastProvider';
import { uploadFile } from '../../api';

export default function MessageInput({ 
  onSend, 
  disabled, 
  sessionId, 
  onUploadComplete 
}: { 
  onSend: (text: string) => void; 
  disabled?: boolean; 
  sessionId: string | null; 
  onUploadComplete: (filenames: string[]) => void; 
}) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();
  const [uploadBlockedFlash, setUploadBlockedFlash] = useState(false);

  useEffect(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
  }, [value])

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const text = value.trim()
    if (!text) return
    onSend(text)
    setValue('')
  }

  // ✅ UPDATED: Sequential Upload Handler
  const handleUploads = async (files: File[]) => {
    if (!user || !sessionId) {
        addToast({ title: 'Error', description: 'Cannot upload file without an active session.', type: 'error' });
        return;
    }

    // 1. Notify ChatWorkspace about ALL files immediately.
    // This updates the UI to show "2 uploads processing" right away.
    const filenames = files.map(f => f.name);
    onUploadComplete(filenames);

    addToast({ 
        title: 'Uploads Started', 
        description: `Uploading ${files.length} file(s) sequentially...`, 
        type: 'info' 
    });

    // 2. Process files SEQUENTIALLY (One by one)
    for (const file of files) {
        try {
            // We await here, so the next file won't start until this one finishes
            await uploadFile(user.uid, sessionId, file);
            
            // Optional: Small toast for progress
            // addToast({ title: 'Uploaded', description: file.name, type: 'success' });
        } catch (error) {
            console.error(`Failed to upload ${file.name}`, error);
            addToast({ 
                title: 'Upload Failed', 
                description: `Could not upload ${file.name}.`, 
                type: 'error' 
            });
        }
    }
  };

  return (
    <>
      <form onSubmit={submit} className="absolute bottom-0 left-0 right-0 p-4 flex justify-center pointer-events-none">
        <div className="w-full max-w-3xl flex items-end gap-2 p-2 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 pointer-events-auto">
          <IconButton
            onClick={() => {
              if (disabled) {
                addToast({ title: 'Wait a moment', description: 'Please wait for current action to finish.', type: 'info' });
                setUploadBlockedFlash(true);
                setTimeout(() => setUploadBlockedFlash(false), 700);
                return;
              }
              setIsUploadModalOpen(true);
            }}
            title="Attach files"
            className={`flex-shrink-0 ${uploadBlockedFlash ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}
          >
            <Plus size={20} />
          </IconButton>

          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Send a message..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            disabled={disabled}
            className="flex-1 resize-none scrollbar-hide 
            bg-transparent outline-none py-2 px-2 text-slate-800 dark:text-slate-100 placeholder-slate-500 max-h-[200px] overflow-y-auto"
          />
          
          <IconButton
            type="submit"
            title="Send"
            className="flex-shrink-0 bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-slate-400 dark:disabled:bg-slate-600"
            disabled={disabled || !value.trim()}
          >
            <Send size={20} />
          </IconButton>
        </div>
      </form>

      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploads}
        sessionId={sessionId || ''}
      />
    </>
  )
}
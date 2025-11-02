import React, { useState, useRef, useEffect } from 'react'
import { Send, Plus } from 'lucide-react'
import { IconButton } from '../ui'
import FileUploadModal from './FileUploadModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ToastProvider';
import { uploadFile } from '../../api';

export default function   MessageInput({ onSend, disabled, sessionId, onUploadComplete }: { onSend: (text: string) => void; disabled?: boolean, sessionId: string | null; onUploadComplete: () => void; }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false); // 2. Add state to control the modal
  const { user } = useAuth();
  const { addToast } = useToast();

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

  // 3. Create the upload handler function
  const handleUpload = async (file: File) => {
    if (!user || !sessionId) {
        addToast({ title: 'Error', description: 'Cannot upload file without an active session.', type: 'error' });
        return;
    }
    try {
        await uploadFile(user.uid, sessionId, file);
        addToast({ title: 'Success', description: `${file.name} uploaded successfully. The agent will now process it.`, type: 'success' });
        onUploadComplete();
    } catch (error) {
        addToast({ title: 'Upload Failed', description: 'There was an error uploading your file.', type: 'error' });
        // Re-throw the error to let the modal know it failed
        throw error;
    }
  };

  return (
    <>
      {/* // Floating form positioned absolutely by the parent */}
      <form onSubmit={submit} className="absolute bottom-0 left-0 right-0 p-4 flex justify-center pointer-events-none">
        <div className="w-full max-w-3xl flex items-end gap-2 p-2 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 pointer-events-auto">
          <IconButton onClick={() => setIsUploadModalOpen(true)} title="Attach file or more options" className="flex-shrink-0">
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
            g-transparent outline-none py-2 px-2 text-slate-800 dark:text-slate-100 placeholder-slate-500 max-h-[200px] overflow-y-auto"
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

      {/* 5. Render the modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </>
  )
}
import React, { useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Edit2, Download, Copy, RefreshCcw, Bot, User, Loader2 } from 'lucide-react'
import { Card } from '../ui'
import { format } from 'date-fns';
import TestCasesMessage from '../TestCaseMessage'

export type Message = {
  id: string
  role: 'user' | 'assistant'
  text: string
  createdAt: string
  testcases?: any[]; // Add this optional property
}

export default function ChatPanel({
  conversationTitle,
  messages,
  isLoading,
  isAgentThinking,
}: {
  conversationTitle: string
  messages: Message[];
  isLoading: boolean;
  isAgentThinking: boolean;
}) {
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAgentThinking])

  

  return (
    <div className="absolute inset-0 flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
        <div className="font-semibold text-slate-900 dark:text-slate-100">{conversationTitle}</div>
        <div className="flex items-center gap-3 text-slate-500">
          <button title="Rename" className="hover:text-slate-800 dark:hover:text-slate-200"><Edit2 size={16} /></button>
          <button title="Download" className="hover:text-slate-800 dark:hover:text-slate-200"><Download size={16} /></button>
          <button title="Delete" className="hover:text-red-500"><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="flex-1 scrollbar-hide overflow-auto p-6 space-y-6 pb-32">
        {/* --- CHANGE 2: Handle Empty State ---
            - If there are no messages, this shows a welcome message instead of a blank screen.
        */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Loader2 size={48} className="animate-spin mb-4" />
            <h3 className="text-xl font-medium">Loading Messages...</h3>
          </div> 
        ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Bot size={48} className="mb-4" />
                <h3 className="text-xl font-medium">Start the conversation</h3>
                <p className="text-sm">Ask me anything to get started!</p>
            </div>
        ) : (
            <AnimatePresence initial={false} mode="popLayout">
            {messages.map((m) => (
                // --- CHANGE 3: Added `group` class to enable hover tools ---
                <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
                            className={`group flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                {/* --- CHANGE 1: Added AI Avatar --- */}
                {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                        <Bot size={18} className="text-slate-500" />
                    </div>
                )}

                <div className={`max-w-[70%]`}>
                    {m.role === 'assistant' && m.testcases ? (
                        <TestCasesMessage testcases={m.testcases} />
                    ) : (
                        <Card className={`${m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'} p-3 rounded-2xl`}>
                            <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">{m.text}</ReactMarkdown>
                            <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                            <span>{m.createdAt ? format(new Date(m.createdAt), 'p') : ''}</span>
                            {/* These buttons will now appear on hover because of the `group` class on the parent */}
                            <span className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button title="copy"><Copy size={14} /></button>
                                <button title="regenerate"><RefreshCcw size={14} /></button>
                            </span>
                            </div>
                        </Card>
                    )}
                </div>

                {/* --- CHANGE 1: Added User Avatar --- */}
                {m.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-600 dark:bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <User size={18} className="text-white dark:text-slate-600" />
                    </div>
                )}
                </motion.div>
            ))}
            </AnimatePresence>
        )}

        {isAgentThinking && (
            <div className="flex items-start gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <Bot size={18} className="text-slate-500" />
                </div>
                <div className="max-w-[70%]">
                    <Card className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl flex items-center gap-2">
                        <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse delay-0"></span>
                        <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse delay-150"></span>
                        <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse delay-300"></span>
                    </Card>
                </div>
            </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  )
}
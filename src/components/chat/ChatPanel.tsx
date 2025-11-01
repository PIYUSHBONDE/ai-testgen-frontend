// import React, { useRef, useEffect, useState } from 'react'
// import ReactMarkdown from 'react-markdown'
// import { motion, AnimatePresence } from 'framer-motion'
// import { Trash2, Edit2, Download, Copy, RefreshCcw, Bot, User, Loader2 , Check, X, FileText } from 'lucide-react'
// import { Card } from '../ui'
// import { format } from 'date-fns';
// import TestCasesMessage from '../TestCaseMessage'
// import DocumentManager from './DocumentManager';
// import RequirementsManager from './RequirementsManager';

// export type Message = {
//   id: string
//   role: 'user' | 'assistant'
//   text: string
//   createdAt: string
//   testcases?: any[]; // Add this optional property
// }

// export type Conversation = {
//   id: string;
//   title: string;
//   updatedAt: string;
//   // It's good practice for this object to also contain its messages
//   messages?: Message[];
// };

// export default function ChatPanel({
//   conversation,
//   messages,
//   isLoading,
//   isAgentThinking,
//   onRename,
//   userId,
//   refreshKey,
// }: {
//   conversation: Conversation | null;
//   messages: Message[];
//   isLoading: boolean;
//   isAgentThinking: boolean;
//   onRename: (sessionId: string, newTitle: string) => Promise<void>;
//   userId: string;
//   refreshKey: number;
// }) {
//   const [isEditing, setIsEditing] = useState(false);
//   const [tempTitle, setTempTitle] = useState(conversation?.title || '');
//   const endRef = useRef<HTMLDivElement | null>(null);
//   const [isDocManagerOpen, setIsDocManagerOpen] = useState(false);
//   const [isReqManagerOpen, setIsReqManagerOpen] = useState(false); // ← ADD THIS
//   const [showJiraModal, setShowJiraModal] = useState(false); // ← ADD THIS


//   useEffect(() => {
//     endRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }, [messages, isAgentThinking])

//   useEffect(() => {
//     setTempTitle(conversation?.title || '');
//   }, [conversation]);

//   const handleSaveRename = () => {
//     if (conversation && tempTitle.trim() && tempTitle !== conversation.title) {
//       onRename(conversation.id, tempTitle.trim());
//     }
//     setIsEditing(false);
//   };

//   const handleCancelRename = () => {
//     setTempTitle(conversation?.title || '');
//     setIsEditing(false);
//   };
  

//   return (
//     <div className="absolute inset-0 flex flex-col h-full">
//       <div className="flex items-center justify-between gap-2 px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
//         {isEditing ? (
//           <>
//             <input
//               value={tempTitle}
//               onChange={(e) => setTempTitle(e.target.value)}
//               onKeyDown={(e) => { 
//                 if (e.key === 'Enter') handleSaveRename(); 
//                 if (e.key === 'Escape') handleCancelRename(); 
//               }}
//               className="flex-1 bg-transparent rounded-md p-1 -m-1 font-semibold text-slate-900 dark:text-slate-100 outline-none ring-2 ring-emerald-500"
//               autoFocus
//             />
//             <Check onClick={handleSaveRename} className="w-5 h-5 cursor-pointer text-emerald-600" />
//             <X onClick={handleCancelRename} className="w-5 h-5 cursor-pointer text-slate-500" />
//           </>
//         ) : (
//           <>
//             <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex-1">
//               {conversation?.title}
//             </h1>

//             {/* ✅ ADD REQUIREMENTS BUTTON HERE */}
//             {conversation && (
//               <button
//                 onClick={() => setIsReqManagerOpen(true)}
//                 className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
//                 title="Manage Requirements"
//               >
//                 <FileText size={16} />
//                 Requirements
//               </button>
//             )}
            
//             {/* Documents Button */}
//             {conversation && (<button
//               onClick={() => setIsDocManagerOpen(true)}
//               className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors text-sm font-medium"
//               title="Manage Documents"
//             >
//               📚 Documents
//             </button>
//           )}
            
//             {conversation && (<button 
//               onClick={() => setIsEditing(true)} 
//               title="Rename" 
//               className="hover:text-slate-800 dark:hover:text-slate-200"
//             >
//               <Edit2 className="w-4 h-4" />
//             </button>)}
//           </>
//         )}
//       </div>

//       <div className="flex-1 scrollbar-hide overflow-auto p-6 space-y-6 pb-32">
//         {/* --- CHANGE 2: Handle Empty State ---
//             - If there are no messages, this shows a welcome message instead of a blank screen.
//         */}
//         {isLoading ? (
//           <div className="flex flex-col items-center justify-center h-full text-slate-500">
//             <Loader2 size={48} className="animate-spin mb-4" />
//             <h3 className="text-xl font-medium">Loading Messages...</h3>
//           </div> 
//         ) : messages.length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-full text-slate-500">
//                 <Bot size={48} className="mb-4" />
//                 <h3 className="text-xl font-medium">Start the conversation</h3>
//                 <p className="text-sm">Ask me anything to get started!</p>
//             </div>
//         ) : (
//             <AnimatePresence initial={false} mode="popLayout">
//             {messages.map((m) => (
//                 // --- CHANGE 3: Added `group` class to enable hover tools ---
//                 <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
//                             className={`group flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                
//                 {/* --- CHANGE 1: Added AI Avatar --- */}
//                 {m.role === 'assistant' && (
//                     <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
//                         <Bot size={18} className="text-slate-500" />
//                     </div>
//                 )}

//                 <div className={`max-w-[70%]`}>
//                   {m.role === 'assistant' ? (
//                     // --- ASSISTANT MESSAGE ---
//                     <div className="flex flex-col gap-2">
                      
//                       {/* 1. Render the text (summary) if it exists */}
//                       {m.text && (
//                         <Card className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 rounded-2xl">
//                           <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">{m.text}</ReactMarkdown>
//                           <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
//                             <span>{m.createdAt ? format(new Date(m.createdAt), 'p') : ''}</span>
//                             <span className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                               <button title="copy"><Copy size={14} /></button>
//                               <button title="regenerate"><RefreshCcw size={14} /></button>
//                             </span>
//                           </div>
//                         </Card>
//                       )}

//                       {/* 2. Render test cases if they exist */}
//                       {m.testcases && m.testcases.length > 0 && (
//                         <TestCasesMessage testcases={m.testcases} />
//                       )}
//                     </div>
//                   ) : (
//                     // --- USER MESSAGE (Unchanged) ---
//                     <Card className="bg-emerald-600 text-white p-3 rounded-2xl">
//                       <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">{m.text}</ReactMarkdown>
//                       <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
//                         <span>{m.createdAt ? format(new Date(m.createdAt), 'p') : ''}</span>
//                         <span className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                           <button title="copy"><Copy size={14} /></button>
//                         </span>
//                       </div>
//                     </Card>
//                   )}
//                 </div>

//                 {/* --- CHANGE 1: Added User Avatar --- */}
//                 {m.role === 'user' && (
//                     <div className="w-8 h-8 rounded-full bg-slate-600 dark:bg-slate-200 flex items-center justify-center flex-shrink-0">
//                         <User size={18} className="text-white dark:text-slate-600" />
//                     </div>
//                 )}
//                 </motion.div>
//             ))}
//             </AnimatePresence>
//         )}

//         {isAgentThinking && (
//             <div className="flex items-start gap-3 justify-start">
//                 <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
//                     <Bot size={18} className="text-slate-500" />
//                 </div>
//                 <div className="max-w-[70%]">
//                     <Card className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl flex items-center gap-2">
//                         <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse delay-0"></span>
//                         <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse delay-150"></span>
//                         <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse delay-300"></span>
//                     </Card>
//                 </div>
//             </div>
//         )}

//         <div ref={endRef} />
//       </div>

//       {/* ✅ ADD REQUIREMENTS MANAGER MODAL */}
//       <RequirementsManager
//         sessionId={conversation?.id || null}
//         userId={userId}
//         isOpen={isReqManagerOpen}
//         onClose={() => setIsReqManagerOpen(false)}  
//       />

//       <DocumentManager
//         sessionId={conversation?.id || null}
//         userId={userId}
//         isOpen={isDocManagerOpen}
//         onClose={() => setIsDocManagerOpen(false)}
//         refreshKey={refreshKey}
//       />

//     </div>
//   )
// }


import React, { useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Edit2, Download, Copy, RefreshCcw, Bot, User, Loader2 , Check, X, FileText } from 'lucide-react'
import { Card } from '../ui'
import { format } from 'date-fns';
import TestCasesMessage from '../TestCaseMessage'
import DocumentManager from './DocumentManager';
import RequirementsManager from './RequirementsManager';

export type Message = {
  id: string
  role: 'user' | 'assistant'
  text: string
  createdAt: string
  testcases?: any[]; // Add this optional property
}

export type Conversation = {
  id: string;
  title: string;
  updatedAt: string;
  // It's good practice for this object to also contain its messages
  messages?: Message[];
};

export default function ChatPanel({
  conversation,
  messages,
  isLoading,
  isAgentThinking,
  onRename,
  userId,
  refreshKey,
}: {
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isAgentThinking: boolean;
  onRename: (sessionId: string, newTitle: string) => Promise<void>;
  userId: string;
  refreshKey: number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(conversation?.title || '');
  const endRef = useRef<HTMLDivElement | null>(null);
  const [isDocManagerOpen, setIsDocManagerOpen] = useState(false);
  const [isReqManagerOpen, setIsReqManagerOpen] = useState(false); 
  const [showJiraModal, setShowJiraModal] = useState(false); 


  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAgentThinking])

  useEffect(() => {
    setTempTitle(conversation?.title || '');
  }, [conversation]);

  const handleSaveRename = () => {
    if (conversation && tempTitle.trim() && tempTitle !== conversation.title) {
      onRename(conversation.id, tempTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelRename = () => {
    setTempTitle(conversation?.title || '');
    setIsEditing(false);
  };
  

  return (
    <div className="absolute inset-0 flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        {isEditing ? (
          <>
            <input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onKeyDown={(e) => { 
                if (e.key === 'Enter') handleSaveRename(); 
                if (e.key === 'Escape') handleCancelRename(); 
              }}
              className="flex-1 bg-transparent rounded-md p-1 -m-1 font-semibold text-slate-900 dark:text-slate-100 outline-none ring-2 ring-emerald-500"
              autoFocus
            />
            <Check onClick={handleSaveRename} className="w-5 h-5 cursor-pointer text-emerald-600" />
            <X onClick={handleCancelRename} className="w-5 h-5 cursor-pointer text-slate-500" />
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex-1">
              {conversation?.title}
            </h1>

            {conversation && (
              <button
                onClick={() => setIsReqManagerOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
                title="Manage Requirements"
              >
                <FileText size={16} />
                Requirements
              </button>
            )}
            
            {conversation && (<button
              onClick={() => setIsDocManagerOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors text-sm font-medium"
              title="Manage Documents"
            >
              📚 Documents
            </button>
          )}
            
            {conversation && (<button 
              onClick={() => setIsEditing(true)} 
              title="Rename" 
              className="hover:text-slate-800 dark:hover:text-slate-200"
            >
              <Edit2 className="w-4 h-4" />
            </button>)}
          </>
        )}
      </div>

      <div className="flex-1 scrollbar-hide overflow-auto p-6 space-y-6 pb-32">
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
                <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
                            className={`group flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                        <Bot size={18} className="text-slate-500" />
                    </div>
                )}

                <div className={`max-w-[70%]`}>
                  {m.role === 'assistant' ? (
                    // --- 💡 CHANGED: This is now ONE card ---
                    <Card className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-md rounded-2xl p-4 space-y-4 transition-all duration-300">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-base">
                        🤖 AI Response
                      </span>
                    </div>

                    {/* Summary Text */}
                    {m.text && (
                      <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                        {m.text}
                      </ReactMarkdown>
                    )}

                    {/* Test Case Section */}
                    {m.testcases && m.testcases.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-inner">

                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            📦 Generated Test Cases
                          </span>

                          <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium px-2 py-1 rounded-lg">
                            {m.testcases.length} cases
                          </span>
                        </div>

                        <div className="h-px bg-slate-200 dark:bg-slate-700 mb-3" />

                        <TestCasesMessage testcases={m.testcases} userId={userId} />
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
                      <span>{m.createdAt ? format(new Date(m.createdAt), 'p') : ''}</span>

                      <span className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button title="Copy"><Copy size={14}/></button>
                        <button title="Regenerate"><RefreshCcw size={14}/></button>
                      </span>
                    </div>
                  </Card>

                    // --- END OF CHANGE ---
                  ) : (
                    // --- USER MESSAGE (Unchanged) --
                  <div className="flex flex-col items-end">
                    <div className="
                      bg-gradient-to-r from-emerald-500 to-emerald-600
                      text-white 
                      px-4 py-3 rounded-2xl shadow-lg
                      border border-white/10
                      backdrop-blur-md
                      max-w-xl
                      animate-chat-pop
                    ">
                      <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                        {m.text}
                      </ReactMarkdown>
                    </div>

                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span>{m.createdAt ? format(new Date(m.createdAt), 'p') : ''}</span>
                      <button title="Copy" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  )}
                </div>

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

      <RequirementsManager
        sessionId={conversation?.id || null}
        userId={userId}
        isOpen={isReqManagerOpen}
        onClose={() => setIsReqManagerOpen(false)}  
      />

      <DocumentManager
        sessionId={conversation?.id || null}
        userId={userId}
        isOpen={isDocManagerOpen}
        onClose={() => setIsDocManagerOpen(false)}
        refreshKey={refreshKey}
      />

    </div>
  )
}
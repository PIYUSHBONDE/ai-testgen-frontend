import React, { useState, useEffect  } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, ChevronsLeft, ChevronsRight, Sun, ChevronDown, Bot, ShieldCheck, Loader2, LogOut, User, Settings, Link as LinkIcon, CheckCircle, XCircle  } from 'lucide-react';
import { Button, IconButton } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ToastProvider';
import { formatRelative } from 'date-fns';
import { checkJiraConnectionStatus, initiateJiraOAuth, disconnectJira } from '../../api';


// Types remain the same
export type Conversation = {
  id: string;
  title: string;
  updatedAt: string;
};

// A helper to map project titles to icons
const projectIcons: { [key: string]: React.ReactNode } = {
    'My Projects': <Bot size={20} />,
    'Compliance': <ShieldCheck size={20} />,
    // Add more mappings here as needed
  };

export default function Sidebar({
  conversations,
  isLoading,
  collapsed,
  onToggle,
  onSelectConversation,
  onNewConversation,
  selectedConversationId,
}: {
  conversations: Conversation[];
  collapsed: boolean;
  isLoading: boolean;
  onToggle: () => void;
  onSelectConversation: (c: Conversation) => void;
  onNewConversation: () => void;
  selectedConversationId?: string | null;
}) {
  const { logout, user } = useAuth();
  const { addToast } = useToast();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [jiraConnected, setJiraConnected] = useState(false);
  const [checkingJira, setCheckingJira] = useState(false);

  useEffect(() => {
    checkConnection();
  }, [user]);

  const checkConnection = async () => {
    if (!user?.uid) return;
    
    setCheckingJira(true);
    try {
      const data = await checkJiraConnectionStatus(user.uid);
      setJiraConnected(data.connected);
    } catch (err) {
      console.error('Failed to check Jira status:', err);
    } finally {
      setCheckingJira(false);
    }
  };

  const handleConnectJira = async () => {
    if (!user?.uid) return;
    
    try {
      const data = await initiateJiraOAuth(user.uid);
      // Redirect to Jira OAuth
      window.location.href = data.authorization_url;
    } catch (err) {
      addToast({ 
        title: 'Connection failed', 
        description: 'Could not connect to Jira', 
        type: 'error' 
      });
    }
  };

  const handleDisconnectJira = async () => {
    if (!user?.uid) return;
    
    try {
      await disconnectJira(user.uid);
      setJiraConnected(false);
      addToast({ 
        title: 'Disconnected', 
        description: 'Jira integration disconnected', 
        type: 'info' 
      });
      setShowProfileMenu(false);
    } catch (err) {
      addToast({ 
        title: 'Disconnect failed', 
        type: 'error' 
      });
    }
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.2 }}
        className="relative flex flex-col bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 h-full z-20"
      >
        <IconButton 
          onClick={onToggle} 
          title={collapsed ? 'Open sidebar' : 'Collapse sidebar'} 
          className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 z-30 bg-white dark:bg-slate-800 border dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </IconButton>

        <div className="p-4 flex items-center h-20">
          <div className={`flex items-center gap-3 overflow-hidden`}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">HC</div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">HealthCase AI</div>
              </div>
            )}
          </div>
        </div>
        
        {/* --- CHANGE: Fixed Profile Section Alignment ---
            - The main content area is now wrapped in a single container with `flex-1`.
            - This makes it expand to fill all available vertical space.
            - This correctly pushes the profile section (which comes after this div) to the very bottom of the sidebar.
        */}
        <div className="flex-1 scrollbar-hide flex flex-col overflow-hidden">
            {!collapsed ? (
                // Expanded View
                <div className="flex-1 flex flex-col overflow-y-auto">
                    <div className="px-3">
                        <Button onClick={onNewConversation} className="w-full flex items-center justify-center gap-2 bg-emerald-600">
                            <Plus size={16} />
                            <span className="text-sm font-semibold">New Chat</span>
                        </Button>
                        <div className="relative mt-3">
                            <input className="w-full rounded-lg p-2 pl-9 border border-slate-200 dark:border-slate-700 bg-transparent text-sm" placeholder="Search..." />
                            <div className="absolute left-3 top-2.5 text-slate-400"><Search size={16} /></div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-3 mt-4 space-y-2">
                        {/* {projects.map((p) => (
                            <details key={p.id} open className="group">
                                <summary className="cursor-pointer list-none py-2 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                                <span>{p.title}</span>
                                <ChevronDown className="group-open:rotate-180 transition-transform duration-200" size={14} />
                                </summary>
                                <div className="mt-1 space-y-1">
                                {p.conversations.map((c) => (
                                    <div 
                                    key={c.id} 
                                    onClick={() => onSelectConversation(c)} 
                                    className={`px-2 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${selectedConversationId === c.id ? 'bg-emerald-100 dark:bg-emerald-900/50' : ''}`}
                                    >
                                    <div className="text-sm font-medium truncate text-slate-800 dark:text-slate-200">{c.title}</div>
                                    <div className="text-xs text-slate-400 mt-1">{c.updatedAt}</div>
                                    </div>
                                ))}
                                </div>
                            </details>
                        ))} */}
                        {isLoading ? (
                          <div className="flex justify-center items-center h-full">
                            <Loader2 className="animate-spin text-slate-400" />
                          </div>
                        ) : (
                          conversations.map((c) => (
                            <div 
                              key={c.id} 
                              onClick={() => onSelectConversation(c)} 
                              className={`px-2 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${selectedConversationId === c.id ? 'bg-emerald-100 dark:bg-emerald-900/50' : ''}`}
                            >
                              <div className="text-sm font-medium truncate text-slate-800 dark:text-slate-200">{c.title}</div>
                              <div className="text-xs text-slate-400 mt-1 capitalize">
                                {c.updatedAt ? formatRelative(new Date(c.updatedAt), new Date()) : ''}
                              </div>
                            </div>
                          ))
                        )}
                    </div>
                </div>
            ) : (
                // Collapsed View
                <div className="h-full flex flex-col items-center justify-center gap-4">
                    {/* {projects.map(p => (
                        <IconButton key={p.id} onClick={onToggle} title={`Expand to see ${p.title}`}>
                            {projectIcons[p.title] || p.title[0]}
                        </IconButton>
                    ))} */}
                    {conversations.slice(0, 5).map(c => ( // Show first 5
                        <IconButton key={c.id} onClick={onToggle} title={c.title}>
                            {c.title[0]}
                        </IconButton>
                    ))}
                </div>
            )}
        </div>

        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center">
              <button onClick={() => setShowProfileMenu(s => !s)} className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700/40 flex items-center justify-center flex-shrink-0">{user?.displayName?.[0] || 'U'}</button>
              {!collapsed && (
                <div className="min-w-0 ml-3 mr-auto">
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.displayName || user?.email}</div>
                  <div className="text-xs text-slate-500">Member</div>
                </div>
              )}
              {!collapsed && (
                <IconButton onClick={() => addToast({ title: 'Theme toggled (placeholder)', type: 'info' })}>
                  <Sun size={16} />
                </IconButton>
              )}
            </div>
        </div>
      </motion.aside>

      {/* --- REPLACED: The old centered modal is gone, replaced by this animated popover --- */}
      <AnimatePresence>
        {showProfileMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.1 }}
            // This positions the menu right above the profile button.
            className="absolute bottom-20 left-3 z-50 w-60 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700"
          >
            <div className="p-2">
              <div className="px-2 py-1 mb-1">
                <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">{user?.displayName || user?.email}</div>
                <div className="text-xs text-slate-500">Member</div>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
              <button className="w-full flex items-center gap-3 px-2 py-2 text-sm rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                <User size={16} />
                <span>Profile</span>
              </button>
              <button className="w-full flex items-center gap-3 px-2 py-2 text-sm rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                <Settings size={16} />
                <span>Settings</span>
              </button>
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />

              {/* Jira Integration Section */}
              <div className="px-2 py-1">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Integrations</div>
                
                {checkingJira ? (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Checking...</span>
                  </div>
                ) : jiraConnected ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500">
                      <CheckCircle size={16} />
                      <span>Jira Connected</span>
                    </div>
                    <button 
                      onClick={handleDisconnectJira}
                      className="w-full text-left px-2 py-1.5 text-xs rounded-md text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Disconnect Jira
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleConnectJira}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <LinkIcon size={16} />
                    <span>Connect to Jira</span>
                  </button>
                )}
              </div>
              
              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />

              <button 
                onClick={async () => {
                  try { 
                    await logout(); 
                    addToast({ title: 'Signed out', type: 'info' });
                    setShowProfileMenu(false);
                  } catch (e) { 
                    const err: any = e; 
                    addToast({ title: 'Sign out failed', description: err?.message || String(err), type: 'error' });
                  } 
                }} 
                className="w-full flex items-center gap-3 px-2 py-2 text-sm rounded-md text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
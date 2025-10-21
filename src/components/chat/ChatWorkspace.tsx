import React, { useState, useEffect, useMemo } from 'react'
import Sidebar, { Project, Conversation } from './Sidebar'
import ChatPanel, { Message } from './ChatPanel'
import MessageInput from './MessageInput'
import { useAuth } from '../../context/AuthContext'
import { fetchSessions, createNewSession, sendMessage, fetchMessages} from '../../api';

// const mockProjects: Project[] = [
//   {
//     id: 'p1',
//     title: 'My Projects',
//     conversations: [
//       { id: 'c1', title: 'Session 1', updatedAt: 'Today' },
//       { id: 'c2', title: 'Session 2', updatedAt: 'Yesterday' },
//     ],
//   },
//   {
//     id: 'p2',
//     title: 'Compliance',
//     conversations: [{ id: 'c3', title: 'Compliance Review', updatedAt: '2d' }],
//   },
// ]

const sampleTestCases = [
  {
    id: 'TC-001',
    title: 'User Login with Valid Credentials',
    preconditions: ['User has a valid account.', 'User is on the login page.'],
    steps: ['Enter valid email.', 'Enter valid password.', 'Click "Sign In" button.'],
    expected: 'User is successfully logged in and redirected to the dashboard.',
    risk: 'Low',
  },
  {
    id: 'TC-002',
    title: 'User Login with Invalid Password',
    preconditions: ['User has a valid account.', 'User is on the login page.'],
    steps: ['Enter valid email.', 'Enter an invalid password.', 'Click "Sign In" button.'],
    expected: 'An error message "Incorrect password" is displayed.',
    risk: 'Medium',
  },
];

const initialMessages: Message[] = [
  { 
    id: 'm1', 
    role: 'assistant', 
    text: 'Here are the test cases you requested.', 
    createdAt: '10:00',
    testcases: sampleTestCases 
  },
]

export default function ChatWorkspace() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false)

  // const [projects] = useState(mockProjects)
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isAgentThinking, setIsAgentThinking] = useState(false);


  useEffect(() => {
    if (user?.uid) {
      setIsLoadingConversations(true);
      fetchSessions(user.uid)
        .then(sessions => {
          setConversations(sessions);
        })
        .catch(err => console.error("Failed to fetch sessions:", err))
        .finally(() => setIsLoadingConversations(false));
    }
  }, [user]);

  // Create a new conversation and add it to the state
  const handleNewConversation = async () => {
    if (!user?.uid) return;

    try {
      const newSessionData = await createNewSession(user.uid);
      
      const newConversation: Conversation = { 
        id: newSessionData.session_id, 
        title: newSessionData.title, 
        updatedAt: new Date().toISOString(),  
      };

      // Add the new conversation to the top of the list
      setConversations(prev => [newConversation, ...prev]);
      // Select it and clear messages
      setSelectedConversationId(newConversation.id);
      setMessages([]);
      
    } catch (error) {
      console.error("Failed to create new session:", error);
    }
  };

  const handleSelectConversation = (c: Conversation) => {
    if (!user?.uid) return;
    
    setSelectedConversationId(c.id);
    setIsLoadingMessages(true);
    setMessages([]);

    fetchMessages(user.uid, c.id)
      .then(fetchedMessages => {
        setMessages(fetchedMessages);
      })
      .catch(err => {
        console.error("Failed to fetch messages for session:", c.id, err);
      })
      .finally(() => {
        setIsLoadingMessages(false);
      });
  };

  // --- UPDATED: Sends a message to the backend and receives the AI response ---
  const handleSend = async (text: string) => {
    if (!user?.uid || !selectedConversationId) return;

    const userMsg: Message = { id: `u${Date.now()}`, role: 'user', text, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setIsAgentThinking(true);

    try {
      const aiResponse = await sendMessage(user.uid, selectedConversationId, text);
      const aiMsg: Message = { id: `a${Date.now()}`, role: 'assistant', text: aiResponse.text, createdAt: new Date().toISOString() };
      setMessages(prev => [...prev, aiMsg]);

      // Update the conversation's timestamp and move it to the top of the list
      setConversations(prev => {
        const currentConv = prev.find(conv => conv.id === selectedConversationId);
        if (!currentConv) return prev;
        const otherConvs = prev.filter(conv => conv.id !== selectedConversationId);
        return [{ ...currentConv, updatedAt: new Date().toISOString() }, ...otherConvs];
      });

    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMsg: Message = { id: `e${Date.now()}`, role: 'assistant', text: 'Sorry, I encountered an error. Please try again.', createdAt: new Date().toISOString() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAgentThinking(false);
    }
  };

  // Derive active conversation from the flat list
  const activeConversation = useMemo(() => {
    if (!selectedConversationId) return null;
    return conversations.find(c => c.id === selectedConversationId) || null;
  }, [conversations, selectedConversationId]);

  // if (isLoading) {
  //     return <div>Loading conversations...</div>
  // }

  return (
    <div className="flex h-screen bg-transparent text-slate-900 dark:text-slate-100">
      <Sidebar 
        conversations={conversations} // Pass the flat `conversations` array
        isLoading={isLoadingConversations}
        collapsed={collapsed} 
        onToggle={() => setCollapsed(s => !s)} 
        onSelectConversation={handleSelectConversation} 
        onNewConversation={handleNewConversation} 
        selectedConversationId={selectedConversationId} 
      />

      <div className="flex-1 relative">
        <ChatPanel 
          conversationTitle={activeConversation?.title || 'Select or start a new conversation'}
          messages={messages} 
          isLoading={isLoadingMessages}
          isAgentThinking={isAgentThinking}
        />
        <MessageInput 
          onSend={handleSend}
          disabled={isAgentThinking || isLoadingMessages || !selectedConversationId}
          sessionId={selectedConversationId} 
        />
      </div>
    </div>
  )
}

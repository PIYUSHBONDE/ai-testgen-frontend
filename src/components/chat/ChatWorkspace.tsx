import React, { useState, useEffect, useMemo } from 'react'
import Sidebar, { Project, Conversation } from './Sidebar'
import ChatPanel, { Message } from './ChatPanel'
import MessageInput from './MessageInput'
import { useAuth } from '../../context/AuthContext'
import { fetchSessions, createNewSession, sendMessage, fetchMessages, renameConversation} from '../../api';

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


  // Define interfaces for your data structure
interface Testcase {
  // Add your testcase properties based on your actual data
  testcase_id?: string;
  title?: string;
  // ... other testcase properties
}

interface AggregatedTestcase {
  testcase_id: string;
  testcases: Testcase[];
  'Testcase Title'?: string;
  compliance_ids?: string[];
}

interface ConversationContent {
  aggregated_testcases: AggregatedTestcase[];
}

interface ConversationEntry {
  id: number;
  session_id: string;
  user_id: string;
  app_name: string;
  role: 'user' | 'assistant';
  text: string;
  content: ConversationContent;
  created_at: string;
}

interface FilteredConversation {
  createdAt: string;
  text: string;
  role: 'user' | 'assistant';
  testcases: Testcase[];
}



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
  const [docRefreshKey, setDocRefreshKey] = useState(0);


// Filter function
const fetchAndTransformData = (conversationHistory) => {
      try {
        
        const filtered = conversationHistory.map((entry: any) => {
          const aggregatedTestcases = entry.content?.aggregated_testcases || [];
          
          const testcases = aggregatedTestcases
            .filter((tc: any) => tc.testcases && tc.testcases.length > 0)
            .map((tc: any) => ({
              id: tc.testcase_id,
              title: tc['Testcase Title'],
              regulatory_refs: tc.compliance_ids || [],
              stepDetails: tc.testcases.map((testcase: string[]) => ({
                step: testcase[1] || '',
                expected: testcase[2] || '',
              })),
              preconditions: [],
              rationale: '',
              risk: '',
            }));
          
          return {
            createdAt: entry.created_at,
            text: entry.content.text,
            role: entry.content.role,
            testcases: testcases,
          };
        });

        return filtered;
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

// Usage example



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
        const filteredHistory = fetchAndTransformData(fetchedMessages.conversation_history);
        setMessages(filteredHistory);
        // console.log("Fetched Messages: ", fetchedMessages.conversation_history);
        // console.log("Filtered Messages: ", filteredHistory);
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
    if (!user?.uid) return;

    let currentSessionId = selectedConversationId;

    if (!currentSessionId) {
      try {
        // Auto-create session
        const newSessionData = await createNewSession(user.uid);
        currentSessionId = newSessionData.session_id;

        const newConversation: Conversation = { 
          id: newSessionData.session_id, 
          title: newSessionData.title, 
          updatedAt: new Date().toISOString(),  
        };

        // Update State
        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversationId(currentSessionId);
      } catch (error) {
        console.error("Failed to auto-create session:", error);
        return; // Stop execution if creation fails
      }
    }

    const userMsg: Message = { id: `u${Date.now()}`, role: 'user', text, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setIsAgentThinking(true);

    try {
      const aiResponse = await sendMessage(user.uid, currentSessionId, text);

      // --- THIS IS THE UPDATED TRANSFORMATION LOGIC ---
      let transformedTestCases: any[] | undefined = undefined;

      if (aiResponse.aggregated_testcases && Array.isArray(aiResponse.aggregated_testcases)) {
        
        

        transformedTestCases = aiResponse.aggregated_testcases
            .filter((tc: any) => tc.testcases && tc.testcases.length > 0).map((suite: any) => {
          
          // NEW: Create an array of {step, expected} objects
          const stepDetails: { step: string, expected: string }[] = [];
          if (Array.isArray(suite.testcases)) {
            suite.testcases.forEach((tc: any) => {
              // tc[0] is number, tc[1] is step, tc[2] is expected
              if (Array.isArray(tc) && tc.length >= 2) { 
                stepDetails.push({
                  step: tc[1] || '', // Step Description
                  expected: tc[2] || '', // Expected Result
                });
              }
            });
          }
          // --- END NEW LOGIC ---

          // Map to the format TestCaseCard now expects
          return {
            id: suite.testcase_id || `tc-${Math.random()}`,
            title: suite['Testcase Title'] || 'Untitled Test Case',
            preconditions: suite.preconditions || [], // Not in new data, default
            
            stepDetails: stepDetails, // <--- Pass the new structured array
            
            risk: suite.risk || "", // Not in new data, default
            regulatory_refs: suite.compliance_ids || [], // Map compliance_ids
            rationale: suite.rationale || "", // Not in new data, default
          };
        });
      }
      // --- END OF TRANSFORMATION ---

      // Create the new AI message object
      const aiMsg: Message = { 
        id: `a${Date.now()}`, 
        role: 'assistant', 
        text: aiResponse.text, // This is the 'final_summary'
        createdAt: new Date().toISOString(),
        testcases: transformedTestCases // Pass the transformed data
      };
      
      setMessages(prev => [...prev, aiMsg]);

      // Update the conversation's timestamp and title, and move it to the top
      setConversations(prev => {
        const currentConv = prev.find(conv => conv.id === currentSessionId);
        if (!currentConv) return prev;

        const updatedConv = { 
          ...currentConv, 
          title: aiResponse.updated_title || currentConv.title, 
          updatedAt: new Date().toISOString() 
        };

        const otherConvs = prev.filter(conv => conv.id !== currentSessionId);
        return [updatedConv, ...otherConvs];
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

  const handleRenameConversation = async (sessionId: string, newTitle: string) => {
    try {
      await renameConversation(user.uid, sessionId, newTitle);
      // Update the title in the local state to instantly reflect the change
      setConversations(prev =>
        prev.map(conv =>
          conv.id === sessionId ? { ...conv, title: newTitle } : conv
        )
      );
    } catch (error) {
      console.error("Failed to rename conversation:", error);
      // Optionally show an error toast
    }
  };

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
          conversation={activeConversation}
          messages={messages} 
          isLoading={isLoadingMessages}
          isAgentThinking={isAgentThinking}
          onRename={handleRenameConversation}
          userId={user?.uid || ''}
          refreshKey={docRefreshKey}
        />
        <MessageInput 
          onSend={handleSend}
          disabled={isAgentThinking || isLoadingMessages}
          sessionId={selectedConversationId} 
          onUploadComplete={() => setDocRefreshKey(k => k + 1)}
        />
      </div>
    </div>
  )
}

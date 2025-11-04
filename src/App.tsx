import React, { useState, useCallback, useEffect } from 'react';
import { VibeEntry, ChatMessage, AIMode } from './types';
import FileTree from './components/FileTree';
import Editor from './components/Editor';
import ChatPanel from './components/ChatPanel';
import { runChat, analyzeCode, refactorCodeWithThinking, scaffoldProject } from './services/geminiService';
import { Chat } from '@google/genai';
import ScaffoldModal from './components/ScaffoldModal';

const initialFiles: VibeEntry[] = [
  {
    id: 'welcome.js',
    name: 'welcome.js',
    content: `// Welcome to Vibe Code!
// Use the AI tools in the editor header to analyze or refactor your code.
// Ask the Vibe Bot anything in the chat panel on the right.
// You can now create folders and upload images!

function greet(name) {
  console.log(\`Hello, \${name}! Let's start coding.\`);
}

greet('Developer');
`,
    language: 'javascript',
    type: 'file',
  },
  {
    id: 'README.md',
    name: 'README.md',
    content: `# Vibe Code

This is a demo of an AI-powered code editor.

**Features:**

*   AI Scaffolding (try the "Scaffold with AI" button!)
*   File and Folder Management
*   Code Editor
*   Live Markdown Preview
*   AI Chat Bot
*   AI Code Analysis & Refactoring

Try opening this file and clicking the **Preview** icon (the eye) in the editor header!
`,
    language: 'markdown',
    type: 'file',
  },
  {
    id: 'assets',
    name: 'assets',
    type: 'folder',
  }
];

const App: React.FC = () => {
  const [entries, setEntries] = useState<VibeEntry[]>(initialFiles);
  const [activeId, setActiveId] = useState<string | null>('welcome.js');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [isScaffoldModalOpen, setIsScaffoldModalOpen] = useState(false);

  useEffect(() => {
    setChatHistory([
      { role: 'model', content: "Hey! I'm Vibe Bot. Ask me anything about your code or general questions." }
    ]);
  }, []);

  const handleSelect = (id: string) => {
    setActiveId(id);
  };

  const handleContentChange = (newContent: string) => {
    if (activeId) {
      setEntries(entries.map(f => f.id === activeId ? { ...f, content: newContent } : f));
    }
  };

  const handleCreateEntry = (path: string, type: 'file' | 'folder') => {
    if (entries.some(e => e.id === path)) {
      alert(`An entry with the path "${path}" already exists.`);
      return;
    }

    const name = path.split('/').pop() || '';
    let newEntry: VibeEntry;

    if (type === 'file') {
      newEntry = {
        id: path,
        name: name,
        content: `// New file: ${name}`,
        language: name.split('.').pop() || 'text',
        type: 'file',
      };
    } else { // folder
      newEntry = {
        id: path,
        name: name,
        type: 'folder',
      };
    }

    setEntries(prev => [...prev, newEntry]);
    setActiveId(newEntry.id);
  };

  const handleFileUpload = (file: VibeEntry) => {
     if (!entries.some(f => f.id === file.id)) {
      setEntries([...entries, file]);
      setActiveId(file.id);
     } else {
        if(window.confirm(`File "${file.name}" already exists. Overwrite?`)){
            setEntries(entries.map(f => f.id === file.id ? file : f));
            setActiveId(file.id);
        }
     }
  };

  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessage = { role: 'user', content: message };
    setChatHistory(prev => [...prev, userMessage]);
    setIsAiLoading(true);

    try {
      const { chatInstance, response } = await runChat(chat, message);
      if (!chat) setChat(chatInstance); // Save chat instance for conversation history
      const modelMessage: ChatMessage = { role: 'model', content: response };
      setChatHistory(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I ran into an issue. Please check the console for details." };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };
  
  const handleAiAction = useCallback(async (mode: AIMode, code: string) => {
      setIsAiLoading(true);
      try {
        let result: string;
        if (mode === AIMode.ANALYZE) {
            result = await analyzeCode(code);
        } else if (mode === AIMode.REFACTOR) {
            result = await refactorCodeWithThinking(code);
        } else {
            return;
        }

        const aiResponseFile: VibeEntry = {
            id: `ai-response-${Date.now()}.md`,
            name: `${mode}-response.md`,
            content: `## AI ${mode} Result for ${activeId}\n\n---\n\n${result}`,
            language: 'markdown',
            type: 'file',
        };
        setEntries(prev => [...prev, aiResponseFile]);
        setActiveId(aiResponseFile.id);
      } catch(error) {
         console.error(`AI Action Error (${mode}):`, error);
         alert(`An error occurred during AI ${mode}. Please check the console.`);
      } finally {
        setIsAiLoading(false);
      }
  }, [activeId]);

  const activeEntry = entries.find(f => f.id === activeId) || null;

  return (
    <div className="flex h-screen w-screen bg-white text-gray-900 antialiased">
      <FileTree 
        entries={entries} 
        activeId={activeId} 
        onSelect={handleSelect}
        onNewFile={() => handleCreateEntry(prompt('Enter file name:') || '', 'file')}
        onNewFolder={() => handleCreateEntry(prompt('Enter folder name:') || '', 'folder')}
        onFileUpload={handleFileUpload}
      />
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50">
        <Editor 
            activeEntry={activeEntry}
            onContentChange={handleContentChange}
            onAiAction={handleAiAction}
            isAiLoading={isAiLoading}
        />
      </main>
      <aside className="w-96 border-l border-gray-200 bg-white flex flex-col">
        <ChatPanel 
            messages={chatHistory}
            onSendMessage={handleSendMessage}
            isLoading={isAiLoading}
        />
      </aside>
      {isScaffoldModalOpen && (
        <ScaffoldModal
          onClose={() => setIsScaffoldModalOpen(false)}
          onScaffold={async (prompt) => {
            setIsScaffoldModalOpen(false);
            setIsAiLoading(true);
            try {
              const scaffolded = await scaffoldProject(prompt);
              setEntries(scaffolded);
            } catch (error) {
              console.error('Scaffold error:', error);
              alert('An error occurred during scaffolding. Please check the console.');
            } finally {
              setIsAiLoading(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default App;
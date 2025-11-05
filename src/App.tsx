import React, { useState, useCallback, useEffect } from 'react';
import { VibeEntry, ChatMessage, AIMode } from './types';
import FileTree from './components/FileTree';
import Editor from './components/Editor';
import ChatPanel from './components/ChatPanel';
import ScaffoldModal from './components/ScaffoldModal';
import { runChat, analyzeCode, refactorCodeWithThinking, scaffoldProject } from './services/geminiService';
import { Chat } from '@google/genai';

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
    if (!path || path.trim() === '') return;
    
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
      if (!chat) setChat(chatInstance);
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

  const handleScaffold = async (prompt: string) => {
    setIsScaffoldModalOpen(false);
    setIsAiLoading(true);
    
    try {
      const scaffoldedFiles = await scaffoldProject(prompt);
      
      // Convert scaffolded files to VibeEntry format
      const newEntries: VibeEntry[] = scaffoldedFiles.map(file => {
        const pathParts = file.path.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const extension = fileName.split('.').pop() || 'text';
        
        return {
          id: file.path,
          name: fileName,
          content: file.content,
          language: extension,
          type: 'file' as const,
        };
      });
      
      // Create folder entries for all directories in the paths
      const folderSet = new Set<string>();
      scaffoldedFiles.forEach(file => {
        const pathParts = file.path.split('/');
        pathParts.pop(); // Remove filename
        
        let currentPath = '';
        pathParts.forEach(part => {
          currentPath = currentPath ? `${currentPath}/${part}` : part;
          folderSet.add(currentPath);
        });
      });
      
      const folderEntries: VibeEntry[] = Array.from(folderSet).map(folderPath => ({
        id: folderPath,
        name: folderPath.split('/').pop() || folderPath,
        type: 'folder' as const,
      }));
      
      // Merge with existing entries, avoiding duplicates
      const allNewEntries = [...folderEntries, ...newEntries];
      const existingIds = new Set(entries.map(e => e.id));
      const uniqueNewEntries = allNewEntries.filter(e => !existingIds.has(e.id));
      
      setEntries(prev => [...prev, ...uniqueNewEntries]);
      
      // Set the first new file as active
      if (newEntries.length > 0) {
        setActiveId(newEntries[0].id);
      }
      
      alert(`Successfully created ${newEntries.length} files!`);
    } catch (error) {
      console.error('Scaffold error:', error);
      alert('An error occurred during scaffolding. Please check the console and try again.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const activeEntry = entries.find(f => f.id === activeId) || null;

  return (
    <div className="flex h-screen w-screen bg-white text-gray-900 antialiased">
      <FileTree 
        entries={entries} 
        activeId={activeId} 
        onSelect={handleSelect}
        onNewFile={() => {
          const fileName = prompt('Enter file name:');
          if (fileName) handleCreateEntry(fileName, 'file');
        }}
        onNewFolder={() => {
          const folderName = prompt('Enter folder name:');
          if (folderName) handleCreateEntry(folderName, 'folder');
        }}
        onFileUpload={handleFileUpload}
        onScaffold={() => setIsScaffoldModalOpen(true)}
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
      
      <ScaffoldModal
        isOpen={isScaffoldModalOpen}
        onClose={() => setIsScaffoldModalOpen(false)}
        onScaffold={handleScaffold}
        isLoading={isAiLoading}
      />
    </div>
  );
};

export default App;

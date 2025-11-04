
import React from 'react';
import { VibeFile, AIMode } from '../types';
import SaveIcon from './icons/SaveIcon';
import DownloadIcon from './icons/DownloadIcon';
import SparkleIcon from './icons/SparkleIcon';
import BrainIcon from './icons/BrainIcon';

interface EditorProps {
  activeFile: VibeFile | null;
  onContentChange: (newContent: string) => void;
  onAiAction: (mode: AIMode, code: string) => void;
  isAiLoading: boolean;
}

const Editor: React.FC<EditorProps> = ({ activeFile, onContentChange, onAiAction, isAiLoading }) => {

  const handleDownload = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
     if (!activeFile) return;
     // In a real app, this would save to a backend/localStorage.
     // For now, we can just simulate it with an alert.
     alert(`${activeFile.name} saved! (simulated)`);
  };

  const AiButton: React.FC<{mode: AIMode, icon: React.ReactNode}> = ({mode, icon}) => (
    <button
        onClick={() => activeFile && onAiAction(mode, activeFile.content)}
        disabled={!activeFile || isAiLoading}
        className="flex items-center space-x-2 px-3 py-1.5 bg-gray-600 rounded-md hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors text-sm"
    >
        {icon}
        <span>{isAiLoading ? 'Working...' : mode}</span>
    </button>
  );

  return (
    <div className="flex-1 flex flex-col bg-gray-800">
      {activeFile ? (
        <>
          <header className="flex items-center justify-between p-2 border-b border-gray-700 bg-gray-900/50">
            <div className="text-gray-400">{activeFile.name}</div>
            <div className="flex items-center space-x-2">
               <AiButton mode={AIMode.ANALYZE} icon={<SparkleIcon className="w-4 h-4 text-cyan-300" />} />
               <AiButton mode={AIMode.REFACTOR} icon={<BrainIcon className="w-4 h-4 text-purple-300" />} />
              <button onClick={handleSave} className="p-2 rounded-md hover:bg-gray-600 transition-colors">
                <SaveIcon className="w-5 h-5"/>
              </button>
              <button onClick={handleDownload} className="p-2 rounded-md hover:bg-gray-600 transition-colors">
                <DownloadIcon className="w-5 h-5"/>
              </button>
            </div>
          </header>
          <textarea
            value={activeFile.content}
            onChange={(e) => onContentChange(e.target.value)}
            className="w-full flex-1 p-4 bg-transparent text-gray-200 font-mono resize-none focus:outline-none leading-relaxed"
            spellCheck="false"
          />
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          Select a file to start editing or create a new one.
        </div>
      )}
    </div>
  );
};

export default Editor;

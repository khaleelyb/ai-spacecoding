import React, { useState, useEffect } from 'react';
import { VibeEntry, AIMode } from '../types';
import SaveIcon from './icons/SaveIcon';
import DownloadIcon from './icons/DownloadIcon';
import SparkleIcon from './icons/SparkleIcon';
import BrainIcon from './icons/BrainIcon';
import PreviewIcon from './icons/PreviewIcon';
// Fix: Import FolderIcon component
import FolderIcon from './icons/FolderIcon';

declare const marked: any;
declare const DOMPurify: any;

interface EditorProps {
  activeEntry: VibeEntry | null;
  onContentChange: (newContent: string) => void;
  onAiAction: (mode: AIMode, code: string) => void;
  isAiLoading: boolean;
}

const PREVIEWABLE_LANGUAGES = ['markdown', 'html'];

const Editor: React.FC<EditorProps> = ({ activeEntry, onContentChange, onAiAction, isAiLoading }) => {
  const [showPreview, setShowPreview] = useState(false);
  const isPreviewable = activeEntry?.type === 'file' && PREVIEWABLE_LANGUAGES.includes(activeEntry.language || '');
  
  useEffect(() => {
    // Disable preview if the new file is not previewable
    if (activeEntry && !isPreviewable) {
      setShowPreview(false);
    }
  }, [activeEntry, isPreviewable]);

  const handleDownload = () => {
    if (!activeEntry || activeEntry.type === 'folder' || !activeEntry.content) return;

    if (activeEntry.type === 'image') {
       const a = document.createElement('a');
       a.href = activeEntry.content;
       a.download = activeEntry.name;
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
    } else {
      const blob = new Blob([activeEntry.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeEntry.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleSave = () => {
     if (!activeEntry) return;
     alert(`${activeEntry.name} saved! (simulated)`);
  };

  const AiButton: React.FC<{mode: AIMode, icon: React.ReactNode}> = ({mode, icon}) => (
    <button
        onClick={() => activeEntry?.content && onAiAction(mode, activeEntry.content)}
        disabled={!activeEntry || isAiLoading || activeEntry.type !== 'file'}
        className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all text-sm font-medium border border-blue-200 hover:border-blue-300 disabled:border-gray-200"
    >
        {icon}
        <span>{isAiLoading ? 'Working...' : mode}</span>
    </button>
  );

  const EditorView = () => {
    if (!activeEntry) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50">
          <div className="text-center">
            <p className="text-sm">Select a file to start editing or create a new one.</p>
          </div>
        </div>
      );
    }
    
    if (activeEntry.type === 'folder') {
        return (
             <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50">
                <div className="text-center">
                    <FolderIcon className="w-16 h-16 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm">Folder: <span className="font-semibold text-gray-600">{activeEntry.name}</span></p>
                </div>
            </div>
        )
    }

    if (activeEntry.type === 'image') {
      return (
        <div className="flex-1 p-4 bg-gray-50 flex items-center justify-center overflow-auto">
           <img src={activeEntry.content} alt={activeEntry.name} className="max-w-full max-h-full object-contain shadow-lg rounded-lg border border-gray-200" />
       </div>
      )
    }
    
    // It's a file
    return (
       <div className="flex flex-1 min-h-0">
          <textarea
            value={activeEntry.content}
            onChange={(e) => onContentChange(e.target.value)}
            className="w-full h-full p-6 bg-white text-gray-900 font-mono text-sm resize-none focus:outline-none leading-relaxed"
            spellCheck="false"
          />
          {showPreview && isPreviewable && (
            <div className="w-full h-full border-l border-gray-200 p-6 overflow-y-auto bg-gray-50">
                {activeEntry.language === 'markdown' && (
                    <div 
                        className="prose prose-sm max-w-none prose-p:text-gray-700 prose-headings:text-gray-900 prose-a:text-blue-600 prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(activeEntry.content || '')) }}
                    />
                )}
                 {activeEntry.language === 'html' && (
                    <iframe
                        srcDoc={activeEntry.content}
                        title="HTML Preview"
                        sandbox="allow-scripts"
                        className="w-full h-full bg-white rounded-lg border border-gray-200"
                    />
                )}
            </div>
          )}
       </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white flex-shrink-0 shadow-sm">
        <div className="text-gray-700 text-sm font-medium truncate">{activeEntry?.id || 'No file selected'}</div>
        <div className="flex items-center space-x-1.5">
           <AiButton mode={AIMode.ANALYZE} icon={<SparkleIcon className="w-4 h-4 text-blue-600" />} />
           <AiButton mode={AIMode.REFACTOR} icon={<BrainIcon className="w-4 h-4 text-blue-600" />} />
           
           <div className="h-6 border-l border-gray-200 mx-2"></div>

            <button title="Preview" onClick={() => setShowPreview(!showPreview)} disabled={!isPreviewable} className={`p-2 rounded-lg transition-all ${showPreview ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-600'} disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:bg-transparent`}>
                <PreviewIcon className="w-5 h-5"/>
            </button>
            <button title="Save" onClick={handleSave} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
              <SaveIcon className="w-5 h-5"/>
            </button>
            <button title="Download" onClick={handleDownload} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
              <DownloadIcon className="w-5 h-5"/>
            </button>
        </div>
      </header>
      <EditorView />
    </div>
  );
};

export default Editor;
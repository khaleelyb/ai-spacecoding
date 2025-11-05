import React, { useState, useEffect } from 'react';
import { VibeEntry, AIMode } from '../types';
import SaveIcon from './icons/SaveIcon';
import DownloadIcon from './icons/DownloadIcon';
import SparkleIcon from './icons/SparkleIcon';
import BrainIcon from './icons/BrainIcon';
import PreviewIcon from './icons/PreviewIcon';
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
  const [showActionMenu, setShowActionMenu] = useState(false);
  const isPreviewable = activeEntry?.type === 'file' && PREVIEWABLE_LANGUAGES.includes(activeEntry.language || '');
  
  useEffect(() => {
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

  const handleAiActionClick = (mode: AIMode) => {
    if (activeEntry?.content) {
      onAiAction(mode, activeEntry.content);
      setShowActionMenu(false);
    }
  };

  const EditorView = () => {
    if (!activeEntry) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50 p-4">
          <div className="text-center">
            <p className="text-xs sm:text-sm">Select a file to start editing or create a new one.</p>
          </div>
        </div>
      );
    }
    
    if (activeEntry.type === 'folder') {
        return (
             <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50 p-4">
                <div className="text-center">
                    <FolderIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400" />
                    <p className="mt-2 text-xs sm:text-sm">Folder: <span className="font-semibold text-gray-600">{activeEntry.name}</span></p>
                </div>
            </div>
        )
    }

    if (activeEntry.type === 'image') {
      return (
        <div className="flex-1 p-3 sm:p-4 bg-gray-50 flex items-center justify-center overflow-auto">
           <img src={activeEntry.content} alt={activeEntry.name} className="max-w-full max-h-full object-contain shadow-lg rounded-lg border border-gray-200" />
       </div>
      )
    }
    
    return (
       <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          <textarea
            value={activeEntry.content}
            onChange={(e) => onContentChange(e.target.value)}
            className="w-full h-full p-3 sm:p-4 lg:p-6 bg-white text-gray-900 font-mono text-xs sm:text-sm resize-none focus:outline-none leading-relaxed"
            spellCheck="false"
          />
          {showPreview && isPreviewable && (
            <div className="w-full lg:w-1/2 h-64 lg:h-full border-t lg:border-t-0 lg:border-l border-gray-200 p-3 sm:p-4 lg:p-6 overflow-y-auto bg-gray-50">
                {activeEntry.language === 'markdown' && (
                    <div 
                        className="prose prose-xs sm:prose-sm max-w-none prose-p:text-gray-700 prose-headings:text-gray-900 prose-a:text-blue-600 prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded"
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
      <header className="flex items-center justify-between px-2 sm:px-4 py-2 border-b border-gray-200 bg-white flex-shrink-0 shadow-sm">
        <div className="text-gray-700 text-xs sm:text-sm font-medium truncate flex-1 min-w-0 mr-2">
          {activeEntry?.id || 'No file selected'}
        </div>
        <div className="flex items-center space-x-1">
          {/* Mobile: Action Menu Dropdown */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setShowActionMenu(!showActionMenu)}
              disabled={!activeEntry || isAiLoading || activeEntry.type !== 'file'}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 disabled:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            
            {showActionMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[160px]">
                <button
                  onClick={() => handleAiActionClick(AIMode.ANALYZE)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                >
                  <SparkleIcon className="w-4 h-4 text-blue-600" />
                  <span>Analyze</span>
                </button>
                <button
                  onClick={() => handleAiActionClick(AIMode.REFACTOR)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                >
                  <BrainIcon className="w-4 h-4 text-blue-600" />
                  <span>Refactor</span>
                </button>
              </div>
            )}
          </div>

          {/* Desktop: Inline AI Buttons */}
          <button
            onClick={() => activeEntry?.content && onAiAction(AIMode.ANALYZE, activeEntry.content)}
            disabled={!activeEntry || isAiLoading || activeEntry.type !== 'file'}
            className="hidden sm:flex items-center space-x-1.5 px-2 sm:px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all text-xs sm:text-sm font-medium border border-blue-200 hover:border-blue-300 disabled:border-gray-200"
          >
            <SparkleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
            <span className="hidden md:inline">{isAiLoading ? 'Working...' : AIMode.ANALYZE}</span>
          </button>
          <button
            onClick={() => activeEntry?.content && onAiAction(AIMode.REFACTOR, activeEntry.content)}
            disabled={!activeEntry || isAiLoading || activeEntry.type !== 'file'}
            className="hidden sm:flex items-center space-x-1.5 px-2 sm:px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all text-xs sm:text-sm font-medium border border-blue-200 hover:border-blue-300 disabled:border-gray-200"
          >
            <BrainIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
            <span className="hidden md:inline">{isAiLoading ? 'Working...' : AIMode.REFACTOR}</span>
          </button>
           
          <div className="h-5 border-l border-gray-200 mx-1"></div>

          <button 
            title="Preview" 
            onClick={() => setShowPreview(!showPreview)} 
            disabled={!isPreviewable} 
            className={`p-1.5 sm:p-2 rounded-lg transition-all ${showPreview ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-600'} disabled:text-gray-300 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
          >
            <PreviewIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
          </button>
          <button 
            title="Save" 
            onClick={handleSave} 
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          >
            <SaveIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
          </button>
          <button 
            title="Download" 
            onClick={handleDownload} 
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          >
            <DownloadIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
          </button>
        </div>
      </header>
      <EditorView />
    </div>
  );
};

export default Editor;

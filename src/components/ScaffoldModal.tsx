import React, { useState } from 'react';
import MagicIcon from './icons/MagicIcon';

interface ScaffoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScaffold: (prompt: string) => void;
  isLoading: boolean;
}

const ScaffoldModal: React.FC<ScaffoldModalProps> = ({ isOpen, onClose, onScaffold, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onScaffold(prompt);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-4 sm:p-6 flex flex-col space-y-3 sm:space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <MagicIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Scaffold with AI</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-xs sm:text-sm text-gray-600">
            Describe the component, feature, or files you want to create. The AI will generate the necessary folder structure and code.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-3 sm:space-y-4">
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A login form component with email and password fields, and a submit button."
                className="w-full h-32 sm:h-40 bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                disabled={isLoading}
            />
            <div className="flex flex-col-reverse sm:flex-row justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3">
                <button 
                  type="button" 
                  onClick={onClose} 
                  disabled={isLoading} 
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-medium text-sm"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isLoading || !prompt.trim()} 
                    className="w-full sm:w-auto px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all text-white font-semibold flex items-center justify-center space-x-2 text-sm shadow-md"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Generating...</span>
                        </>
                    ) : (
                        <span>Generate Files</span>
                    )}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ScaffoldModal;

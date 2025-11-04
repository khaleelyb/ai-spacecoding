
import React, { useRef } from 'react';
import { VibeFile } from '../types';
import FileIcon from './icons/FileIcon';
import UploadIcon from './icons/UploadIcon';

interface FileTreeProps {
  files: VibeFile[];
  activeFileId: string | null;
  onFileSelect: (id: string) => void;
  onNewFile: () => void;
  onFileUpload: (file: VibeFile) => void;
}

const FileTree: React.FC<FileTreeProps> = ({ files, activeFileId, onFileSelect, onNewFile, onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const uploadedFile: VibeFile = {
            id: file.name,
            name: file.name,
            content: content,
            language: file.name.split('.').pop() || 'text'
        };
        onFileUpload(uploadedFile);
      };
      reader.readAsText(file);
      event.target.value = ''; // Reset input
    }
  };
  
  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-purple-400">Vibe Code</h1>
      </div>
      <div className="p-2 flex space-x-2">
        <button onClick={onNewFile} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-3 rounded text-sm transition-colors duration-200">
          New File
        </button>
        <button onClick={handleUploadClick} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold p-2 rounded transition-colors duration-200">
           <UploadIcon className="w-5 h-5" />
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      </div>
      <nav className="flex-1 p-2 overflow-y-auto">
        <ul>
          {files.map((file) => (
            <li key={file.id}>
              <button
                onClick={() => onFileSelect(file.id)}
                className={`w-full text-left px-3 py-2 rounded flex items-center space-x-2 transition-colors duration-150 ${
                  activeFileId === file.id
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                <FileIcon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{file.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default FileTree;

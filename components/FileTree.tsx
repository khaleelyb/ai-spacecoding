import React, { useState, useMemo } from 'react';
import { VibeEntry } from '../types';
import { buildTree, TreeNode } from '../utils/tree';
import FileIcon from './icons/FileIcon';
import UploadIcon from './icons/UploadIcon';
import ImageIcon from './icons/ImageIcon';
import FolderIcon from './icons/FolderIcon';
import FolderOpenIcon from './icons/FolderOpenIcon';
import MagicIcon from './icons/MagicIcon';

interface FileTreeProps {
  entries: VibeEntry[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onFileUpload: (file: VibeEntry) => void;
  onScaffold: () => void;
}

const getIcon = (entry: VibeEntry, isExpanded: boolean) => {
  switch (entry.type) {
    case 'image':
      return <ImageIcon className="w-5 h-5 flex-shrink-0 text-gray-600" />;
    case 'folder':
      return isExpanded 
        ? <FolderOpenIcon className="w-5 h-5 flex-shrink-0 text-blue-600" /> 
        : <FolderIcon className="w-5 h-5 flex-shrink-0 text-blue-600" />;
    case 'file':
    default:
      return <FileIcon className="w-5 h-5 flex-shrink-0 text-gray-600" />;
  }
};

const TreeItem: React.FC<{
  node: TreeNode;
  activeId: string | null;
  onSelect: (id: string) => void;
  expandedFolders: Set<string>;
  toggleFolder: (id: string) => void;
  level: number;
}> = ({ node, activeId, onSelect, expandedFolders, toggleFolder, level }) => {
  const isExpanded = expandedFolders.has(node.id);

  const handleSelect = () => {
    if (node.type === 'folder') {
      toggleFolder(node.id);
    }
    onSelect(node.id);
  };

  return (
    <li>
      <button
        onClick={handleSelect}
        style={{ paddingLeft: `${0.75 + level * 1}rem` }}
        className={`w-full text-left py-2 pr-3 rounded-md flex items-center space-x-2 transition-all duration-150 ${
          activeId === node.id
            ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600'
            : 'hover:bg-gray-50 text-gray-700'
        }`}
      >
        {getIcon(node, isExpanded)}
        <span className="truncate">{node.name}</span>
      </button>
      {node.type === 'folder' && isExpanded && (
        <ul>
          {node.children.map(child => (
            <TreeItem
              key={child.id}
              node={child}
              activeId={activeId}
              onSelect={onSelect}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};


const FileTree: React.FC<FileTreeProps> = ({ 
  entries, 
  activeId, 
  onSelect, 
  onNewFile, 
  onNewFolder, 
  onFileUpload,
  onScaffold 
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set(['assets']));

  const tree = useMemo(() => buildTree(entries), [entries]);

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const id = isImage ? `assets/${file.name}` : file.name;
        
        const uploadedFile: VibeEntry = {
            id: id,
            name: file.name,
            content: content,
            language: file.name.split('.').pop() || (isImage ? 'image' : 'text'),
            type: isImage ? 'image' : 'file'
        };
        onFileUpload(uploadedFile);
      };

      if (isImage) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
      event.target.value = ''; // Reset input
    }
  };

  return (
    <div className="w-full h-full bg-white border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <h1 className="text-base sm:text-lg font-semibold text-gray-900">AI Studio</h1>
      </div>
      <div className="p-2 sm:p-3 space-y-2 bg-gray-50 border-b border-gray-200 flex-shrink-0">
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          <button onClick={onNewFile} className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-1.5 sm:py-2 px-1.5 sm:px-2 rounded-lg text-xs transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-1.5 border border-gray-200 shadow-sm hover:shadow">
            <FileIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
            <span className="hidden xs:inline">New File</span>
          </button>
          <button onClick={onNewFolder} className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-1.5 sm:py-2 px-1.5 sm:px-2 rounded-lg text-xs transition-all duration-200 flex items-center justify-center space-x-1 sm:space-x-1.5 border border-gray-200 shadow-sm hover:shadow">
            <FolderIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
            <span className="hidden xs:inline">New Folder</span>
          </button>
        </div>
        <button onClick={handleUploadClick} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-xs transition-all duration-200 flex items-center justify-center space-x-1.5 sm:space-x-2 shadow-sm hover:shadow-md">
          <UploadIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>Upload</span>
        </button>
        <button onClick={onScaffold} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg text-xs transition-all duration-200 flex items-center justify-center space-x-1.5 sm:space-x-2 shadow-md hover:shadow-lg">
          <MagicIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>Scaffold with AI</span>
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      </div>
      <nav className="flex-1 p-1.5 sm:p-2 overflow-y-auto bg-white">
        <ul>
          {tree.map(node => (
            <TreeItem 
              key={node.id} 
              node={node} 
              activeId={activeId} 
              onSelect={onSelect} 
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              level={0} 
            />
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default FileTree;

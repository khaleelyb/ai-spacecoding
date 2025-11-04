export type EntryType = 'file' | 'folder' | 'image';

export interface VibeEntry {
  id: string; // full path, e.g., 'src/welcome.js'
  name: string; // filename, e.g., 'welcome.js' or 'src'
  type: EntryType;
  content?: string; // text content or base64 data url for images. Undefined for folders.
  language?: string; // Undefined for folders
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export enum AIMode {
  ANALYZE = 'Analyze',
  REFACTOR = 'Refactor',
}

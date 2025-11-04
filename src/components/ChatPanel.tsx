import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import SendIcon from './icons/SendIcon';
import SparkleIcon from './icons/SparkleIcon';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <header className="px-4 py-3 border-b border-gray-200 flex items-center space-x-3 bg-gray-50">
        <SparkleIcon className="w-5 h-5 text-blue-600" />
        <h2 className="text-base font-semibold text-gray-900">AI Assistant</h2>
      </header>
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs md:max-w-md p-3 rounded-lg shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-gray-100 text-gray-900 rounded-tl-sm border border-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex justify-start">
             <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-gray-100 text-gray-900 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
                </div>
            </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Assistant..."
            className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading} className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md">
            <SendIcon className="w-5 h-5"/>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;

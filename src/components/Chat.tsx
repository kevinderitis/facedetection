import React, { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';

interface ChatProps {
  onBack: () => void;
}

export const Chat: React.FC<ChatProps> = ({ onBack }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ text: string; sent: boolean }>>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: message, sent: true }]);
    setMessage('');

    // Simulate API response (replace with actual API call)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "¡Gracias por tu mensaje! Te responderemos pronto.", 
        sent: false 
      }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-600 to-blue-500">
      {/* Header */}
      <div className="bg-white shadow-md p-4 flex items-center">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-purple-600" />
        </button>
        <h1 className="ml-4 text-xl font-semibold text-gray-800">Chat</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.sent
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-800'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
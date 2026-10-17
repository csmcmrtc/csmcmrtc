import React, { useState } from 'react';
import { Bot, X } from 'lucide-react';
import { AIAssistant } from './AIAssistant';

export const FloatingDonationChatWidget: React.FC<{ user: any }> = ({ user }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open donation assistant"
          className="h-12 w-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center transition-colors"
        >
          <Bot className="h-6 w-6" />
        </button>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close donation assistant"
            className="absolute -top-3 -right-3 h-9 w-9 rounded-full bg-gray-900 hover:bg-gray-800 text-white shadow-md flex items-center justify-center z-10"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
            <AIAssistant user={user} variant="floating" />
          </div>
        </div>
      )}
    </div>
  );
};


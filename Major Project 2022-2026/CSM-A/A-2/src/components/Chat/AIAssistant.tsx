import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { api } from '../../services/api';

interface AIAssistantProps {
  user: any;
  variant?: 'page' | 'floating';
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ user, variant = 'page' }) => {
  const isFloating = variant === 'floating';
  const [messages, setMessages] = useState<any[]>([
    {
      id: '1',
      type: 'bot',
      message: `Hello ${user.name}! I can help with donation status and donation details. You can ask about approval/review/pickup/delivery, expiry date, quantity, or assigned beneficiary.`,
      timestamp: new Date().toISOString(),
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [latestDonations, setLatestDonations] = useState<any[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [showDonationSuggestions, setShowDonationSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const refreshDonations = async () => {
    if (!user?.id) return;
    setDonationsLoading(true);
    try {
      const donations = await api.getDonationsByDonor(String(user.id));
      setLatestDonations(donations || []);
    } catch (error) {
      console.error('Failed to fetch latest donations:', error);
      setLatestDonations([]);
    } finally {
      setDonationsLoading(false);
    }
  };

  useEffect(() => {
    if (!isFloating) return;
    setShowDonationSuggestions(true);
    void refreshDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFloating, user?.id]);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || loading) return;

    const wantsDonationList =
      isFloating && /(my\s+donations|my\s+donation\s+status|latest\s+donations|show\s+all\s+donations)/i.test(trimmed);
    if (wantsDonationList) {
      setShowDonationSuggestions(true);
      await refreshDonations();
    }

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setLoading(true);

    try {
      const response = await aiService.generateChatResponse(trimmed, { user });

      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        message: response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, botMessage]);

      // Save to database
      await api.createChatMessage({
        userId: user.id,
        message: trimmed,
        response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to get AI response:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(newMessage);
  };

  const handleQuickDonationPrompt = (donationId: string) => {
    setShowDonationSuggestions(false);
    void sendMessage(`donation #${donationId}`);
  };

  return (
    <div
      className={`flex flex-col ${isFloating ? 'h-[70vh] w-[360px] max-w-[95vw]' : 'h-[calc(100vh-8rem)] max-w-4xl mx-auto'}`}
    >
      <div className="bg-white border border-gray-200 rounded-t-lg p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">FoodBridge AI Assistant</h3>
            <p className="text-sm text-gray-500">Always here to help with your donations</p>
          </div>
        </div>
      </div>

      {isFloating && showDonationSuggestions && (
        <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100">
          <div className="text-xs font-semibold text-emerald-900 uppercase tracking-wide mb-2">Your latest donations</div>
          {donationsLoading ? (
            <div className="text-sm text-emerald-900/70">Loading donations...</div>
          ) : latestDonations?.length ? (
            <div className="space-y-2">
              {latestDonations.slice(0, 3).map((d: any) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between gap-3 bg-white border border-emerald-100 rounded-lg px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{d.title}</div>
                    <div className="text-xs text-gray-600 truncate">
                      {d.status} · Expires {d.expiryDate}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickDonationPrompt(d.id)}
                    className="shrink-0 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg transition-colors"
                    disabled={loading}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-emerald-900/70">No donations found yet.</div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-xs sm:max-w-md ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${message.type === 'user' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                {message.type === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>
              <div className={`rounded-lg px-4 py-2 ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border border-gray-200'}`}>
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Loader className="h-4 w-4 animate-spin text-emerald-600" />
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 rounded-b-lg p-4">
        {isFloating && (
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              type="button"
              onClick={() => void sendMessage('my donation status')}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs rounded-full transition-colors"
              disabled={loading}
            >
              My donation status
            </button>
            <button
              type="button"
              onClick={() => void sendMessage('how to donate food')}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs rounded-full transition-colors"
              disabled={loading}
            >
              How to donate
            </button>
            <button
              type="button"
              onClick={() => void sendMessage('pickup process')}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs rounded-full transition-colors"
              disabled={loading}
            >
              Pickup process
            </button>
          </div>
        )}
        <div className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask about donation status or donation details..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
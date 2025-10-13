import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNudgeApi } from '../hooks/useNudgeApi';
import { FiAlertCircle, FiRefreshCw, FiX } from 'react-icons/fi';

type Message = {
  id: string;
  from: 'user' | 'bot';
  text: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
};

interface ChatInterfaceProps {
  onClose: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      from: 'bot',
      text: "Hello! I'm your AI investment assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { loading, sendNudge } = useNudgeApi();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const showError = (message: string) => {
    setError(message);

    // Clear previous timeout if exists
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    // Auto-hide error after 5 seconds
    errorTimeoutRef.current = setTimeout(() => {
      setError(null);
    }, 5000);
  };

  useEffect(() => {
    scrollToBottom();

    // Cleanup timeout on unmount
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [messages, scrollToBottom]);

  const retryMessage = async (messageId: string) => {
    const messageToRetry = messages.find(msg => msg.id === messageId);
    if (!messageToRetry) return;

    // Update message status to sending
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              status: 'sending',
              text: messageToRetry.text.replace(' (Failed to send)', ''),
            }
          : msg
      )
    );

    await sendMessage(
      messageToRetry.text.replace(' (Failed to send)', ''),
      messageId
    );
  };

  const sendMessage = async (messageText: string, messageId?: string) => {
    const messageToUpdate = messageId || Date.now().toString();

    if (!messageId) {
      // This is a new message
      const newMessage: Message = {
        id: messageToUpdate,
        from: 'user',
        text: messageText,
        timestamp: new Date(),
        status: 'sending',
      };
      setMessages(prev => [...prev, newMessage]);
    }

    try {
      const response = await sendNudge(messageText, {
        deviceInfo: {
          type: 'desktop',
          os: 'Windows',
          browser: 'Chrome',
        },
        location: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });

      // Update message status to sent
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageToUpdate ? { ...msg, status: 'sent' as const } : msg
        )
      );

      // Add bot's response
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        from: 'bot',
        text: response.nudge,
        timestamp: new Date(),
        status: 'sent',
      };

      setMessages(prev => [...prev, botMessage]);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send message';
      showError('Failed to send message. Please try again.');

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageToUpdate
            ? {
                ...msg,
                status: 'error',
                text: `${msg.text.replace(' (Failed to send)', '')} (Failed to send)`,
              }
            : msg
        )
      );
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const messageId = Date.now().toString();
    sendMessage(input, messageId);
    setInput('');
  };

  return (
    <div className="fixed bottom-24 right-8 w-80 max-h-[70vh] bg-white rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 transform">
      {/* Error message banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle
                className="h-5 w-5 text-red-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <FiX className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-indigo-700 text-white">
        <h2 className="font-semibold" id="nudge-chat-title">
          AI Investment Assistant
        </h2>
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white p-1 rounded-full"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${
              message.from === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 relative ${
                message.from === 'user'
                  ? message.status === 'error'
                    ? 'bg-red-50 border border-red-200 text-red-800 rounded-br-none'
                    : 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-tl-none'
              }`}
            >
              <div className="flex items-center">
                <span>{message.text.replace(' (Failed to send)', '')}</span>
                {message.status === 'error' && message.from === 'user' && (
                  <button
                    onClick={() => retryMessage(message.id)}
                    className="ml-2 p-1 rounded-full hover:bg-red-100 text-red-600"
                    aria-label="Retry sending message"
                  >
                    <FiRefreshCw className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="text-xs mt-1 opacity-60 text-right">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              {message.status === 'sending' && (
                <div className="absolute -bottom-2 -right-2 text-xs text-gray-500">
                  Sending...
                </div>
              )}
              {message.status === 'error' && message.from === 'user' && (
                <div className="absolute -bottom-2 -right-2 text-xs text-red-500 flex items-center">
                  <FiAlertCircle className="h-3.5 w-3.5 mr-0.5" />
                  Failed
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-3 bg-gray-50">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            className="w-full rounded-lg border border-gray-300 pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            aria-label="Type your message"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-600 hover:text-indigo-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded-full"
            aria-label="Send message"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
      <div className="sr-only" id="nudge-chat-instructions">
        Press Enter to send your message
      </div>
    </div>
  );
};

export default ChatInterface;

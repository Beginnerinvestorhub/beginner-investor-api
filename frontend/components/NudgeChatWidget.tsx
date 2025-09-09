import React, { useState, lazy, Suspense } from 'react';
import { useSession } from 'next-auth/react';

// Lazy load the chat interface
const ChatInterface = lazy(() => import('./ChatInterface'));

// Loading component for the chat interface
const ChatLoader = () => (
  <div className="fixed bottom-24 right-8 w-80 h-96 bg-white rounded-xl shadow-2xl z-50 flex items-center justify-center">
    <div className="animate-pulse text-gray-500">Loading chat...</div>
  </div>
);

const NudgeChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { data: session } = useSession();
  
  if (!session) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Open chat"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls="nudge-chat-widget"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      ) : (
        <Suspense fallback={<ChatLoader />}>
          <ChatInterface onClose={() => setIsOpen(false)} />
        </Suspense>
      )}
    </div>
  );
};

export default NudgeChatWidget;

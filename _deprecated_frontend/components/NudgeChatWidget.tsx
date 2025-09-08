import React, { useState, useRef } from 'react';
import axios from 'axios';

export default function NudgeChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages(msgs => [...msgs, { from: 'user', text: input }]);
    setLoading(true);
    try {
      const res = await axios.post('/api/nudge-engine-proxy', { message: input });
      setMessages(msgs => [...msgs, { from: 'bot', text: res.data.nudge }]);
    } catch (err) {
      // Log unexpected errors for debugging
      console.error('NudgeChatWidget sendMessage error:', err);
      setMessages(msgs => [...msgs, { from: 'bot', text: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
      setInput('');
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  return (
    <>
      <button
        className="fixed bottom-8 right-8 z-50 bg-indigo-700 text-white rounded-full p-4 shadow-lg hover:bg-indigo-800 focus:outline-none"
        onClick={() => setOpen(o => !o)}
        aria-label="Open AI Nudge Chat"
        aria-expanded={open}
        aria-controls="nudge-chat-widget"
      >
        💬
      </button>
      {open && (
        <div 
          id="nudge-chat-widget"
          className="fixed bottom-24 right-8 w-80 bg-white rounded-xl shadow-2xl z-50 flex flex-col"
          role="dialog"
          aria-labelledby="nudge-chat-title"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-4 py-2 border-b bg-indigo-700 text-white rounded-t-xl">
            <span id="nudge-chat-title">AI Nudge</span>
            <button 
              onClick={() => setOpen(false)} 
              aria-label="Close chat"
              aria-controls="nudge-chat-widget"
            >✖️</button>
          </div>
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-2" 
            style={{ maxHeight: 300 }}
            role="log"
            aria-live="polite"
            aria-atomic="false"
          >
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={msg.from === 'user' ? 'text-right' : 'text-left'}
                role="article"
                aria-label={msg.from === 'user' ? 'Your message' : 'AI response'}
              >
                <span 
                  className={msg.from === 'user' ? 'bg-indigo-100 text-indigo-800 rounded-lg px-3 py-1 inline-block' : 'bg-gray-100 text-gray-800 rounded-lg px-3 py-1 inline-block'}
                  aria-live="off"
                >
                  {msg.text}
                </span>
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>
          <div className="p-2 border-t flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded px-3 py-1"
              value={input}
              disabled={loading}
              placeholder="Ask for a nudge..."
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
              aria-label="Type your message"
              aria-describedby="nudge-chat-instructions"
            />
            <button
              className="bg-indigo-600 text-white px-4 py-1 rounded disabled:opacity-50"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>
          <div id="nudge-chat-instructions" className="sr-only">
            Press Enter to send your message
          </div>
        </div>
      )}
    </>
  );
}

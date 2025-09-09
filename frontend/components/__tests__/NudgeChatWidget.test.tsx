import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import NudgeChatWidget from '../NudgeChatWidget';

// Mock the session
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { id: 'test-user' } },
  }),
}));

// Mock the ChatInterface component
jest.mock('../ChatInterface', () => {
  const ChatInterface = ({ onClose }: { onClose: () => void }) => (
    <div role="dialog" aria-labelledby="nudge-chat-title">
      <h2 id="nudge-chat-title">AI Investment Assistant</h2>
      <button onClick={onClose} aria-label="Close chat">
        Close
      </button>
    </div>
  );
  ChatInterface.displayName = 'ChatInterface';
  return ChatInterface;
});

describe('NudgeChatWidget', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the chat widget button', () => {
    render(<NudgeChatWidget />);
    const button = screen.getByRole('button', { name: /open chat/i });
    expect(button).toBeInTheDocument();
  });

  it('opens the chat widget when button is clicked', async () => {
    render(<NudgeChatWidget />);
    const button = screen.getByRole('button', { name: /open chat/i });
    
    await act(async () => {
      fireEvent.click(button);
      // Wait for the component to finish loading
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Check if chat widget is open
    const chatWidget = await screen.findByRole('dialog');
    expect(chatWidget).toBeInTheDocument();
  });

  it('closes the chat widget when close button is clicked', async () => {
    render(<NudgeChatWidget />);
    
    // Open the chat widget
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /open chat/i }));
      // Wait for the component to finish loading
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Click the close button
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /close chat/i }));
      // Wait for the component to finish updating
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // The chat button should be visible again
    expect(screen.getByRole('button', { name: /open chat/i })).toBeInTheDocument();
  });
});

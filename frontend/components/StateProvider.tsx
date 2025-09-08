/**
 * State Provider Component
 * React provider for global state management initialization and context
 */

import React, { useEffect, useRef, ReactNode } from 'react';
import { initializeStores, resetAllStores, checkStoreHealth } from '../store';
import { useAuth, useUI, showErrorNotification } from '../store';

interface StateProviderProps {
  children: ReactNode;
}

interface StateProviderContextValue {
  resetStores: () => void;
  checkHealth: () => void;
}

const StateProviderContext = React.createContext<StateProviderContextValue | null>(null);

export const useStateProvider = () => {
  const context = React.useContext(StateProviderContext);
  if (!context) {
    throw new Error('useStateProvider must be used within a StateProvider');
  }
  return context;
};

export const StateProvider: React.FC<StateProviderProps> = ({ children }) => {
  const cleanupRef = useRef<(() => void) | null>(null);
  const { isAuthenticated, error: authError } = useAuth();
  const { showNotification } = useUI();

  // Initialize stores on mount
  useEffect(() => {
    try {
      cleanupRef.current = initializeStores();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🏪 Global state management initialized');
        checkStoreHealth();
      }
    } catch (error) {
      console.error('Failed to initialize stores:', error);
      showErrorNotification(
        'Initialization Error',
        'Failed to initialize application state. Please refresh the page.',
        [
          {
            label: 'Refresh',
            action: () => window.location.reload(),
          },
        ]
      );
    }

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [showNotification]);

  // Handle authentication errors
  useEffect(() => {
    if (authError) {
      showErrorNotification(
        'Authentication Error',
        authError,
        [
          {
            label: 'Retry',
            action: () => window.location.reload(),
          },
        ]
      );
    }
  }, [authError, showNotification]);

  // Handle authentication state changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Authentication state changed:', { isAuthenticated });
    }
  }, [isAuthenticated]);

  // Context value
  const contextValue: StateProviderContextValue = {
    resetStores: resetAllStores,
    checkHealth: checkStoreHealth,
  };

  return (
    <StateProviderContext.Provider value={contextValue}>
      {children}
    </StateProviderContext.Provider>
  );
};

export default StateProvider;

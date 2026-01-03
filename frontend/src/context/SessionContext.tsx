import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SessionService, SessionDto, CreateSessionRequest } from '../services/sessionService';

interface SessionContextValue {
  currentSession: SessionDto | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadCurrentSession: () => Promise<void>;
  loadOrCreateSession: () => Promise<void>;
  createNewSession: (request: CreateSessionRequest) => Promise<void>;
  endCurrentSession: () => Promise<void>;
  activateSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: React.ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<SessionDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track if we're already in the process of creating a session to prevent duplicates
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const hasInitialized = useRef(false);

  // Load current session (may return null if no active session)
  const loadCurrentSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 SessionContext: Loading current session...');
      const session = await SessionService.getCurrentSession();
      setCurrentSession(session);
      console.log('✅ SessionContext: Current session loaded:', session?.id || 'none');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load session';
      setError(message);
      console.error('❌ SessionContext: Failed to load current session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load current session or create a new one (with duplicate prevention)
  const loadOrCreateSession = useCallback(async () => {
    // Prevent duplicate session creation
    if (isCreatingSession) {
      console.log('⏳ SessionContext: Session creation already in progress, skipping...');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setIsCreatingSession(true);
      
      console.log('🔄 SessionContext: Loading or creating session...');
      const session = await SessionService.getCurrentOrCreateSession();
      setCurrentSession(session);
      console.log('✅ SessionContext: Session loaded/created:', session.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load or create session';
      setError(message);
      console.error('❌ SessionContext: Failed to load or create session:', err);
    } finally {
      setIsLoading(false);
      setIsCreatingSession(false);
    }
  }, [isCreatingSession]);

  // Create new session
  const createNewSession = useCallback(async (request: CreateSessionRequest) => {
    if (isCreatingSession) {
      console.log('⏳ SessionContext: Session creation already in progress, skipping new session...');
      return;
    }
    
    const requestId = Date.now();
    try {
      setIsLoading(true);
      setError(null);
      setIsCreatingSession(true);
      
      console.log(`[${requestId}] SessionContext: Creating new session:`, request);
      const session = await SessionService.createSession(request);
      console.log(`[${requestId}] SessionContext: New session created:`, session.id);
      setCurrentSession(session);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create session';
      setError(message);
      console.error(`[${requestId}] SessionContext: Failed to create session:`, err);
      throw err;
    } finally {
      setIsLoading(false);
      setIsCreatingSession(false);
    }
  }, [isCreatingSession]);

  // End current session and automatically get the new session created
  const endCurrentSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 SessionContext: Ending current session and creating new one...');
      const newSession = await SessionService.endCurrentSession();
      setCurrentSession(newSession);
      console.log('✅ SessionContext: Session ended and new session created:', newSession.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to end session and create new one';
      setError(message);
      console.error('❌ SessionContext: Failed to end session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Activate an existing session
  const activateSession = useCallback(async (sessionId: string) => {
    if (isCreatingSession) {
      console.log('⏳ SessionContext: Session creation in progress, skipping activation...');
      return;
    }
    
    const requestId = Date.now();
    try {
      setIsLoading(true);
      setError(null);
      setIsCreatingSession(true);
      
      console.log(`[${requestId}] SessionContext: Activating session:`, sessionId);
      const session = await SessionService.activateSession(sessionId);
      console.log(`[${requestId}] SessionContext: Session activated:`, session.id);
      setCurrentSession(session);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to activate session';
      setError(message);
      console.error(`[${requestId}] SessionContext: Failed to activate session:`, err);
      throw err;
    } finally {
      setIsLoading(false);
      setIsCreatingSession(false);
    }
  }, [isCreatingSession]);

  // Refresh current session data
  const refreshSession = useCallback(async () => {
    if (currentSession?.id) {
      try {
        setError(null);
        console.log('🔄 SessionContext: Refreshing session...', currentSession.id);
        const session = await SessionService.getSessionById(currentSession.id);
        console.log('✅ SessionContext: Session refreshed:', session.id);
        setCurrentSession(session);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to refresh session';
        setError(message);
        console.error('❌ SessionContext: Failed to refresh session:', err);
      }
    }
  }, [currentSession?.id]);

  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    const requestId = Date.now();
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`[${requestId}] SessionContext: Deleting session:`, sessionId);
      await SessionService.deleteSession(sessionId);
      console.log(`[${requestId}] SessionContext: Session deleted successfully:`, sessionId);
      
      // If we deleted the current session, clear it
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete session';
      setError(message);
      console.error(`[${requestId}] SessionContext: Failed to delete session:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentSession?.id]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load or create session on mount (only once)
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      console.log('🚀 SessionContext: Provider mounted, ensuring default session...');
      loadOrCreateSession(); // Backend now guarantees a session will exist
    }
  }, []); // Empty dependency - only run once on mount

  const value: SessionContextValue = {
    currentSession,
    isLoading,
    error,
    
    // Actions
    loadCurrentSession,
    loadOrCreateSession,
    createNewSession,
    endCurrentSession,
    activateSession,
    deleteSession,
    refreshSession,
    clearError
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

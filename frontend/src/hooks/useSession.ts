import { useState, useEffect, useCallback } from 'react';
import { SessionService, SessionDto, CreateSessionRequest } from '../services/sessionService';

export interface UseSessionOptions {
  autoLoad?: boolean;
  refreshInterval?: number; // in milliseconds
}

export interface UseSessionReturn {
  currentSession: SessionDto | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadCurrentSession: () => Promise<void>;
  loadOrCreateSession: () => Promise<void>;
  createNewSession: (request: CreateSessionRequest) => Promise<void>;
  endCurrentSession: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

export const useSession = (options: UseSessionOptions = {}): UseSessionReturn => {
  const {
    autoLoad = true,
    refreshInterval
  } = options;

  const [currentSession, setCurrentSession] = useState<SessionDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current session (may return null if no active session)
  const loadCurrentSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const session = await SessionService.getCurrentSession();
      setCurrentSession(session);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load session';
      setError(message);
      console.error('Failed to load current session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load current session or create a new one
  const loadOrCreateSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const session = await SessionService.getCurrentOrCreateSession();
      setCurrentSession(session);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load or create session';
      setError(message);
      console.error('Failed to load or create session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new session
  const createNewSession = useCallback(async (request: CreateSessionRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const session = await SessionService.createSession(request);
      setCurrentSession(session);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create session';
      setError(message);
      console.error('Failed to create session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // End current session
  const endCurrentSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await SessionService.endCurrentSession();
      setCurrentSession(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to end session';
      setError(message);
      console.error('Failed to end session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh current session data
  const refreshSession = useCallback(async () => {
    if (currentSession?.id) {
      try {
        setError(null);
        console.log('useSession: Refreshing session...', currentSession.id);
        console.log('useSession: Current session before refresh:', {
          solveCount: currentSession.solveCount,
          averageTimeMs: currentSession.averageTimeMs
        });
        const session = await SessionService.getSessionById(currentSession.id);
        console.log('useSession: New session data received:', {
          solveCount: session.solveCount,
          averageTimeMs: session.averageTimeMs
        });
        setCurrentSession(session);
        console.log('useSession: Session state updated');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to refresh session';
        setError(message);
        console.error('Failed to refresh session:', err);
      }
    }
  }, [currentSession?.id]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load session on mount
  useEffect(() => {
    if (autoLoad) {
      loadCurrentSession();
    }
  }, [autoLoad, loadCurrentSession]);

  // Auto-refresh session at interval
  useEffect(() => {
    if (refreshInterval && currentSession?.id) {
      const interval = setInterval(refreshSession, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, currentSession?.id, refreshSession]);

  return {
    currentSession,
    isLoading,
    error,
    
    // Actions
    loadCurrentSession,
    loadOrCreateSession,
    createNewSession,
    endCurrentSession,
    refreshSession,
    clearError
  };
};

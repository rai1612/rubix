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
  activateSession: (sessionId: string) => Promise<void>;
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
    const hookRequestId = Date.now();
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`[${hookRequestId}] useSession: STARTING session creation with request:`, request);
      const session = await SessionService.createSession(request);
      console.log(`[${hookRequestId}] useSession: Session created SUCCESSFULLY:`, session);
      setCurrentSession(session);
      console.log(`[${hookRequestId}] useSession: State updated with new session`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create session';
      setError(message);
      console.error(`[${hookRequestId}] useSession: FAILED to create session:`, err);
      
      // Log more details if it's an axios error
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as any;
        console.error(`[${hookRequestId}] useSession: Axios error details:`, {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          config: axiosError.config
        });
      }
      
      // Re-throw the error to propagate to the UI
      throw err;
    } finally {
      setIsLoading(false);
      console.log(`[${hookRequestId}] useSession: Request completed, loading set to false`);
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

  // Activate an existing session
  const activateSession = useCallback(async (sessionId: string) => {
    const hookRequestId = Date.now();
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`[${hookRequestId}] useSession: ACTIVATING session:`, sessionId);
      const session = await SessionService.activateSession(sessionId);
      console.log(`[${hookRequestId}] useSession: Session activated SUCCESSFULLY:`, session);
      setCurrentSession(session);
      console.log(`[${hookRequestId}] useSession: State updated with activated session`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to activate session';
      setError(message);
      console.error(`[${hookRequestId}] useSession: FAILED to activate session:`, err);
      
      // Log more details if it's an axios error
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as any;
        console.error(`[${hookRequestId}] useSession: Axios error details:`, {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          config: axiosError.config
        });
      }
      
      // Re-throw the error to propagate to the UI
      throw err;
    } finally {
      setIsLoading(false);
      console.log(`[${hookRequestId}] useSession: Activate request completed, loading set to false`);
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
    activateSession,
    refreshSession,
    clearError
  };
};

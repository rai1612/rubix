import axios from 'axios';
import { PuzzleType } from './scrambleService';

// Types
export interface SessionDto {
  id: string;
  name: string;
  puzzleType: PuzzleType;
  startedAt: string;
  endedAt?: string;
  isActive: boolean;
  solveCount: number;
  totalTimeMs: number;
  bestTimeMs?: number;
  worstTimeMs?: number;
  averageTimeMs?: number;
  notes?: string;
  tags?: string[];
  averageSeconds?: number;
  formattedDuration?: string;
  formattedBestTime?: string;
  formattedWorstTime?: string;
  formattedAverageTime?: string;
}

export interface CreateSessionRequest {
  name?: string;
  puzzleType: PuzzleType;
  notes?: string;
}

export interface UpdateSessionRequest {
  name?: string;
  notes?: string;
}

// API client setup
const api = axios.create({
  baseURL: '/api/sessions',
  timeout: 10000,
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  const fullUrl = `${config.baseURL}${config.url}`;
  console.log('SessionService INTERCEPTOR: Making request to:', fullUrl);
  console.log('SessionService INTERCEPTOR: Method:', config.method?.toUpperCase());
  console.log('SessionService INTERCEPTOR: Token available:', !!token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('SessionService INTERCEPTOR: Added authorization header');
  } else {
    console.warn('SessionService INTERCEPTOR: No auth token found in localStorage');
  }
  return config;
});

// Add response interceptor for better error logging
api.interceptors.response.use(
  (response) => {
    console.log('SessionService: Successful response from:', response.config.url);
    return response;
  },
  (error) => {
    console.error('SessionService: Request failed:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Session Service
export class SessionService {
  /**
   * Get current active session
   */
  static async getCurrentSession(): Promise<SessionDto | null> {
    try {
      const response = await api.get('/current');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No active session
      }
      console.error('Error fetching current session:', error);
      throw new Error('Failed to fetch current session');
    }
  }

  /**
   * Get current session or create new one
   */
  static async getCurrentOrCreateSession(): Promise<SessionDto> {
    try {
      const response = await api.get('/current-or-create');
      return response.data;
    } catch (error) {
      console.error('Error getting or creating current session:', error);
      throw new Error('Failed to get or create session');
    }
  }

  /**
   * Get user's sessions
   */
  static async getUserSessions(limit: number = 10): Promise<SessionDto[]> {
    try {
      console.log('SessionService.getUserSessions: Fetching user sessions with limit:', limit);
      const response = await api.get('', {  // Remove trailing slash
        params: { limit }
      });
      console.log('SessionService.getUserSessions: Success, received sessions:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('SessionService.getUserSessions: Error fetching user sessions:', error);
      throw new Error('Failed to fetch sessions');
    }
  }

  /**
   * Get session by ID
   */
  static async getSessionById(id: string): Promise<SessionDto> {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching session by ID:', error);
      throw new Error('Failed to fetch session');
    }
  }

  /**
   * Create new session
   */
  static async createSession(request: CreateSessionRequest): Promise<SessionDto> {
    const requestId = Date.now();
    try {
      console.log(`[${requestId}] SessionService.createSession: Making POST request to create session`);
      console.log(`[${requestId}] SessionService.createSession: Request data:`, request);
      console.log(`[${requestId}] SessionService.createSession: Full URL will be: ${api.defaults.baseURL}`);
      const response = await api.post('', request);  // Remove trailing slash
      console.log(`[${requestId}] SessionService.createSession: SUCCESS response:`, response.data);
      console.log(`[${requestId}] SessionService.createSession: Response status:`, response.status);
      return response.data;
    } catch (error) {
      console.error(`[${requestId}] SessionService.createSession: ERROR occurred:`, error);
      console.error(`[${requestId}] SessionService.createSession: Error response:`, (error as any)?.response);
      throw new Error('Failed to create session');
    }
  }

  /**
   * Update session
   */
  static async updateSession(id: string, request: UpdateSessionRequest): Promise<SessionDto> {
    try {
      const response = await api.put(`/${id}`, request);
      return response.data;
    } catch (error) {
      console.error('Error updating session:', error);
      throw new Error('Failed to update session');
    }
  }

  /**
   * End current session and get the newly created session
   */
  static async endCurrentSession(): Promise<SessionDto> {
    try {
      console.log('SessionService: Ending current session and creating new one');
      const response = await api.post('/end-current');
      console.log('SessionService: New session created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error ending current session:', error);
      throw new Error('Failed to end session');
    }
  }

  /**
   * Activate (switch to) an existing session
   */
  static async activateSession(sessionId: string): Promise<SessionDto> {
    try {
      console.log('SessionService: Activating session:', sessionId);
      console.log('SessionService: API baseURL:', api.defaults.baseURL);
      console.log('SessionService: Full URL will be:', `${api.defaults.baseURL}/${sessionId}/activate`);
      
      const response = await api.post(`/${sessionId}/activate`);
      console.log('SessionService: Session activated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('SessionService: Error activating session:', error);
      throw new Error('Failed to activate session');
    }
  }

  /**
   * Delete a session and all its associated data
   */
  static async deleteSession(sessionId: string): Promise<void> {
    try {
      console.log('SessionService: Deleting session:', sessionId);
      await api.delete(`/${sessionId}`);
      console.log('SessionService: Session deleted successfully:', sessionId);
    } catch (error) {
      console.error('SessionService: Error deleting session:', error);
      
      // Handle specific error cases
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 400) {
          // Check if it's last session error or active session error
          const errorMessage = axiosError.response?.data || axiosError.message || '';
          if (errorMessage.includes('last session')) {
            throw new Error('Cannot delete the last session. At least one session must exist.');
          } else {
            throw new Error('Cannot delete active session. Please end the session first.');
          }
        } else if (axiosError.response?.status === 404) {
          throw new Error('Session not found or not owned by you.');
        }
      }
      
      throw new Error('Failed to delete session');
    }
  }
}

// Session statistics helper
export class SessionStats {
  /**
   * Calculate session statistics from session data
   */
  static calculateStats(session: SessionDto) {
    return {
      solveCount: session.solveCount || 0,
      averageTime: session.averageTimeMs ? (session.averageTimeMs / 1000).toFixed(2) : '--',
      bestTime: session.bestTimeMs ? (session.bestTimeMs / 1000).toFixed(2) : '--',
      worstTime: session.worstTimeMs ? (session.worstTimeMs / 1000).toFixed(2) : '--',
      totalTime: session.totalTimeMs ? Math.round(session.totalTimeMs / 1000) : 0,
      duration: session.formattedDuration || '--',
      isActive: session.isActive
    };
  }

  /**
   * Format time in milliseconds to readable format
   */
  static formatTime(timeMs: number | null | undefined): string {
    if (!timeMs) return '--';
    
    const seconds = timeMs / 1000;
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toFixed(2).padStart(5, '0')}`;
    } else {
      return seconds.toFixed(2);
    }
  }
}

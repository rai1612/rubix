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
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
      const response = await api.get('/', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user sessions:', error);
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
    try {
      const response = await api.post('/', request);
      return response.data;
    } catch (error) {
      console.error('Error creating session:', error);
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
   * End current session
   */
  static async endCurrentSession(): Promise<void> {
    try {
      await api.post('/end-current');
    } catch (error) {
      console.error('Error ending current session:', error);
      throw new Error('Failed to end session');
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

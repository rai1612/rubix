import { AuthService } from './authService';

export interface PracticeSession {
  id: string;
  userId: string;
  algorithmId: string;
  sessionType: PracticeSessionType;
  startTime: string;
  endTime?: string;
  totalTime: number;
  attempts: PracticeAttempt[];
  averageTime: number;
  bestTime: number;
  accuracy: number;
  isCompleted: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PracticeAttempt {
  id: string;
  sessionId: string;
  attemptNumber: number;
  timeMs: number;
  isCorrect: boolean;
  userInput?: string;
  penalty?: 'plus2' | 'dnf';
  timestamp: string;
  notes?: string;
}

export interface CreatePracticeSessionRequest {
  algorithmId: string;
  sessionType: PracticeSessionType;
  notes?: string;
}

export interface CreatePracticeAttemptRequest {
  sessionId: string;
  timeMs: number;
  isCorrect: boolean;
  userInput?: string;
  penalty?: 'plus2' | 'dnf';
  notes?: string;
}

export interface PracticeSessionSummary {
  totalSessions: number;
  totalTime: number;
  averageSessionTime: number;
  mostPracticedAlgorithm: string;
  improvementRate: number;
  accuracyTrend: number[];
  timeTrend: number[];
}

export interface PracticeStats {
  algorithm: {
    id: string;
    name: string;
    algorithmSet: string;
  };
  totalSessions: number;
  totalAttempts: number;
  averageTime: number;
  bestTime: number;
  accuracy: number;
  lastPracticed: string;
  improvementRate: number;
  difficultyRating: number;
  masteryLevel: MasteryLevel;
}

export enum PracticeSessionType {
  RECOGNITION = 'recognition',
  EXECUTION = 'execution',
  MIXED = 'mixed',
  DRILL = 'drill',
  TIMED = 'timed'
}

export enum MasteryLevel {
  BEGINNER = 'beginner',
  LEARNING = 'learning',
  IMPROVING = 'improving',
  PROFICIENT = 'proficient',
  MASTERED = 'mastered'
}

class PracticeService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api/practice${endpoint}`;
    const token = AuthService.getToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          AuthService.logout();
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle empty responses
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error('Practice service error:', error);
      throw error;
    }
  }

  // Create a new practice session
  async createSession(request: CreatePracticeSessionRequest): Promise<PracticeSession> {
    return this.request<PracticeSession>('/sessions', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get practice session by ID
  async getSession(sessionId: string): Promise<PracticeSession> {
    return this.request<PracticeSession>(`/sessions/${sessionId}`);
  }

  // Get user's practice sessions
  async getUserSessions(
    algorithmId?: string,
    sessionType?: PracticeSessionType,
    limit: number = 20,
    offset: number = 0
  ): Promise<PracticeSession[]> {
    const params = new URLSearchParams();
    if (algorithmId) params.append('algorithmId', algorithmId);
    if (sessionType) params.append('sessionType', sessionType);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    return this.request<PracticeSession[]>(`/sessions?${params}`);
  }

  // Update practice session
  async updateSession(
    sessionId: string, 
    updates: Partial<Pick<PracticeSession, 'endTime' | 'notes' | 'isCompleted'>>
  ): Promise<PracticeSession> {
    return this.request<PracticeSession>(`/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Complete a practice session
  async completeSession(sessionId: string): Promise<PracticeSession> {
    return this.request<PracticeSession>(`/sessions/${sessionId}/complete`, {
      method: 'POST',
    });
  }

  // Add attempt to practice session
  async addAttempt(request: CreatePracticeAttemptRequest): Promise<PracticeAttempt> {
    return this.request<PracticeAttempt>('/attempts', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get session attempts
  async getSessionAttempts(sessionId: string): Promise<PracticeAttempt[]> {
    return this.request<PracticeAttempt[]>(`/sessions/${sessionId}/attempts`);
  }

  // Delete practice session
  async deleteSession(sessionId: string): Promise<void> {
    return this.request<void>(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Get practice statistics for an algorithm
  async getAlgorithmStats(algorithmId: string): Promise<PracticeStats> {
    return this.request<PracticeStats>(`/algorithms/${algorithmId}/stats`);
  }

  // Get user's overall practice summary
  async getPracticeSummary(): Promise<PracticeSessionSummary> {
    return this.request<PracticeSessionSummary>('/summary');
  }

  // Get practice statistics for multiple algorithms
  async getBulkAlgorithmStats(algorithmIds: string[]): Promise<PracticeStats[]> {
    return this.request<PracticeStats[]>('/algorithms/stats', {
      method: 'POST',
      body: JSON.stringify({ algorithmIds }),
    });
  }

  // Get recommended algorithms to practice
  async getRecommendedAlgorithms(limit: number = 10): Promise<string[]> {
    return this.request<string[]>(`/recommendations?limit=${limit}`);
  }

  // Get practice leaderboard (top performers for an algorithm)
  async getLeaderboard(algorithmId: string, limit: number = 10): Promise<{
    userId: string;
    username: string;
    bestTime: number;
    averageTime: number;
    totalAttempts: number;
    accuracy: number;
  }[]> {
    return this.request<any[]>(`/algorithms/${algorithmId}/leaderboard?limit=${limit}`);
  }

  // Export practice data
  async exportPracticeData(
    algorithmId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<Blob> {
    const params = new URLSearchParams();
    if (algorithmId) params.append('algorithmId', algorithmId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`${this.baseUrl}/api/practice/export?${params}`, {
      headers: {
        'Authorization': `Bearer ${AuthService.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export practice data');
    }

    return response.blob();
  }

  // Utility methods
  calculateMasteryLevel(stats: PracticeStats): MasteryLevel {
    const { accuracy, totalAttempts, improvementRate } = stats;
    
    if (totalAttempts < 5) return MasteryLevel.BEGINNER;
    if (accuracy < 70) return MasteryLevel.LEARNING;
    if (accuracy < 85 || improvementRate < 0) return MasteryLevel.IMPROVING;
    if (accuracy < 95) return MasteryLevel.PROFICIENT;
    return MasteryLevel.MASTERED;
  }

  formatPracticeTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(2);
    return `${minutes}:${seconds.padStart(5, '0')}`;
  }

  getMasteryColor(level: MasteryLevel): string {
    const colors = {
      [MasteryLevel.BEGINNER]: 'gray',
      [MasteryLevel.LEARNING]: 'blue',
      [MasteryLevel.IMPROVING]: 'yellow',
      [MasteryLevel.PROFICIENT]: 'green',
      [MasteryLevel.MASTERED]: 'purple'
    };
    return colors[level];
  }

  getMasteryLabel(level: MasteryLevel): string {
    const labels = {
      [MasteryLevel.BEGINNER]: 'Beginner',
      [MasteryLevel.LEARNING]: 'Learning',
      [MasteryLevel.IMPROVING]: 'Improving',
      [MasteryLevel.PROFICIENT]: 'Proficient',
      [MasteryLevel.MASTERED]: 'Mastered'
    };
    return labels[level];
  }
}

export const practiceService = new PracticeService();

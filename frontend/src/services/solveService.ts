import axios from 'axios';
import { PuzzleType } from './scrambleService';

// Types
export interface SolveDto {
  id: string;
  scrambleId: string;
  scrambleText: string;
  puzzleType: PuzzleType;
  timeMs: number;
  inspectionTimeMs: number;
  penalty: PenaltyType;
  adjustedTimeMs: number;
  solvedAt: string;
  notes?: string;
  tags?: string[];
  moveCount?: number;
  tps?: number;
  crossTimeMs?: number;
  f2lTimeMs?: number;
  ollTimeMs?: number;
  pllTimeMs?: number;
  sessionId: string;
  sessionName?: string;
}

export interface CreateSolveRequest {
  scrambleId: string;
  timeMs: number;
  inspectionTimeMs: number;
  penalty: PenaltyType;
  solvedAt: string;
  notes?: string;
}

export interface UpdateSolveRequest {
  timeMs?: number;
  penalty?: PenaltyType;
  notes?: string;
  tags?: string[];
  crossTimeMs?: number;
  f2lTimeMs?: number;
  ollTimeMs?: number;
  pllTimeMs?: number;
}

export interface SolveStatistics {
  totalSolves: number;
  personalBest?: number;
  currentAo5?: number;
  currentAo12?: number;
  currentAo100?: number;
}

export interface TimeDistribution {
  sub10Count: number;
  sub15Count: number;
  sub20Count: number;
  sub30Count: number;
  sub60Count: number;
  plus60Count: number;
  dnfCount: number;
  plusTwoCount: number;
  totalCount: number;
}

export interface PagedSolves {
  content: SolveDto[];
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  empty: boolean;
}

export enum PenaltyType {
  NONE = 'NONE',
  PLUS_TWO = 'PLUS_TWO',
  DNF = 'DNF'
}

// API client setup
const api = axios.create({
  baseURL: '/api/solves',
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

// Add response interceptor to catch auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication failed - token may be expired');
    }
    return Promise.reject(error);
  }
);

// Solve Service
export class SolveService {
  /**
   * Create a new solve
   */
  static async createSolve(request: CreateSolveRequest): Promise<SolveDto> {
    try {
      const response = await api.post('', request);
      return response.data;
    } catch (error) {
      console.error('Error creating solve:', error);
      throw new Error('Failed to create solve');
    }
  }

  /**
   * Update an existing solve
   */
  static async updateSolve(solveId: string, request: UpdateSolveRequest): Promise<SolveDto> {
    try {
      const response = await api.put(`/${solveId}`, request);
      return response.data;
    } catch (error) {
      console.error('Error updating solve:', error);
      throw new Error('Failed to update solve');
    }
  }

  /**
   * Delete a solve
   */
  static async deleteSolve(solveId: string): Promise<void> {
    try {
      await api.delete(`/${solveId}`);
    } catch (error) {
      console.error('Error deleting solve:', error);
      throw new Error('Failed to delete solve');
    }
  }

  /**
   * Get solve by ID
   */
  static async getSolveById(solveId: string): Promise<SolveDto> {
    try {
      const response = await api.get(`/${solveId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching solve:', error);
      throw new Error('Failed to fetch solve');
    }
  }

  /**
   * Get user's solves with pagination
   */
  static async getUserSolves(page: number = 0, size: number = 20): Promise<PagedSolves> {
    try {
      const response = await api.get('', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user solves:', error);
      throw new Error('Failed to fetch user solves');
    }
  }

  /**
   * Get recent solves
   */
  static async getRecentSolves(limit: number = 10): Promise<SolveDto[]> {
    try {
      const response = await api.get('/recent', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent solves:', error);
      throw new Error('Failed to fetch recent solves');
    }
  }

  /**
   * Get today's solves
   */
  static async getTodaysSolves(): Promise<SolveDto[]> {
    try {
      const response = await api.get('/today');
      return response.data;
    } catch (error) {
      console.error('Error fetching today\'s solves:', error);
      throw new Error('Failed to fetch today\'s solves');
    }
  }

  /**
   * Get session solves
   */
  static async getSessionSolves(sessionId: string): Promise<SolveDto[]> {
    try {
      const response = await api.get(`/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching session solves:', error);
      throw new Error('Failed to fetch session solves');
    }
  }

  /**
   * Get personal best
   */
  static async getPersonalBest(puzzleType: PuzzleType = PuzzleType.CUBE_3X3): Promise<SolveDto | null> {
    try {
      const response = await api.get('/personal-best', {
        params: { puzzleType }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching personal best:', error);
      throw new Error('Failed to fetch personal best');
    }
  }

  /**
   * Get solve statistics
   */
  static async getStatistics(puzzleType: PuzzleType = PuzzleType.CUBE_3X3): Promise<SolveStatistics> {
    try {
      const response = await api.get('/statistics', {
        params: { puzzleType }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching solve statistics:', error);
      throw new Error('Failed to fetch solve statistics');
    }
  }

  /**
   * Get session-specific solve statistics
   */
  static async getSessionStatistics(sessionId: string): Promise<SolveStatistics> {
    try {
      console.log('SolveService: Fetching session statistics for session:', sessionId);
      const response = await api.get(`/session/${sessionId}/statistics`);
      console.log('SolveService: Session statistics received:', response.data);
      return response.data;
    } catch (error) {
      console.error('SolveService: Error fetching session statistics:', error);
      throw new Error('Failed to fetch session statistics');
    }
  }

  /**
   * Get time distribution statistics
   */
  static async getTimeDistribution(puzzleType: PuzzleType = PuzzleType.CUBE_3X3): Promise<TimeDistribution> {
    try {
      const response = await api.get('/time-distribution', {
        params: { puzzleType }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching time distribution:', error);
      throw new Error('Failed to fetch time distribution');
    }
  }

  /**
   * Calculate time distribution from session solves data
   */
  static calculateTimeDistributionFromSolves(solves: SolveDto[]): TimeDistribution {
    const validSolves = solves.filter(solve => solve.penalty !== 'DNF');
    const totalSolves = validSolves.length;

    if (totalSolves === 0) {
      return {
        sub10Count: 0,
        sub15Count: 0,
        sub20Count: 0,
        sub30Count: 0,
        sub60Count: 0,
        plus60Count: 0,
        dnfCount: solves.length - totalSolves,
        plusTwoCount: solves.filter(solve => solve.penalty === 'PLUS_TWO').length,
        totalCount: 0
      };
    }

    const timeInSeconds = validSolves.map(solve => solve.timeMs / 1000);
    
    const sub10Count = timeInSeconds.filter(time => time < 10).length;
    const sub15Count = timeInSeconds.filter(time => time < 15).length;
    const sub20Count = timeInSeconds.filter(time => time < 20).length;
    const sub30Count = timeInSeconds.filter(time => time < 30).length;
    const sub60Count = timeInSeconds.filter(time => time < 60).length;
    const over60Count = timeInSeconds.filter(time => time >= 60).length;

    return {
      sub10Count,
      sub15Count,
      sub20Count,
      sub30Count,
      sub60Count,
      plus60Count: over60Count,
      dnfCount: solves.filter(solve => solve.penalty === 'DNF').length,
      plusTwoCount: solves.filter(solve => solve.penalty === 'PLUS_TWO').length,
      totalCount: totalSolves
    };
  }

  /**
   * Get session-specific time distribution
   */
  static async getSessionTimeDistribution(sessionId: string): Promise<TimeDistribution> {
    try {
      const sessionSolves = await this.getSessionSolves(sessionId);
      return this.calculateTimeDistributionFromSolves(sessionSolves);
    } catch (error) {
      console.error('Error calculating session time distribution:', error);
      throw new Error('Failed to calculate session time distribution');
    }
  }
}

// Client-side solve management for offline use
export class OfflineSolveManager {
  private static readonly STORAGE_KEY = 'rubix_offline_solves';

  /**
   * Save solve to local storage
   */
  static saveSolveOffline(solve: Omit<SolveDto, 'id'>): string {
    const solveId = `offline-${Date.now()}-${Math.random()}`;
    const solveWithId: SolveDto = {
      ...solve,
      id: solveId
    };

    const existingSolves = this.getOfflineSolves();
    existingSolves.push(solveWithId);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingSolves));
    return solveId;
  }

  /**
   * Get all offline solves
   */
  static getOfflineSolves(): SolveDto[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading offline solves:', error);
      return [];
    }
  }

  /**
   * Sync offline solves to server
   */
  static async syncOfflineSolves(): Promise<{ synced: number; errors: string[] }> {
    const offlineSolves = this.getOfflineSolves();
    const errors: string[] = [];
    let synced = 0;

    for (const solve of offlineSolves) {
      try {
        if (solve.id.startsWith('offline-')) {
          const request: CreateSolveRequest = {
            scrambleId: solve.scrambleId,
            timeMs: solve.timeMs,
            inspectionTimeMs: solve.inspectionTimeMs,
            penalty: solve.penalty,
            solvedAt: solve.solvedAt,
            notes: solve.notes
          };

          await SolveService.createSolve(request);
          synced++;
        }
      } catch (error) {
        errors.push(`Failed to sync solve ${solve.id}: ${error}`);
      }
    }

    // Clear synced solves from local storage
    if (synced > 0) {
      const remainingSolves = offlineSolves.filter(solve => !solve.id.startsWith('offline-'));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(remainingSolves));
    }

    return { synced, errors };
  }

  /**
   * Clear all offline solves
   */
  static clearOfflineSolves(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get offline solve count
   */
  static getOfflineSolveCount(): number {
    return this.getOfflineSolves().length;
  }
}

// Utility functions
export const formatTime = (timeMs: number): string => {
  if (timeMs < 0) return '--';
  
  const totalSeconds = timeMs / 1000;
  
  if (totalSeconds >= 60) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
  } else {
    return totalSeconds.toFixed(2);
  }
};

export const formatTimeWithPenalty = (solve: SolveDto): string => {
  if (solve.penalty === PenaltyType.DNF) {
    return 'DNF';
  }
  
  const baseTime = formatTime(solve.timeMs);
  return solve.penalty === PenaltyType.PLUS_TWO ? `${baseTime}+` : baseTime;
};

export const calculateAdjustedTime = (originalTime: number, penalty: PenaltyType): number => {
  switch (penalty) {
    case PenaltyType.PLUS_TWO:
      return originalTime + 2000; // +2 seconds
    case PenaltyType.DNF:
      return Number.MAX_SAFE_INTEGER; // Large number for sorting
    case PenaltyType.NONE:
    default:
      return originalTime;
  }
};

export const getPenaltyDisplayName = (penalty: PenaltyType): string => {
  const displayNames = {
    [PenaltyType.NONE]: 'No penalty',
    [PenaltyType.PLUS_TWO]: '+2 seconds',
    [PenaltyType.DNF]: 'Did Not Finish'
  };
  
  return displayNames[penalty] || penalty;
};

export const getTimeCategory = (timeMs: number): string => {
  const seconds = timeMs / 1000;
  
  if (seconds < 10) return 'Sub-10';
  if (seconds < 15) return 'Sub-15';
  if (seconds < 20) return 'Sub-20';
  if (seconds < 30) return 'Sub-30';
  if (seconds < 60) return 'Sub-1:00';
  
  return '1:00+';
};

export const isPersonalBest = (solve: SolveDto, previousBest?: SolveDto): boolean => {
  if (!previousBest) return solve.penalty !== PenaltyType.DNF;
  if (solve.penalty === PenaltyType.DNF) return false;
  if (previousBest.penalty === PenaltyType.DNF) return true;
  
  return solve.adjustedTimeMs < previousBest.adjustedTimeMs;
};

export default SolveService;

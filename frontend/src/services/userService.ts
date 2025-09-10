import axios from 'axios';
import { UserInfo } from './authService';

// Extended user profile interface
export interface UserProfile extends UserInfo {
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  isActive?: boolean;
  isVerified?: boolean;
  preferences?: Record<string, any>;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  preferences?: Record<string, any>;
}

export interface UserStatistics {
  totalSolves: number;
  totalPracticeTime: number; // in seconds
  totalSessions: number;
  daysActive: number;
  joinDate: string;
  currentStreak: number;
  longestStreak: number;
  averageSessionLength: number; // in minutes
  favoritePuzzleType: string;
  totalAlgorithmsLearned: number;
  favoriteAlgorithmsCount: number;
}

export interface UserAchievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: string;
  category: 'speed' | 'consistency' | 'volume' | 'learning';
  icon: string;
  color: string;
}

export interface PersonalRecords {
  single?: number;
  ao5?: number;
  ao12?: number;
  ao100?: number;
  ao1000?: number;
}

export interface ProfileData {
  user: UserProfile;
  statistics: UserStatistics;
  achievements: UserAchievement[];
  personalRecords: Record<string, PersonalRecords>; // by puzzle type
}

// API client setup
const api = axios.create({
  baseURL: '/api',
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
      // Could redirect to login here
    }
    return Promise.reject(error);
  }
);

export class UserService {
  /**
   * Get current user profile data
   */
  static async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(request: UpdateUserRequest): Promise<UserProfile> {
    try {
      const response = await api.put('/auth/profile', request);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStatistics(): Promise<UserStatistics> {
    try {
      // Get solve statistics
      const solveStatsResponse = await api.get('/solves/statistics');
      const solveStats = solveStatsResponse.data;

      // Get session data
      const sessionsResponse = await api.get('/sessions', { params: { limit: 100 } });
      const sessions = sessionsResponse.data;

      // Get algorithm favorites count
      const algorithmsResponse = await api.get('/algorithms/favorites');
      const favoriteAlgorithms = algorithmsResponse.data;

      // Calculate derived statistics
      const totalSessions = sessions.length;
      const activeSessions = sessions.filter((s: any) => s.solveCount > 0);
      const totalPracticeTime = activeSessions.reduce((total: number, session: any) => 
        total + (session.totalTimeMs || 0), 0) / 1000; // Convert to seconds

      const now = new Date();
      const joinDate = sessions.length > 0 ? 
        Math.min(...sessions.map((s: any) => new Date(s.startedAt).getTime())) : 
        now.getTime();

      // Calculate days active (approximate)
      const daysSinceJoin = Math.ceil((now.getTime() - joinDate) / (1000 * 60 * 60 * 24));
      const daysActive = Math.min(daysSinceJoin, activeSessions.length);

      // Calculate average session length
      const sessionDurations = activeSessions.map((session: any) => {
        const start = new Date(session.startedAt);
        const end = session.endedAt ? new Date(session.endedAt) : now;
        return (end.getTime() - start.getTime()) / (1000 * 60); // minutes
      });
      const averageSessionLength = sessionDurations.length > 0 ? 
        sessionDurations.reduce((a: number, b: number) => a + b, 0) / sessionDurations.length : 0;

      return {
        totalSolves: solveStats.totalSolves || 0,
        totalPracticeTime: Math.round(totalPracticeTime),
        totalSessions,
        daysActive,
        joinDate: new Date(joinDate).toISOString(),
        currentStreak: this.calculateCurrentStreak(sessions),
        longestStreak: this.calculateLongestStreak(sessions),
        averageSessionLength: Math.round(averageSessionLength),
        favoritePuzzleType: '3x3x3', // Default for now
        totalAlgorithmsLearned: 0, // Would need algorithm practice data
        favoriteAlgorithmsCount: favoriteAlgorithms.length || 0
      };
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw new Error('Failed to fetch user statistics');
    }
  }

  /**
   * Get user achievements
   */
  static async getUserAchievements(): Promise<UserAchievement[]> {
    try {
      // For now, calculate achievements based on available data
      const stats = await this.getUserStatistics();
      const solveStats = await api.get('/solves/statistics');
      const achievements: UserAchievement[] = [];

      // Speed achievements
      if (solveStats.data.personalBest && solveStats.data.personalBest < 20000) {
        achievements.push({
          id: 'first-sub-20',
          title: 'First Sub-20',
          description: `${(solveStats.data.personalBest / 1000).toFixed(2)}s`,
          category: 'speed',
          icon: 'Award',
          color: 'yellow',
          unlockedAt: new Date().toISOString() // Would need actual achievement date
        });
      }

      // Volume achievements
      if (stats.totalSolves >= 100) {
        achievements.push({
          id: '100-solves',
          title: '100 Solves',
          description: 'Completed 100 solves',
          category: 'volume',
          icon: 'Target',
          color: 'green',
          unlockedAt: new Date().toISOString()
        });
      }

      // Consistency achievements
      if (stats.currentStreak >= 7) {
        achievements.push({
          id: 'consistent-practice',
          title: 'Consistent Practice',
          description: `${stats.currentStreak} days streak`,
          category: 'consistency',
          icon: 'TrendingUp',
          color: 'blue',
          unlockedAt: new Date().toISOString()
        });
      }

      // Learning achievements
      if (stats.favoriteAlgorithmsCount >= 10) {
        achievements.push({
          id: 'algorithm-learner',
          title: 'Algorithm Learner',
          description: `${stats.favoriteAlgorithmsCount} algorithms favorited`,
          category: 'learning',
          icon: 'Award',
          color: 'purple',
          unlockedAt: new Date().toISOString()
        });
      }

      return achievements;
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }
  }

  /**
   * Get personal records by puzzle type
   */
  static async getPersonalRecords(): Promise<Record<string, PersonalRecords>> {
    try {
      // Get statistics for 3x3 (main puzzle)
      const response = await api.get('/solves/statistics', { 
        params: { puzzleType: 'CUBE_3X3' } 
      });
      const stats = response.data;

      const records: PersonalRecords = {};
      if (stats.personalBest) records.single = stats.personalBest;
      if (stats.currentAo5) records.ao5 = Math.round(stats.currentAo5);
      if (stats.currentAo12) records.ao12 = Math.round(stats.currentAo12);
      if (stats.currentAo100) records.ao100 = Math.round(stats.currentAo100);

      return {
        '3x3x3': records,
        // Could add other puzzle types here
      };
    } catch (error) {
      console.error('Error fetching personal records:', error);
      return {};
    }
  }

  /**
   * Get complete profile data
   */
  static async getCompleteProfileData(): Promise<ProfileData> {
    try {
      const [user, statistics, achievements, personalRecords] = await Promise.all([
        this.getUserProfile(),
        this.getUserStatistics(),
        this.getUserAchievements(),
        this.getPersonalRecords()
      ]);

      return {
        user,
        statistics,
        achievements,
        personalRecords
      };
    } catch (error) {
      console.error('Error fetching complete profile data:', error);
      throw new Error('Failed to fetch complete profile data');
    }
  }

  /**
   * Calculate current streak (simplified)
   */
  private static calculateCurrentStreak(sessions: any[]): number {
    if (sessions.length === 0) return 0;
    
    // Simple calculation based on sessions with solves
    const activeSessions = sessions.filter(s => s.solveCount > 0);
    const recentSessions = activeSessions
      .filter(s => {
        const sessionDate = new Date(s.startedAt);
        const daysDiff = (Date.now() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7; // Last 7 days
      });
    
    return Math.min(recentSessions.length, 7);
  }

  /**
   * Calculate longest streak (simplified)
   */
  private static calculateLongestStreak(sessions: any[]): number {
    // For now, return current streak as longest
    return this.calculateCurrentStreak(sessions);
  }
}

export default UserService;

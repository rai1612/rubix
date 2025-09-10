import { AuthService } from './authService';

export interface Algorithm {
  id: string;
  name: string;
  notationString: string;
  caseDescription?: string;
  algorithmSet: AlgorithmSet;
  caseNumber?: number;
  difficulty?: number;
  moveCount?: number;
  executionTimeMs?: number;
  isPublic: boolean;
  isFavorite: boolean;
  tags: string[];
  triggerPattern?: string;
  setupMoves?: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  fullName: string;
  executionTimeSeconds?: number;
  isUserAlgorithm: boolean;
  imageUrl?: string;
}

export interface AlgorithmSetSummary {
  algorithmSet: AlgorithmSet;
  displayName: string;
  description: string;
  totalCount: number;
  learnedCount: number;
  averageDifficulty?: number;
  averageMoveCount?: number;
  isLastLayer: boolean;
  isAdvanced: boolean;
}

export interface CreateAlgorithm {
  name: string;
  notationString: string;
  caseDescription?: string;
  algorithmSet: AlgorithmSet;
  caseNumber?: number;
  difficulty?: number;
  tags?: string[];
  triggerPattern?: string;
  setupMoves?: string;
}

export interface AlgorithmSetInfo {
  name: string;
  displayName: string;
  description: string;
  isLastLayer: boolean;
  isAdvanced: boolean;
}

export interface SearchResponse {
  content: Algorithm[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface SearchStats {
  totalAlgorithms: number;
  totalSets: number;
  totalUsers: number;
  totalSearches: number;
  mostSearchedTerm: string;
  mostPopularSet: string;
}

export enum AlgorithmSet {
  OLL = 'OLL',
  PLL = 'PLL',
  F2L = 'F2L',
  CROSS = 'CROSS',
  CMLL = 'CMLL',
  LSE = 'LSE',
  COLL = 'COLL',
  ZBLL = 'ZBLL',
  VLS = 'VLS',
  WV = 'WV',
  SV = 'SV',
  ELS = 'ELS',
  CLS = 'CLS',
  OH = 'OH',
  BLD = 'BLD',
  CUSTOM = 'CUSTOM'
}

class AlgorithmService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api/algorithms${endpoint}`;
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

      // Handle empty responses (like DELETE)
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error('Algorithm service error:', error);
      throw error;
    }
  }

  // Get all algorithms
  async getAllAlgorithms(): Promise<Algorithm[]> {
    return this.request<Algorithm[]>('');
  }

  // Get algorithms by set
  async getAlgorithmsBySet(algorithmSet: AlgorithmSet): Promise<Algorithm[]> {
    return this.request<Algorithm[]>(`/set/${algorithmSet}`);
  }

  // Search algorithms (backward compatibility)
  async searchAlgorithms(
    query: string = '',
    algorithmSet?: AlgorithmSet,
    page: number = 0,
    size: number = 20
  ): Promise<SearchResponse> {
    return this.searchAlgorithmsAdvanced({
      query,
      algorithmSet,
      page,
      size
    });
  }

  // Advanced search with filters
  async searchAlgorithmsAdvanced(params: {
    query?: string;
    algorithmSet?: AlgorithmSet;
    difficulty?: number;
    favoriteOnly?: boolean;
    sortBy?: string;
    sortOrder?: string;
    minMoveCount?: number;
    maxMoveCount?: number;
    tags?: string;
    page?: number;
    size?: number;
  }): Promise<SearchResponse> {
    const searchParams = new URLSearchParams();
    
    // Add parameters (always include query, even if empty)
    searchParams.append('query', params.query || '');
    if (params.algorithmSet) searchParams.append('algorithmSet', params.algorithmSet);
    if (params.difficulty !== undefined) searchParams.append('difficulty', params.difficulty.toString());
    if (params.favoriteOnly) searchParams.append('favoriteOnly', 'true');
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
    if (params.minMoveCount !== undefined) searchParams.append('minMoveCount', params.minMoveCount.toString());
    if (params.maxMoveCount !== undefined) searchParams.append('maxMoveCount', params.maxMoveCount.toString());
    if (params.tags) searchParams.append('tags', params.tags);
    
    searchParams.append('page', (params.page || 0).toString());
    searchParams.append('size', (params.size || 20).toString());

    return this.request<SearchResponse>(`/search?${searchParams}`);
  }

  // Get popular algorithms
  async getPopularAlgorithms(limit: number = 10): Promise<Algorithm[]> {
    return this.request<Algorithm[]>(`/popular?limit=${limit}`);
  }

  // Get algorithm by ID
  async getAlgorithmById(id: string): Promise<Algorithm> {
    return this.request<Algorithm>(`/${id}`);
  }

  // Create a new algorithm
  async createAlgorithm(algorithm: CreateAlgorithm): Promise<Algorithm> {
    return this.request<Algorithm>('', {
      method: 'POST',
      body: JSON.stringify(algorithm),
    });
  }

  // Update an algorithm
  async updateAlgorithm(id: string, algorithm: CreateAlgorithm): Promise<Algorithm> {
    return this.request<Algorithm>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(algorithm),
    });
  }

  // Delete an algorithm
  async deleteAlgorithm(id: string): Promise<void> {
    return this.request<void>(`/${id}`, {
      method: 'DELETE',
    });
  }

  // Toggle favorite status
  async toggleFavorite(id: string): Promise<Algorithm> {
    return this.request<Algorithm>(`/${id}/favorite`, {
      method: 'POST',
    });
  }

  // Increment usage count (practice algorithm)
  async practiceAlgorithm(id: string, practiceData?: {
    executionTimeMs: number;
    isPersonalBest: boolean;
    practiceDate: string;
  }): Promise<Algorithm> {
    return this.request<Algorithm>(`/${id}/practice`, {
      method: 'POST',
      body: practiceData ? JSON.stringify(practiceData) : undefined,
    });
  }

  // Get user's favorite algorithms
  async getFavoriteAlgorithms(): Promise<Algorithm[]> {
    return this.request<Algorithm[]>('/favorites');
  }

  // Get algorithm set summaries
  async getAlgorithmSetSummaries(): Promise<AlgorithmSetSummary[]> {
    return this.request<AlgorithmSetSummary[]>('/sets/summary');
  }

  // Get search suggestions
  async getSearchSuggestions(query: string, limit: number = 10): Promise<string[]> {
    if (query.length < 2) return [];
    const params = new URLSearchParams({
      query,
      limit: limit.toString()
    });
    return this.request<string[]>(`/search/suggestions?${params}`);
  }

  // Get search statistics
  async getSearchStats(): Promise<SearchStats> {
    return this.request<SearchStats>('/search/stats');
  }

  // Get similar algorithms
  async getSimilarAlgorithms(algorithmId: string, limit: number = 5): Promise<Algorithm[]> {
    return this.request<Algorithm[]>(`/${algorithmId}/similar?limit=${limit}`);
  }

  // Get most used tags
  async getMostUsedTags(limit: number = 20): Promise<string[]> {
    return this.request<string[]>(`/tags/popular?limit=${limit}`);
  }

  // Get algorithms by difficulty
  async getAlgorithmsByDifficulty(difficulty: number): Promise<Algorithm[]> {
    if (difficulty < 1 || difficulty > 5) {
      throw new Error('Difficulty must be between 1 and 5');
    }
    return this.request<Algorithm[]>(`/difficulty/${difficulty}`);
  }

  // Get available algorithm sets
  async getAlgorithmSets(): Promise<AlgorithmSetInfo[]> {
    return this.request<AlgorithmSetInfo[]>('/sets');
  }

  // Utility methods
  getDifficultyLabel(difficulty?: number): string {
    if (!difficulty) return 'Unknown';
    const labels = {
      1: 'Beginner',
      2: 'Easy',
      3: 'Intermediate',
      4: 'Advanced',
      5: 'Expert'
    };
    return labels[difficulty as keyof typeof labels] || 'Unknown';
  }

  getDifficultyColor(difficulty?: number): string {
    if (!difficulty) return 'gray';
    const colors = {
      1: 'green',
      2: 'blue',
      3: 'yellow',
      4: 'orange',
      5: 'red'
    };
    return colors[difficulty as keyof typeof colors] || 'gray';
  }

  formatTime(ms?: number): string {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  getAlgorithmSetColor(algorithmSet: AlgorithmSet): string {
    const colors = {
      [AlgorithmSet.OLL]: 'blue',
      [AlgorithmSet.PLL]: 'green',
      [AlgorithmSet.F2L]: 'purple',
      [AlgorithmSet.CROSS]: 'orange',
      [AlgorithmSet.CMLL]: 'pink',
      [AlgorithmSet.LSE]: 'indigo',
      [AlgorithmSet.COLL]: 'teal',
      [AlgorithmSet.ZBLL]: 'red',
      [AlgorithmSet.VLS]: 'yellow',
      [AlgorithmSet.WV]: 'cyan',
      [AlgorithmSet.SV]: 'lime',
      [AlgorithmSet.ELS]: 'amber',
      [AlgorithmSet.CLS]: 'emerald',
      [AlgorithmSet.OH]: 'violet',
      [AlgorithmSet.BLD]: 'rose',
      [AlgorithmSet.CUSTOM]: 'gray'
    };
    return colors[algorithmSet] || 'gray';
  }

  getProgressPercentage(learned: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((learned / total) * 100);
  }

  formatProgressLabel(learned: number, total: number): string {
    return `${learned}/${total} learned`;
  }
}

export const algorithmService = new AlgorithmService();

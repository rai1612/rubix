import axios from 'axios';

// Types
export interface ScrambleDto {
  id: string;
  scrambleText: string;
  puzzleType: PuzzleType;
  algorithmMoves: number;
  moveCount: number;
  generatedAt: string;
  isCustom: boolean;
  difficultyRating?: number;
  createdByUsername?: string;
}

export interface GenerateScrambleRequest {
  puzzleType: PuzzleType;
}

export interface CreateCustomScrambleRequest {
  scrambleText: string;
  puzzleType: PuzzleType;
  difficultyRating?: number;
}

export interface ValidateScrambleRequest {
  scrambleText: string;
  puzzleType: PuzzleType;
}

export interface ValidateScrambleResponse {
  valid: boolean;
  message: string;
}

export interface PuzzleTypeInfo {
  type: PuzzleType;
  displayName: string;
  supported: boolean;
}

export enum PuzzleType {
  CUBE_2X2 = 'CUBE_2X2',
  CUBE_3X3 = 'CUBE_3X3',
  CUBE_4X4 = 'CUBE_4X4',
  CUBE_5X5 = 'CUBE_5X5',
  CUBE_6X6 = 'CUBE_6X6',
  CUBE_7X7 = 'CUBE_7X7',
  PYRAMINX = 'PYRAMINX',
  MEGAMINX = 'MEGAMINX',
  SKEWB = 'SKEWB',
  SQUARE_1 = 'SQUARE_1',
  CLOCK = 'CLOCK',
  ONE_HANDED = 'ONE_HANDED',
  BLINDFOLDED = 'BLINDFOLDED'
}

// API client setup
const api = axios.create({
  baseURL: '/api/scrambles',
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

// Scramble Service
export class ScrambleService {
  /**
   * Generate a new scramble
   */
  static async generateScramble(puzzleType: PuzzleType = PuzzleType.CUBE_3X3): Promise<ScrambleDto> {
    try {
      const response = await api.get('/generate', {
        params: { type: puzzleType }
      });
      return response.data;
    } catch (error) {
      console.error('Error generating scramble:', error);
      throw new Error('Failed to generate scramble');
    }
  }

  /**
   * Generate scramble via POST (for complex requests)
   */
  static async generateScramblePost(request: GenerateScrambleRequest): Promise<ScrambleDto> {
    try {
      const response = await api.post('/generate', request);
      return response.data;
    } catch (error) {
      console.error('Error generating scramble via POST:', error);
      throw new Error('Failed to generate scramble');
    }
  }

  /**
   * Create a custom scramble
   */
  static async createCustomScramble(request: CreateCustomScrambleRequest): Promise<ScrambleDto> {
    try {
      const response = await api.post('/custom', request);
      return response.data;
    } catch (error) {
      console.error('Error creating custom scramble:', error);
      throw new Error('Failed to create custom scramble');
    }
  }

  /**
   * Validate a scramble
   */
  static async validateScramble(request: ValidateScrambleRequest): Promise<ValidateScrambleResponse> {
    try {
      const response = await api.post('/validate', request);
      return response.data;
    } catch (error) {
      console.error('Error validating scramble:', error);
      return { valid: false, message: 'Validation failed' };
    }
  }

  /**
   * Get scramble by ID
   */
  static async getScrambleById(id: string): Promise<ScrambleDto> {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching scramble:', error);
      throw new Error('Failed to fetch scramble');
    }
  }

  /**
   * Get recent scrambles
   */
  static async getRecentScrambles(
    puzzleType: PuzzleType = PuzzleType.CUBE_3X3,
    limit: number = 10
  ): Promise<ScrambleDto[]> {
    try {
      const response = await api.get('/recent', {
        params: { type: puzzleType, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent scrambles:', error);
      throw new Error('Failed to fetch recent scrambles');
    }
  }

  /**
   * Get available puzzle types
   */
  static async getPuzzleTypes(): Promise<PuzzleTypeInfo[]> {
    try {
      const response = await api.get('/puzzle-types');
      return response.data;
    } catch (error) {
      console.error('Error fetching puzzle types:', error);
      return [];
    }
  }
}

// Client-side scramble generation using scrambow (fallback/offline)
export class ClientScrambleGenerator {
  /**
   * Generate a scramble client-side for offline use
   * Note: This will be implemented when we add scrambow dependency
   */
  static generateOfflineScramble(puzzleType: PuzzleType): string {
    // Placeholder implementation - will integrate scrambow later
    switch (puzzleType) {
      case PuzzleType.CUBE_3X3:
        return this.generate3x3Scramble();
      case PuzzleType.CUBE_2X2:
        return this.generate2x2Scramble();
      default:
        throw new Error(`Offline generation not supported for ${puzzleType}`);
    }
  }

  private static generate3x3Scramble(): string {
    // Simple scramble generator for offline use
    const moves = ['R', 'L', 'U', 'D', 'F', 'B'];
    const modifiers = ['', "'", '2'];
    const scramble: string[] = [];
    let lastMove = '';
    
    // Generate 18-22 moves
    const moveCount = 18 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < moveCount; i++) {
      let move;
      do {
        move = moves[Math.floor(Math.random() * moves.length)];
      } while (move === lastMove);
      
      const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
      scramble.push(move + modifier);
      lastMove = move;
    }
    
    return scramble.join(' ');
  }

  private static generate2x2Scramble(): string {
    // Similar to 3x3 but shorter
    const moves = ['R', 'U', 'F'];
    const modifiers = ['', "'", '2'];
    const scramble: string[] = [];
    let lastMove = '';
    
    const moveCount = 9 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < moveCount; i++) {
      let move;
      do {
        move = moves[Math.floor(Math.random() * moves.length)];
      } while (move === lastMove);
      
      const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
      scramble.push(move + modifier);
      lastMove = move;
    }
    
    return scramble.join(' ');
  }
}

// Utility functions
export const formatScramble = (scrambleText: string): string => {
  if (!scrambleText) return '';
  
  // Add line breaks every 5 moves for better readability
  const moves = scrambleText.split(' ');
  const formatted: string[] = [];
  
  for (let i = 0; i < moves.length; i += 5) {
    formatted.push(moves.slice(i, i + 5).join(' '));
  }
  
  return formatted.join('\n');
};

export const getPuzzleDisplayName = (puzzleType: PuzzleType): string => {
  const displayNames = {
    [PuzzleType.CUBE_2X2]: '2x2x2 Cube',
    [PuzzleType.CUBE_3X3]: '3x3x3 Cube',
    [PuzzleType.CUBE_4X4]: '4x4x4 Cube',
    [PuzzleType.CUBE_5X5]: '5x5x5 Cube',
    [PuzzleType.CUBE_6X6]: '6x6x6 Cube',
    [PuzzleType.CUBE_7X7]: '7x7x7 Cube',
    [PuzzleType.PYRAMINX]: 'Pyraminx',
    [PuzzleType.MEGAMINX]: 'Megaminx',
    [PuzzleType.SKEWB]: 'Skewb',
    [PuzzleType.SQUARE_1]: 'Square-1',
    [PuzzleType.CLOCK]: 'Clock',
    [PuzzleType.ONE_HANDED]: '3x3 One-Handed',
    [PuzzleType.BLINDFOLDED]: '3x3 Blindfolded'
  };
  
  return displayNames[puzzleType] || puzzleType;
};

export default ScrambleService;

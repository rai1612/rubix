import axios from 'axios';

// Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  username: string;
  email: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

// API client setup
const api = axios.create({
  baseURL: '/api/auth',
  timeout: 10000,
});

// Auth Service
export class AuthService {
  private static readonly TOKEN_KEY = 'authToken';
  private static readonly USER_KEY = 'currentUser';

  /**
   * Login user and store token
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post('/login', credentials);
      const loginData = response.data;

      if (loginData.token) {
        this.setToken(loginData.token);
        this.setUser({
          id: loginData.userId,
          username: loginData.username,
          email: loginData.email
        });
      }

      return loginData;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Login failed');
    }
  }

  /**
   * Register new user
   */
  static async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error('Registration failed');
    }
  }

  /**
   * Logout user
   */
  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    // Clear axios auth header
    delete api.defaults.headers.common['Authorization'];
  }

  /**
   * Get current user info
   */
  static async getCurrentUser(): Promise<UserInfo> {
    try {
      const response = await api.get('/me');
      const user = response.data;
      this.setUser(user);
      return user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      this.logout(); // Clear invalid token
      throw new Error('Failed to get user info');
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Get stored auth token
   */
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Set auth token
   */
  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Get stored user info
   */
  static getUser(): UserInfo | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Set user info
   */
  static setUser(user: UserInfo): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Validate current token
   */
  static async validateToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await api.get('/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.valid;
    } catch (error) {
      return false;
    }
  }

  /**
   * Initialize auth service
   */
  static init(): void {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      this.logout(); // Clear expired token
    }
  }

  /**
   * Check if token is expired (basic check)
   */
  private static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() > expiry;
    } catch (error) {
      return true; // If we can't parse it, consider it expired
    }
  }

  /**
   * Demo login for development
   */
  static async demoLogin(): Promise<LoginResponse> {
    return this.login({
      username: 'demo_user',
      password: 'demo123'
    });
  }
}

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = AuthService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AuthService.logout();
      // Could redirect to login here
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Initialize on module load
AuthService.init();

export default AuthService;

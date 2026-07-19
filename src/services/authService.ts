import api from './apiService';
import {
  type AuthResponse,
  type LoginCredentials,
  type SignupCredentials,
  type AdminSignupCredentials,
  type ChangePasswordData,
  type ForgotPasswordData,
  type ResetPasswordData,
  type User,
} from '../types/auth.types';

class AuthService {
  private tokenKey = 'token';
  private userKey = 'user';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.success && response.data) {
      this.setToken(response.data.token);
      this.setUser(response.data.user);
    }
    return response;
  }

  async signup(data: SignupCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/user/signup', data);
    if (response.success && response.data) {
      this.setToken(response.data.token);
      this.setUser(response.data.user);
    }
    return response;
  }

  async adminSignup(data: AdminSignupCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/admin/signup', data);
    if (response.success && response.data) {
      this.setToken(response.data.token);
      this.setUser(response.data.user);
    }
    return response;
  }

  async changePassword(data: ChangePasswordData): Promise<AuthResponse> {
    return await api.post<AuthResponse>('/auth/change-password', data);
  }

  async forgotPassword(data: ForgotPasswordData): Promise<any> {
    return await api.post('/auth/forgot-password', data);
  }

  async resetPassword(data: ResetPasswordData): Promise<any> {
    return await api.post('/auth/reset-password', data);
  }

  async updateProfile(data: Partial<User>): Promise<AuthResponse> {
    const response = await api.put<AuthResponse>('/auth/profile', data);
    if (response.success && response.data) {
      this.setUser(response.data.user);
    }
    return response;
  }

  async getProfile(): Promise<AuthResponse> {
    return await api.get<AuthResponse>('/auth/profile');
  }

  async verifyToken(): Promise<AuthResponse> {
    return await api.get<AuthResponse>('/auth/verify-token');
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  hasRole(role: string | string[]): boolean {
    const user = this.getUser();
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isAffiliate(): boolean {
    return this.hasRole('affiliate');
  }

  isUser(): boolean {
    return this.hasRole('user');
  }
}

export default new AuthService();
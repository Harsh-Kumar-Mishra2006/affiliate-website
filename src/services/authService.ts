// services/authService.ts
import api from './apiService';
import {
  type AuthResponse,
  type LoginCredentials,
  type SignupCredentials,
  type ChangePasswordData,
  type ForgotPasswordData,
  type ResetPasswordData,
  type User,
  type UserListResponse,
  type AffiliateDetails,
} from '../types/auth.types';

class AuthService {
  private tokenKey = 'token';
  private userKey = 'user';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      if (response.success && response.data) {
        this.setToken(response.data.token);
        this.setUser(response.data.user);
        console.log('✅ Login successful for:', response.data.user.email);
      }
      return response;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  async signup(data: SignupCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/signup', data);
      if (response.success && response.data) {
        this.setToken(response.data.token);
        this.setUser(response.data.user);
        console.log(`✅ ${data.role} signup successful for:`, response.data.user.email);
      }
      return response;
    } catch (error) {
      console.error('❌ Signup error:', error);
      throw error;
    }
  }

  async changePassword(data: ChangePasswordData): Promise<AuthResponse> {
    try {
      return await api.post<AuthResponse>('/auth/change-password', data);
    } catch (error) {
      console.error('❌ Change password error:', error);
      throw error;
    }
  }

  async forgotPassword(data: ForgotPasswordData): Promise<any> {
    try {
      return await api.post('/auth/forgot-password', data);
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      throw error;
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<any> {
    try {
      return await api.post('/auth/reset-password', data);
    } catch (error) {
      console.error('❌ Reset password error:', error);
      throw error;
    }
  }

  async updateProfile(data: Partial<User>): Promise<AuthResponse> {
    try {
      const response = await api.put<AuthResponse>('/auth/profile', data);
      if (response.success && response.data) {
        this.setUser(response.data.user);
        console.log('✅ Profile updated for:', response.data.user.email);
      }
      return response;
    } catch (error) {
      console.error('❌ Update profile error:', error);
      throw error;
    }
  }

  async getProfile(): Promise<AuthResponse> {
    try {
      return await api.get<AuthResponse>('/auth/profile');
    } catch (error) {
      console.error('❌ Get profile error:', error);
      throw error;
    }
  }

  async verifyToken(): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        console.log('ℹ️ No token to verify');
        return {
          success: false,
          data: null as any,
          message: 'No token found'
        };
      }

      console.log('🔍 Verifying token...');
      const response = await api.get<AuthResponse>('/auth/verify-token');
      console.log('✅ Token verified successfully');
      return response;
    } catch (error: any) {
      console.error('❌ Verify token error:', error);
      
      if (error.response?.status === 401) {
        this.logout();
        console.log('🔒 Invalid token, cleared auth data');
      }
      
      throw error;
    }
  }

  // ============= ADMIN ROUTES =============

  // ✅ FIXED: Properly type the response
  async getAllUsers(params?: {
    role?: string;
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<UserListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }
      const response = await api.get<any>(`/auth/admin/users?${queryParams.toString()}`);
      // ✅ Ensure the response matches the expected type
      return {
        success: response.success || false,
        data: response.data || { users: [], summary: { totalUsers: 0, totalAdmins: 0, totalAffiliates: 0, totalCustomers: 0, activeUsers: 0, inactiveUsers: 0 }, pagination: { total: 0, page: 1, limit: 20, totalPages: 1 } }
      };
    } catch (error) {
      console.error('❌ Get all users error:', error);
      throw error;
    }
  }

  // ✅ FIXED: Properly type the response
  async getAffiliateDetails(id: number): Promise<{ success: boolean; data: AffiliateDetails }> {
    try {
      const response = await api.get<any>(`/auth/admin/affiliates/${id}/details`);
      return {
        success: response.success || false,
        data: response.data || null
      };
    } catch (error) {
      console.error('❌ Get affiliate details error:', error);
      throw error;
    }
  }

  // ✅ FIXED: Properly type the response
  async getDashboardStats(): Promise<{
    success: boolean;
    data: {
      recentUsers: User[];
      recentPurchases: any[];
      recentCommissions: any[];
    };
  }> {
    try {
      const response = await api.get<any>('/auth/admin/dashboard-stats');
      return {
        success: response.success || false,
        data: response.data || { recentUsers: [], recentPurchases: [], recentCommissions: [] }
      };
    } catch (error) {
      console.error('❌ Get dashboard stats error:', error);
      throw error;
    }
  }

  // ✅ FIXED: Properly type the response
  async bulkUpdateUsers(userIds: number[], action: string, data?: any): Promise<{
    success: boolean;
    data: { results: any[] };
    message: string;
  }> {
    try {
      const response = await api.post<any>('/auth/admin/users/bulk', {
        userIds,
        action,
        data
      });
      return {
        success: response.success || false,
        data: response.data || { results: [] },
        message: response.message || 'Bulk update completed'
      };
    } catch (error) {
      console.error('❌ Bulk update users error:', error);
      throw error;
    }
  }

  // ✅ FIXED: Properly type the response
  async exportUsersData(role?: string): Promise<{
    success: boolean;
    data: {
      users: any[];
      total: number;
      exportedAt: string;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (role && role !== 'all') {
        queryParams.append('role', role);
      }
      const response = await api.get<any>(`/auth/admin/users/export?${queryParams.toString()}`);
      return {
        success: response.success || false,
        data: response.data || { users: [], total: 0, exportedAt: new Date().toISOString() }
      };
    } catch (error) {
      console.error('❌ Export users data error:', error);
      throw error;
    }
  }

  // ============= AUTH UTILITIES =============

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    console.log('✅ Logged out successfully');
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
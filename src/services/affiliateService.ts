// src/services/affiliate.service.ts
import api from './apiService';
import { 
  type Affiliate, 
  type AddAffiliateData, 
  type AddAffiliateResponse,
  type UpdateAffiliateData,
  type AffiliateStats 
} from '../types/affiliate.types';

class AffiliateService {
  // Add new affiliate (Admin only)
  async addAffiliate(data: AddAffiliateData): Promise<AddAffiliateResponse> {
    return await api.post<AddAffiliateResponse>('/auth/admin/affiliates', data);
  }

  // Get all affiliates (Admin only)
  async getAffiliates(): Promise<{ success: boolean; data: Affiliate[] }> {
    return await api.get('/auth/admin/affiliates');
  }

  // Get affiliate by ID (Admin only)
  async getAffiliateById(id: number): Promise<{ success: boolean; data: Affiliate }> {
    return await api.get(`/auth/admin/users/${id}`);
  }

  // Update affiliate (Admin only)
  async updateAffiliate(id: number, data: UpdateAffiliateData): Promise<{ success: boolean; data: Affiliate }> {
    return await api.put(`/auth/admin/users/${id}`, data);
  }

  // Delete affiliate (Admin only)
  async deleteAffiliate(id: number): Promise<{ success: boolean; message: string }> {
    return await api.delete(`/auth/admin/users/${id}`);
  }

  // Reset affiliate password (Admin only)
  async resetAffiliatePassword(id: number): Promise<{ success: boolean; data: { temporaryPassword: string }; message: string }> {
    return await api.post(`/auth/admin/affiliates/${id}/reset-password`);
  }

  // Toggle affiliate status (Admin only)
  async toggleAffiliateStatus(id: number, isActive: boolean): Promise<{ success: boolean; data: Affiliate }> {
    return await api.put(`/auth/admin/users/${id}`, { isActive });
  }

  // In affiliate.service.ts
async getAffiliateStats(): Promise<{ success: boolean; data: AffiliateStats }> {
  try {
    return await api.get('/auth/admin/affiliates/stats');
  } catch (error) {
    console.error('Failed to fetch affiliate stats:', error);
    // Return default stats instead of throwing
    return {
      success: false,
      data: {
        totalAffiliates: 0,
        activeAffiliates: 0,
        inactiveAffiliates: 0,
        totalEarnings: 0,
        totalCommissions: 0,
        pendingCommissions: 0,
      }
    };
  }
}
  // Get affiliate's own profile (Affiliate only)
  async getAffiliateProfile(): Promise<{ success: boolean; data: { user: Affiliate; stats: any } }> {
    return await api.get('/auth/affiliate/profile');
  }

  // Update affiliate's own profile (Affiliate only)
  async updateOwnProfile(data: Partial<Affiliate>): Promise<{ success: boolean; data: Affiliate }> {
    return await api.put('/auth/profile', data);
  }
}

export default new AffiliateService();
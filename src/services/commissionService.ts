// services/commissionService.ts
import api from './apiService';
import {
  type Commission,
  type CommissionResponse,
  type CommissionFilters,
  type UpdateCommissionStatusData,
  type AdminCommissionSummaryResponse,
  type AffiliateCommissionSummaryResponse,
  type CommissionStatistics
} from '../types/commission,types';

class CommissionService {
  // ============= ADMIN ROUTES =============

  // Get all commissions with filters
  async getAllCommissions(filters: CommissionFilters = {}): Promise<CommissionResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    return await api.get<CommissionResponse>(`/admin/commissions?${params.toString()}`);
  }

  // Get commission by ID
  async getCommissionById(id: number): Promise<{ success: boolean; data: Commission }> {
    return await api.get(`/admin/commission/${id}`);
  }

  // Update commission status
  async updateCommissionStatus(
    id: number,
    data: UpdateCommissionStatusData
  ): Promise<{ success: boolean; data: Commission; message: string }> {
    return await api.put(`/admin/commission/${id}`, data);
  }

  // Get admin commission summary with analytics
  async getAdminCommissionSummary(period: string = 'all'): Promise<AdminCommissionSummaryResponse> {
    return await api.get<AdminCommissionSummaryResponse>(`/admin/commission-summary?period=${period}`);
  }

  // Get commission statistics for charts
  async getCommissionStatistics(period: string = 'month'): Promise<CommissionStatistics> {
    return await api.get<CommissionStatistics>(`/admin/commission-stats?period=${period}`);
  }

  // Export commission report
  async exportCommissionReport(startDate?: string, endDate?: string): Promise<{
    success: boolean;
    data: {
      commissions: any[];
      total: number;
      summary: {
        totalAmount: number;
        totalAffiliateCommission: number;
        totalAdminCommission: number;
      };
      exportedAt: Date;
      format: string;
    };
  }> {
    let url = '/admin/commission-export';
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    return await api.get(url);
  }

  // ============= AFFILIATE ROUTES =============

  // Get affiliate commission summary
  async getAffiliateCommissionSummary(period: string = 'all'): Promise<AffiliateCommissionSummaryResponse> {
    return await api.get<AffiliateCommissionSummaryResponse>(`/affiliate/commission-summary?period=${period}`);
  }

  // Get affiliate commissions list
  async getAffiliateCommissions(page: number = 1, limit: number = 20, status?: string): Promise<{
    success: boolean;
    data: {
      commissions: Commission[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
  }> {
    let url = `/affiliate/commissions?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return await api.get(url);
  }

  // Get affiliate commission statistics
  async getAffiliateCommissionStats(period: string = 'month'): Promise<{
    success: boolean;
    data: {
      monthlyData: Array<{
        month: string;
        totalCommission: number;
      }>;
      statusDistribution: Array<{
        status: string;
        count: number;
        totalAmount: number;
      }>;
      productPerformance: Array<{
        productId: number;
        salesCount: number;
        totalEarnings: number;
        Product: {
          id: number;
          name: string;
          company: string;
        };
      }>;
    };
  }> {
    return await api.get(`/affiliate/commission-stats?period=${period}`);
  }
}

export default new CommissionService();
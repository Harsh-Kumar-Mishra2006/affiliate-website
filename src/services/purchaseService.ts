import api from './apiService';
import {
  type Purchase,
  type InitiatePurchaseData,
  type InitiatePurchaseResponse,
  type UploadPaymentData,
  type PurchaseResponse
} from '../types/purchase.types';

class PurchaseService {
  // User: Initiate purchase
  async initiatePurchase(data: InitiatePurchaseData): Promise<InitiatePurchaseResponse> {
    return await api.post<InitiatePurchaseResponse>('/purchase/initiate', data);
  }

  // User: Upload payment screenshot
  async uploadPayment(data: UploadPaymentData): Promise<{ success: boolean; data: Purchase; message: string }> {
    const formData = new FormData();
    formData.append('orderId', data.orderId);
    formData.append('screenshot', data.screenshot);
    if (data.paymentNotes) {
      formData.append('paymentNotes', data.paymentNotes);
    }

    return await api.post('/purchase/upload-payment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // User: Get my purchases
  async getMyPurchases(page: number = 1, limit: number = 10, status?: string): Promise<PurchaseResponse> {
    let url = `/purchase/my-purchases?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    return await api.get<PurchaseResponse>(url);
  }

  // User: Get purchase details
  async getPurchaseDetails(orderId: string): Promise<{ success: boolean; data: Purchase }> {
    return await api.get(`/purchase/${orderId}`);
  }

  // Admin: Get all purchases
  async getAllPurchases(page: number = 1, limit: number = 20, filters?: any): Promise<{
    success: boolean;
    data: {
      purchases: Purchase[];
      summary: any;
      pagination: any;
    };
  }> {
    let url = `/admin/purchases?page=${page}&limit=${limit}`;
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          url += `&${key}=${value}`;
        }
      });
    }
    return await api.get(url);
  }

  // Admin: Verify payment
  async verifyPayment(orderId: string, status: 'verified' | 'rejected', verificationNotes?: string): Promise<{
    success: boolean;
    data: Purchase;
    message: string;
  }> {
    return await api.put(`/admin/purchase/${orderId}/verify`, {
      status,
      verificationNotes
    });
  }

  // Admin: Get purchase by ID
  async getPurchaseById(id: number): Promise<{ success: boolean; data: Purchase }> {
    return await api.get(`/admin/purchase/${id}`);
  }

   // ============ AFFILIATE ROUTES ============
  
  async getAffiliatePurchases(
    page: number = 1,
    limit: number = 20,
    filters?: {
      paymentStatus?: string;
      status?: string;
      search?: string;
    }
  ): Promise<{
    success: boolean;
    data: {
      purchases: Purchase[];
      summary: {
        total: number;
        pending: number;
        verified: number;
        rejected: number;
        completed: number;
        totalRevenue: number;
        totalAffiliateCommission: number;
        totalAdminCommission: number;
        pendingCommission: number;
        paidCommission: number;
      };
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          queryParams.append(key, value);
        }
      });
    }
    return await api.get(`/affiliate/purchases?${queryParams.toString()}`);
  }

  async getAffiliateCommissionSummary(): Promise<{
    success: boolean;
    data: {
      summary: {
        totalEarnings: number;
        approved: number;
        paid: number;
        pending: number;
        rejected: number;
        totalOrders: number;
        approvedOrders: number;
        paidOrders: number;
        pendingOrders: number;
        totalProducts: number;
      };
      monthlyData: Array<{
        month: string;
        earnings: number;
        orders: number;
      }>;
      commissions: any[];
    };
  }> {
    return await api.get('/affiliate/commission-summary');
  }
}

export default new PurchaseService();
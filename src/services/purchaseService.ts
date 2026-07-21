import api from './api.service';
import {
  Purchase,
  InitiatePurchaseData,
  InitiatePurchaseResponse,
  UploadPaymentData,
  PurchaseResponse
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
}

export default new PurchaseService();
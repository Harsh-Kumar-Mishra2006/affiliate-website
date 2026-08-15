// services/productService.ts
import api from './apiService';
import { type Product, type ProductResponse, type ProductFilters, type AddProductData } from '../types/product.types';

class ProductService {
  // ============ PUBLIC ROUTES ============
  
  async getProducts(filters: ProductFilters = {}): Promise<ProductResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    return await api.get<ProductResponse>(`/products?${params.toString()}`);
  }

  async getProduct(id: string | number): Promise<{ success: boolean; data: Product }> {
    return await api.get(`/products/${id}`);
  }

  async getFeaturedProducts(limit: number = 10): Promise<{ success: boolean; data: Product[] }> {
    return await api.get(`/products/featured?limit=${limit}`);
  }

  async getProductsByCategory(categorySlug: string, page: number = 1, limit: number = 20): Promise<ProductResponse> {
    return await api.get(`/products/category/${categorySlug}?page=${page}&limit=${limit}`);
  }

  async searchProducts(query: string, page: number = 1, limit: number = 20): Promise<ProductResponse> {
    return await api.get(`/products/search?q=${query}&page=${page}&limit=${limit}`);
  }

  // ============ ADMIN: Add Admin's Own Product ============
  async addAdminProduct(data: FormData): Promise<{ success: boolean; data: Product; message: string }> {
    return await api.post('/admin/products/add', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // ============ ADMIN: Add Affiliate Product ============
  async addAffiliateProduct(data: FormData): Promise<{ success: boolean; data: Product; message: string }> {
    return await api.post('/admin/products/add-affiliate', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // ✅ Update product with file upload (Admin & Affiliate)
  async updateProduct(id: string | number, data: FormData): Promise<{ success: boolean; data: Product }> {
    return await api.put(`/products/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // ============ ADMIN ONLY ROUTES ============
  
  async getAdminProducts(params?: { page?: number; limit?: number; showInactive?: boolean; type?: 'admin' | 'affiliate' }): Promise<{
    success: boolean;
    data: {
      products: Product[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return await api.get(`/admin/products?${queryParams.toString()}`);
  }

  async deleteProduct(id: string | number): Promise<{ success: boolean; message: string }> {
    return await api.delete(`/products/${id}`);
  }

  async getProductStats(): Promise<{ success: boolean; data: any }> {
    return await api.get('/admin/products/stats');
  }

  async bulkUploadProducts(products: AddProductData[]): Promise<{ success: boolean; data: any }> {
    return await api.post('/admin/products/bulk', { products });
  }

  async getAdminCommissionProducts(params?: { page?: number; limit?: number }): Promise<{
    success: boolean;
    data: {
      products: Product[];
      stats: {
        totalAffiliateProducts: number;
        totalAdminCommission: number;
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
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return await api.get(`/admin/products/affiliate?${queryParams.toString()}`);
  }

  // ============ AFFILIATE ROUTES ============

  async getAffiliateProducts(params?: { page?: number; limit?: number }): Promise<{
    success: boolean;
    data: {
      products: Product[];
      stats?: {
        totalProducts: number;
        totalCommissionEarned: number;
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
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    return await api.get(`/affiliate/products?${queryParams.toString()}`);
  }

  async getAffiliateStats(): Promise<{
    success: boolean;
    data: {
      totalProducts: number;
      totalCommissionEarned: number;
    };
  }> {
    return await api.get('/affiliate/products/stats');
  }
}

export default new ProductService();
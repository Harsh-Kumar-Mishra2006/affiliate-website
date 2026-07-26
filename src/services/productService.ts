import api from './apiService';
import { type Product, type ProductResponse, type ProductFilters, type AddProductData } from '../types/product.types';

class ProductService {
  // ============ PUBLIC ROUTES (Anyone can view) ============
  
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

  // ============ ADMIN ONLY ROUTES ============
  
  // ✅ Create product (Admin only)
  async createProduct(data: AddProductData): Promise<{ success: boolean; data: Product; message: string }> {
    return await api.post('/products', data);
  }

  // ✅ Get all products including inactive (Admin only)
  async getAdminProducts(params?: { page?: number; limit?: number; showInactive?: boolean }): Promise<{
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

  // ✅ Update product (Admin only)
  async updateProduct(id: string | number, data: Partial<Product>): Promise<{ success: boolean; data: Product }> {
    return await api.put(`/products/${id}`, data);
  }

  // ✅ Delete product (Admin only)
  async deleteProduct(id: string | number): Promise<{ success: boolean; message: string }> {
    return await api.delete(`/products/${id}`);
  }

  // ✅ Get product statistics (Admin only)
  async getProductStats(): Promise<{ success: boolean; data: any }> {
    return await api.get('/products/stats');
  }

  // ✅ Bulk upload products (Admin only)
  async bulkUploadProducts(products: AddProductData[]): Promise<{ success: boolean; data: any }> {
    return await api.post('/products/bulk', { products });
  }

  // In productService.ts, add this method after your existing methods:

// ============ AFFILIATE ROUTES ============

// ✅ Get affiliate products (Affiliate users only)
async getAffiliateProducts(params?: { page?: number; limit?: number }): Promise<{
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
  return await api.get(`/affiliate/products?${queryParams.toString()}`);
}

// ✅ Get affiliate product stats (Affiliate users only)
async getAffiliateStats(): Promise<{
  success: boolean;
  data: {
    total: number;
    active: number;
    inactive: number;
    totalRevenue: number;
  };
}> {
  return await api.get('/affiliate/products/stats');
}
}

export default new ProductService();
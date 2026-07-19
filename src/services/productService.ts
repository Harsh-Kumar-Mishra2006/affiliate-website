import api from './apiService';
import { type Product, type ProductResponse, type ProductFilters } from '../types/product.types';

class ProductService {
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

  async createProduct(data: Partial<Product>): Promise<{ success: boolean; data: Product }> {
    return await api.post('/products', data);
  }

  async updateProduct(id: string | number, data: Partial<Product>): Promise<{ success: boolean; data: Product }> {
    return await api.put(`/products/${id}`, data);
  }

  async deleteProduct(id: string | number): Promise<{ success: boolean; message: string }> {
    return await api.delete(`/products/${id}`);
  }

  async getAffiliateProducts(affiliateId?: string | number): Promise<{ success: boolean; data: { products: Product[]; pagination: any } }> {
    const url = affiliateId ? `/affiliate/products/${affiliateId}` : '/affiliate/products';
    return await api.get(url);
  }

  async getProductStats(): Promise<{ success: boolean; data: any }> {
    return await api.get('/products/stats');
  }

  async bulkUploadProducts(products: Partial<Product>[]): Promise<{ success: boolean; data: any }> {
    return await api.post('/products/bulk', { products });
  }
}

export default new ProductService();
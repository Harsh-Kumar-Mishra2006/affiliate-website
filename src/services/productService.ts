import api from './apiService';
import { type Product, type ProductResponse, type ProductFilters, type AddProductData } from '../types/product.types';

class ProductService {
  // Get all products (public)
  async getProducts(filters: ProductFilters = {}): Promise<ProductResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    return await api.get<ProductResponse>(`/products?${params.toString()}`);
  }

  // Get single product
  async getProduct(id: string | number): Promise<{ success: boolean; data: Product }> {
    return await api.get(`/products/${id}`);
  }

  // Get featured products
  async getFeaturedProducts(limit: number = 10): Promise<{ success: boolean; data: Product[] }> {
    return await api.get(`/products/featured?limit=${limit}`);
  }

  // Get products by category
  async getProductsByCategory(categorySlug: string, page: number = 1, limit: number = 20): Promise<ProductResponse> {
    return await api.get(`/products/category/${categorySlug}?page=${page}&limit=${limit}`);
  }

  // Search products
  async searchProducts(query: string, page: number = 1, limit: number = 20): Promise<ProductResponse> {
    return await api.get(`/products/search?q=${query}&page=${page}&limit=${limit}`);
  }

  // ============ AFFILIATE ROUTES ============
  
  // Create product (Affiliate/Admin only)
  async createProduct(data: AddProductData): Promise<{ success: boolean; data: Product; message: string }> {
    return await api.post('/products', data);
  }

  // Get affiliate's products (Affiliate/Admin only)
  async getAffiliateProducts(affiliateId?: string | number): Promise<{ success: boolean; data: { products: Product[]; pagination: any } }> {
    const url = affiliateId ? `/affiliate/products/${affiliateId}` : '/affiliate/products';
    return await api.get(url);
  }

  // Update product (Affiliate can update own, Admin can update any)
  async updateProduct(id: string | number, data: Partial<Product>): Promise<{ success: boolean; data: Product }> {
    return await api.put(`/products/${id}`, data);
  }

  // Delete product (Affiliate can delete own, Admin can delete any)
  async deleteProduct(id: string | number): Promise<{ success: boolean; message: string }> {
    return await api.delete(`/products/${id}`);
  }

  // Get product statistics (Affiliate/Admin only)
  async getProductStats(): Promise<{ success: boolean; data: any }> {
    return await api.get('/products/stats');
  }

  // Bulk upload products (Affiliate/Admin only)
  async bulkUploadProducts(products: AddProductData[]): Promise<{ success: boolean; data: any }> {
    return await api.post('/products/bulk', { products });
  }
}

export default new ProductService();
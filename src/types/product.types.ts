// types/product.types.ts

// ✅ SINGLE Product interface definition - ONLY ONCE
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  serviceId?: string;
  company: string;
  categoryId: number;
  brand?: string;
  sku: string;
  stock: number;
  rating: number;
  reviews: number;
  affiliateUrl?: string;
  images: string[];
  mainImage?: string;
  tags: string[];
  specifications: Record<string, any>;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  addedBy: number;
  addedByRole?: 'admin' | 'affiliate';
  commissionRate?: number;
  affiliateEmail?: string;
  adminCommissionShare?: number;
  totalCommissionEarned?: number;
  purchaseCount?: number;
  totalRevenue?: number;
  createdAt: string;
  updatedAt: string;
  Category?: {
    id: number;
    name: string;
    slug: string;
  };
  // ✅ Added affiliateId to match the actual response from backend
  addedByUser?: {
    id: number;
    name: string;
    email: string;
    role: string;
    affiliateId?: string;
  };
}

// ✅ Base interface for adding products
export interface AddProductData {
  name: string;
  productId: string;
  price: number;
  company: string;
  category: string;
  description?: string;
  shortDescription?: string;
  serviceId?: string;
  brand?: string;
  sku?: string;
  stock?: number;
  affiliateUrl?: string;
  images?: string[];
  mainImage?: string;
  tags?: string[];
  specifications?: Record<string, any>;
  metaTitle?: string;
  metaDescription?: string;
  commissionRate?: number;
}

// ✅ For Admin's Own Product
export interface AddAdminProductData {
  name: string;
  productId: string;
  price: number;
  company: string;
  category: string;
  description?: string;
  shortDescription?: string;
  serviceId?: string;
  brand?: string;
  sku?: string;
  stock?: number;
  images?: string[];
  mainImage?: string;
  tags?: string[];
  specifications?: Record<string, any>;
  metaTitle?: string;
  metaDescription?: string;
}

// ✅ For Affiliate Product (Admin adds on behalf of affiliate)
export interface AddAffiliateProductData extends AddAdminProductData {
  affiliateId: number;          // The affiliate who suggested this product
  affiliateUrl: string;         // Affiliate's referral URL (required)
  commissionRate: number;       // Admin's commission rate (10-25%)
}

// ✅ Affiliate type for dropdown
export interface Affiliate {
  id: number;
  name: string;
  email: string;
  affiliateId: string;
  commissionRate: number;
  isActive: boolean;
}

export interface ProductResponse {
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
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  company?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  addedByRole?: 'admin' | 'affiliate';
}
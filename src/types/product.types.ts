// types/product.types.ts

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
  isMaster?: boolean;
  status?: 'draft' | 'pending' | 'active' | 'inactive';
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
  addedByUser?: {
    id: number;
    name: string;
    email: string;
    role: string;
    affiliateId?: string;
  };
}

// ✅ For Admin's Master Product (Draft)
export interface AddMasterProductData {
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
  images?: File[];
  mainImage?: string;
  tags?: string[];
  specifications?: Record<string, any>;
  metaTitle?: string;
  metaDescription?: string;
}

// ✅ For Affiliate to select and add product - ONLY these fields are needed
// The backend will use masterProductId to fetch the product data
export interface AddAffiliateProductData {
  masterProductId: number;   // ID of the master product to select
  affiliateUrl: string;       // Affiliate's referral URL
  commissionRate: number;     // Commission rate (10-25%)
}

// ✅ For displaying available master products to affiliates
export interface AvailableMasterProduct extends Product {
  isMaster: true;
  status: 'draft';
}

// ✅ For displaying affiliate's own products
export interface AffiliateProduct extends Product {
  addedByRole: 'affiliate';
  commissionRate: number;
  affiliateUrl: string;
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
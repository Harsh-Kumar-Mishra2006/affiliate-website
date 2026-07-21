export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountedPrice?: number;
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
  };
}

export interface AddProductData {
  name: string;
  productId: string;
  price: number;
  company: string;
  category: string;
  description?: string;
  shortDescription?: string;
  discountedPrice?: number;
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
}
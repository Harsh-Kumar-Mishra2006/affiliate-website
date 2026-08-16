// types/purchase.types.ts


// ✅ Commission type
export interface Commission {
  id: number;
  affiliateId: number | null;
  adminId: number;
  productId: number;
  purchaseId: number;
  orderId: string;
  affiliateCommissionAmount: number;
  affiliateCommissionRate: number;
  adminCommissionAmount: number;
  adminCommissionRate: number;
  totalAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  paymentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  Affiliate?: {
    id: number;
    name: string;
    email: string;
    affiliateId: string;
  };
  Admin?: {
    id: number;
    name: string;
    email: string;
  };
  Product?: {
    id: number;
    name: string;
    mainImage?: string;
  };
  Purchase?: Purchase;
}

export interface Purchase {
  id: number;
  userId: number;
  productId: number;
  affiliateId?: number;
  orderId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  totalAmount: number;
  commissionAmount: number;
  commissionRate: number;
  adminCommissionAmount: number;
  adminCommissionRate: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'verified' | 'rejected';
  paymentScreenshot?: {
    public_id: string;
    url: string;
    originalName: string;
    size: number;
    format?: string;
    width?: number;
    height?: number;
    uploadedAt?: string;
  };
  paymentVerifiedBy?: number;
  paymentVerifiedAt?: string;
  paymentNotes?: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  shippingAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  Product?: {
    id: number;
    name: string;
    mainImage: string;
    company: string;
    price: number;
    addedByRole?: 'admin' | 'affiliate';
  };
  affiliate?: {
    id: number;
    name: string;
    email: string;
    affiliateId: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  paymentVerifiedByUser?: {
    id: number;
    name: string;
    email: string;
  };
   Commission?: {
    id: number;
    affiliateId: number;
    adminId: number;
    productId: number;
    purchaseId: number;
    orderId: string;
    affiliateCommissionAmount: number;
    affiliateCommissionRate: number;
    adminCommissionAmount: number;
    adminCommissionRate: number;
    totalAmount: number;
    status: 'pending' | 'approved' | 'paid' | 'rejected';
    paymentDate?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface InitiatePurchaseData {
  productId: number;
  quantity?: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  shippingAddress?: string;
  notes?: string;
}

export interface InitiatePurchaseResponse {
  success: boolean;
  data: {
    purchase: Purchase;
    orderId: string;
    totalAmount: number;
    commissionRate: number;
    commissionAmount: number;
    adminCommissionAmount: number;
    productOwner: 'admin' | 'affiliate';
    paymentInstructions: {
      upiId: string;
      bankDetails: {
        bankName: string;
        accountNumber: string;
        ifscCode: string;
        accountHolder: string;
      };
      amount: number;
      affiliateInfo?: {
        name: string;
        email: string;
        commissionRate: number;
        commissionAmount: number;
      };
    };
  };
  message: string;
}


export interface UploadPaymentData {
  orderId: string;
  screenshot: File;
  paymentNotes?: string;
}

export interface PurchaseResponse {
  success: boolean;
  data: {
    purchases: Purchase[];
    summary: {
      total: number;
      pending: number;
      verified: number;
      completed: number;
      rejected: number;
    };
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface PurchaseFilters {
  page?: number;
  limit?: number;
  paymentStatus?: string;
  status?: string;
  productOwner?: string;
  search?: string;
}

// ✅ Commission Summary Types
export interface CommissionSummary {
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
}

export interface MonthlyCommissionData {
  month: string;
  earnings: number;
  orders: number;
}

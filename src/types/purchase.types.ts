// types/purchase.types.ts
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
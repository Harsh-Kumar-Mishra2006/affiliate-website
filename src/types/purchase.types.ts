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
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'verified' | 'rejected';
  paymentScreenshot?: {
    public_id: string;
    url: string;
    originalName: string;
    size: number;
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
  };
  affiliate?: {
    id: number;
    name: string;
    email: string;
    affiliateId: string;
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
    paymentInstructions: {
      upiId: string;
      bankDetails: {
        bankName: string;
        accountNumber: string;
        ifscCode: string;
        accountHolder: string;
      };
      amount: number;
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
    };
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
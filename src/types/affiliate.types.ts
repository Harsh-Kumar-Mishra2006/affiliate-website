// src/types/affiliate.types.ts

export interface Affiliate {
  id: number;
  name: string;
  email: string;
  username: string;
  phone: string;
  role: 'affiliate';
  isActive: boolean;
  isEmailApproved: boolean;
  needsPasswordChange: boolean;
  affiliateId: string;
  commissionRate: number;
  totalEarnings: number;
  availableBalance: number;
  paymentMethod?: 'bank' | 'paypal' | 'upi' | null;
  paymentDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    paypalEmail?: string;
    upiId?: string;
  };
  addedBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddAffiliateData {
  name: string;
  email: string;
  username: string;
  phone: string;
  commissionRate?: number;
  paymentMethod?: string;
  paymentDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    paypalEmail?: string;
    upiId?: string;
  };
}

export interface AddAffiliateResponse {
  success: boolean;
  data: {
    user: Affiliate;
    temporaryPassword: string;
  };
  message: string;
}

export interface UpdateAffiliateData {
  name?: string;
  email?: string;
  username?: string;
  phone?: string;
  isActive?: boolean;
  commissionRate?: number;
  paymentMethod?: string;
  paymentDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    paypalEmail?: string;
    upiId?: string;
  };
}

export interface AffiliateStats {
  totalAffiliates: number;
  activeAffiliates: number;
  inactiveAffiliates: number;
  totalEarnings: number;
  totalCommissions: number;
  pendingCommissions: number;
}
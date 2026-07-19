export interface UserProfile {
  id: number;
  name: string;
  email: string;
  username: string;
  phone: string;
  role: 'admin' | 'affiliate' | 'user';
  isActive: boolean;
  isEmailApproved: boolean;
  lastLogin?: string;
  loginCount: number;
  needsPasswordChange: boolean;
  affiliateId?: string;
  commissionRate?: number;
  totalEarnings?: number;
  availableBalance?: number;
  paymentMethod?: string;
  paymentDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    paypalEmail?: string;
    upiId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  paymentMethod?: string;
  paymentDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    paypalEmail?: string;
    upiId?: string;
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}
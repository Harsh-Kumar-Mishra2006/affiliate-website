// types/auth.types.ts
export interface User {
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
  paymentDetails?: any;
  createdAt: string;
  updatedAt: string;
  addedBy?: number;
  addedByUser?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface UserWithStats extends User {
  stats?: {
    totalProducts?: number;
    totalCommissions?: number;
    pendingCommissions?: number;
    approvedCommissions?: number;
    paidCommissions?: number;
    totalEarnings?: number;
    availableBalance?: number;
    totalAdminCommissions?: number;
    totalPurchases?: number;
    totalRevenue?: number;
  };
}

export interface AffiliateDetails extends User {
  stats: {
    products: {
      total: number;
      active: number;
      inactive: number;
    };
    purchases: {
      total: number;
      revenue: number;
    };
    commissions: {
      total: number;
      pending: number;
      approved: number;
      paid: number;
      rejected: number;
    };
    links: {
      total: number;
      totalClicks: number;
      uniqueClicks: number;
      conversions: number;
      totalCommission: number;
    };
    earnings: {
      totalEarnings: number;
      availableBalance: number;
    };
  };
  recentPurchases: any[];
  recentCommissions: any[];
  products: any[];
}

export interface UserListResponse {
  success: boolean;
  data: {
    users: UserWithStats[];
    summary: {
      totalUsers: number;
      totalAdmins: number;
      totalAffiliates: number;
      totalCustomers: number;
      activeUsers: number;
      inactiveUsers: number;
    };
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    needsPasswordChange: boolean;
    user: User;
  };
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  username: string;
  phone: string;
  password: string;
  role: 'admin' | 'affiliate' | 'user';
  commissionRate?: number;
  paymentMethod?: string;
  paymentDetails?: any;
}

// ✅ ADD THIS BACK
export interface AdminSignupCredentials extends SignupCredentials {
  // Admin-specific fields can be added here if needed
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

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsPasswordChange: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  signup: (data: SignupCredentials) => Promise<void>;
  adminSignup: (data: AdminSignupCredentials) => Promise<void>; // ✅ ADD THIS
  changePassword: (data: ChangePasswordData) => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAdmin: () => boolean;
  isAffiliate: () => boolean;
  isUser: () => boolean;
  hasRole: (role: string | string[]) => boolean;
}
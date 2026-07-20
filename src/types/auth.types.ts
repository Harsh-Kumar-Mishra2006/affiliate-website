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
}

export interface AdminSignupCredentials extends SignupCredentials {}

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
  adminSignup: (data: AdminSignupCredentials) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  // Add these helper methods
  isAdmin: () => boolean;
  isAffiliate: () => boolean;
  isUser: () => boolean;
  hasRole: (role: string | string[]) => boolean;
}
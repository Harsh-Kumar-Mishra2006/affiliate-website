// context/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import {
  type AuthContextType,
  type User,
  type LoginCredentials,
  type SignupCredentials,
  type AdminSignupCredentials,
  type ChangePasswordData,
  type ForgotPasswordData,
  type ResetPasswordData,
} from "../types/auth.types";
import authService from "../services/authService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [needsPasswordChange, setNeedsPasswordChange] =
    useState<boolean>(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = authService.getToken();
        const storedUser = authService.getUser();

        console.log("🔍 Initializing auth...", {
          hasToken: !!storedToken,
          hasUser: !!storedUser,
        });

        if (storedToken && storedUser) {
          try {
            // Verify token with server
            const response = await authService.verifyToken();
            console.log("✅ Token verification response:", response);

            if (response.success) {
              setToken(storedToken);
              setUser(storedUser);
              setNeedsPasswordChange(
                response.data?.needsPasswordChange || false,
              );
              console.log("✅ User authenticated:", storedUser.name);
            } else {
              console.log("⚠️ Token verification failed, logging out");
              authService.logout();
            }
          } catch (error: any) {
            console.error("❌ Token verification error:", error);
            // Only logout if it's a 401 error
            if (error.response?.status === 401) {
              authService.logout();
            }
          }
        } else {
          console.log("ℹ️ No stored credentials found");
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      if (response.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        setNeedsPasswordChange(response.data.needsPasswordChange || false);
        toast.success(response.message || "Login successful!");
        return;
      }
      throw new Error(response.message || "Login failed");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Login failed. Please try again.";
      toast.error(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup
  const signup = async (data: SignupCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.signup(data);
      if (response.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        setNeedsPasswordChange(response.data.needsPasswordChange || false);
        toast.success(response.message || "Account created successfully!");
        return;
      }
      throw new Error(response.message || "Signup failed");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Signup failed. Please try again.";
      toast.error(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Admin Signup
  const adminSignup = async (data: AdminSignupCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.adminSignup(data);
      if (response.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        setNeedsPasswordChange(response.data.needsPasswordChange || false);
        toast.success(
          response.message || "Admin account created successfully!",
        );
        return;
      }
      throw new Error(response.message || "Admin signup failed");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Admin signup failed. Please try again.";
      toast.error(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Change Password
  const changePassword = async (data: ChangePasswordData) => {
    try {
      setIsLoading(true);
      const response = await authService.changePassword(data);
      if (response.success) {
        setNeedsPasswordChange(false);
        toast.success(response.message || "Password changed successfully!");
        return;
      }
      throw new Error(response.message || "Password change failed");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to change password.";
      toast.error(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password
  const forgotPassword = async (data: ForgotPasswordData) => {
    try {
      setIsLoading(true);
      const response = await authService.forgotPassword(data);
      if (response.success) {
        toast.success(
          response.message || "Password reset link sent to your email!",
        );
        return;
      }
      throw new Error(response.message || "Forgot password failed");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to send reset link.";
      toast.error(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Password
  const resetPassword = async (data: ResetPasswordData) => {
    try {
      setIsLoading(true);
      const response = await authService.resetPassword(data);
      if (response.success) {
        toast.success(response.message || "Password reset successfully!");
        return;
      }
      throw new Error(response.message || "Reset password failed");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to reset password.";
      toast.error(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update Profile
  const updateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      const response = await authService.updateProfile(data);
      if (response.success) {
        setUser(response.data.user);
        toast.success(response.message || "Profile updated successfully!");
        return;
      }
      throw new Error(response.message || "Profile update failed");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to update profile.";
      toast.error(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setNeedsPasswordChange(false);
    toast.success("Logged out successfully");
  };

  // Helper methods
  const isAdmin = (): boolean => {
    return user?.role === "admin";
  };

  const isAffiliate = (): boolean => {
    return user?.role === "affiliate";
  };

  const isUser = (): boolean => {
    return user?.role === "user";
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    needsPasswordChange,
    login,
    logout,
    signup,
    adminSignup,
    changePassword,
    forgotPassword,
    resetPassword,
    updateProfile,
    isAdmin,
    isAffiliate,
    isUser,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ✅ Fix: Only export useAuth as a hook, not as a default
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Export the context for advanced use cases
export default AuthContext;

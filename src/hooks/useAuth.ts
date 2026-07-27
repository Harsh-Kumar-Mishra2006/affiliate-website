// hooks/useAuth.ts
// ✅ This file should only re-export the hook from AuthContext
// to avoid duplicate definitions

import { useAuth as useAuthFromContext } from '../context/AuthContext';
import { type AuthContextType } from '../types/auth.types';

// Re-export the hook from AuthContext
export const useAuth = (): AuthContextType => {
  return useAuthFromContext();
};

// Additional utility hooks
export const useUser = () => {
  const { user } = useAuth();
  return user;
};

export const useIsAuthenticated = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};

export const useHasRole = (role: string | string[]) => {
  const { user } = useAuth();
  if (!user) return false;
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  return user.role === role;
};

export const useIsAdmin = () => {
  return useHasRole('admin');
};

export const useIsAffiliate = () => {
  return useHasRole('affiliate');
};

export const useIsUser = () => {
  return useHasRole('user');
};

// Default export for convenience
export default useAuth;
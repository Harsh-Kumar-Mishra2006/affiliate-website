import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { type AuthContextType } from '../types/auth.types';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
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

export default useAuth;
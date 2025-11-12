import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { 
  useLogin, 
  useRegister, 
  useLogout,
  useRefreshUser 
} from '@/hooks/useAuthQuery';
import { LoginRequest, RegisterRequest, User } from '@/types';

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export const useAuth = () => {
  const { user, isLoading, isAuthenticated, initialized } = useAuthContext();
  const router = useRouter();
  
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const refreshUserMutation = useRefreshUser();

  const login = useCallback(async (credentials: LoginRequest): Promise<AuthResult> => {
    try {
      await loginMutation.mutateAsync(credentials);
      return { success: true, user: loginMutation.data?.user };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || 'Giriş yapılırken hata oluştu';
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }, [loginMutation]);

  const register = useCallback(async (userData: RegisterRequest): Promise<AuthResult> => {
    try {
      await registerMutation.mutateAsync(userData);
      return { success: true, user: registerMutation.data?.user };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || 'Kayıt olurken hata oluştu';
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }, [registerMutation]);

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
      
      // Force immediate redirect after successful logout
      window.location.href = '/login';
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
      
      // Force immediate redirect even on error
      window.location.href = '/login';
    }
  }, [logoutMutation]);

  const refreshProfile = useCallback(async (): Promise<AuthResult> => {
    try {
      const user = await refreshUserMutation.mutateAsync();
      return { success: true, user };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || 'Profil güncellenirken hata oluştu';
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }, [refreshUserMutation]);

  const redirectToDashboard = useCallback(() => {
    if (user) {
      const dashboardPath = `/${user.role.toLowerCase()}`;
      router.push(dashboardPath);
    }
  }, [user, router]);

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    isInitialized: initialized,
    login,
    register,
    logout,
    refreshProfile,
    redirectToDashboard,
    // Mutation states for more granular loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
};
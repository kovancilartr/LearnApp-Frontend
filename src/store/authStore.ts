import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, ApiError, LoginRequest, RegisterRequest } from "@/types";
import { apiClient } from "@/lib/api";
import { authService } from "@/lib/services";

interface AuthState {
  // Data
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;

  // State flags
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  isLoggingOut: boolean;
  isUpdatingProfile: boolean;

  // Error state
  error: ApiError | null;

  // Basic setters
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setError: (error: ApiError | null) => void;
  clearError: () => void;

  // Auth actions
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      isLoggingIn: false,
      isRegistering: false,
      isLoggingOut: false,
      isUpdatingProfile: false,
      error: null,

      // Basic setters
      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          error: null,
        });

        // Update localStorage and API client
        try {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          apiClient.setAuthToken(accessToken);
        } catch (error) {
          // Ignore localStorage errors in SSR
        }
      },

      setUser: (user) => {
        set({ user });
      },

      setTokens: (accessToken, refreshToken) => {
        const updates: Partial<AuthState> = { accessToken };
        if (refreshToken) {
          updates.refreshToken = refreshToken;
        }
        set(updates);

        // Update localStorage and API client
        try {
          localStorage.setItem("accessToken", accessToken);
          if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
          }
          apiClient.setAuthToken(accessToken);
        } catch (error) {
          // Ignore localStorage errors in SSR
        }
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setInitialized: (initialized) => {
        set({ isInitialized: initialized });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Auth actions
      login: async (credentials) => {
        set({ isLoggingIn: true, error: null });
        try {
          const response = await authService.login(credentials);
          const { user, accessToken, refreshToken } = response;

          get().setAuth(user, accessToken, refreshToken);
          set({ isLoggingIn: false });
          return true;
        } catch (error: any) {
          set({
            error: error.response?.data || {
              success: false,
              error: {
                code: "LOGIN_ERROR",
                message: "Giriş yapılırken hata oluştu",
              },
              timestamp: new Date().toISOString(),
            },
            isLoggingIn: false,
          });
          return false;
        }
      },

      register: async (userData) => {
        set({ isRegistering: true, error: null });
        try {
          const response = await authService.register(userData);
          const { user, accessToken, refreshToken } = response;

          get().setAuth(user, accessToken, refreshToken);
          set({ isRegistering: false });
          return true;
        } catch (error: any) {
          set({
            error: error.response?.data || {
              success: false,
              error: {
                code: "REGISTER_ERROR",
                message: "Kayıt olurken hata oluştu",
              },
              timestamp: new Date().toISOString(),
            },
            isRegistering: false,
          });
          return false;
        }
      },

      logout: async () => {
        set({ isLoggingOut: true, error: null });
        try {
          await authService.logout();
        } catch (error) {
          // Continue with logout even if server request fails
          console.warn("Logout request failed:", error);
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoggingOut: false,
            error: null,
          });

          // Clear localStorage and API client
          try {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            apiClient.clearAuthToken();
          } catch (error) {
            // Ignore localStorage errors in SSR
          }
        }
      },

      initialize: async () => {
        try {
          const token = localStorage.getItem("accessToken");
          const refreshToken = localStorage.getItem("refreshToken");
          
          if (token && refreshToken) {
            apiClient.setAuthToken(token);
            
            // Try to get current user with existing token
            try {
              const user = await authService.getCurrentUser();
              set({ 
                user, 
                accessToken: token,
                refreshToken,
                isAuthenticated: true,
                isInitialized: true 
              });
              return;
            } catch (error) {
              // Token might be expired, clear everything
              console.warn("Token validation failed, clearing auth state:", error);
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              apiClient.clearAuthToken();
            }
          }
        } catch (error) {
          // Ignore localStorage errors in SSR
          console.warn("Initialize error:", error);
        }
        
        set({ isInitialized: true });
      },

      refreshUserData: async () => {
        set({ isLoading: true, error: null });
        try {
          const user = await authService.getCurrentUser();
          set({ user, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data || {
              success: false,
              error: {
                code: "REFRESH_ERROR",
                message: "Kullanıcı bilgileri güncellenirken hata oluştu",
              },
              timestamp: new Date().toISOString(),
            },
            isLoading: false,
          });
        }
      },

      updateProfile: async (updates) => {
        set({ isUpdatingProfile: true, error: null });
        try {
          const updatedUser = await authService.updateProfile(updates);
          set({ user: updatedUser, isUpdatingProfile: false });
          return true;
        } catch (error: any) {
          set({
            error: error.response?.data || {
              success: false,
              error: {
                code: "UPDATE_ERROR",
                message: "Profil güncellenirken hata oluştu",
              },
              timestamp: new Date().toISOString(),
            },
            isUpdatingProfile: false,
          });
          return false;
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          await authService.changePassword({ currentPassword, newPassword });
          set({ isLoading: false });
          return true;
        } catch (error: any) {
          set({
            error: error.response?.data || {
              success: false,
              error: {
                code: "PASSWORD_ERROR",
                message: "Şifre değiştirilirken hata oluştu",
              },
              timestamp: new Date().toISOString(),
            },
            isLoading: false,
          });
          return false;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => 
        typeof window !== "undefined" ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Initialize API client with token after rehydration
        if (state?.accessToken) {
          try {
            apiClient.setAuthToken(state.accessToken);
          } catch (error) {
            // Ignore errors in SSR
          }
        }
        state?.setInitialized(true);
      },
    }
  )
);

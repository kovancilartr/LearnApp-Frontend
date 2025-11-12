import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/services";
import { User, LoginRequest, RegisterRequest } from "@/types";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
};

// Get current user query
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: authService.getCurrentUser,
    enabled:
      typeof window !== "undefined" && !!localStorage.getItem("accessToken"),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if unauthorized
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Login mutation
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response;

      // Store tokens in localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      apiClient.setAuthToken(accessToken);

      // Update Zustand auth store
      useAuthStore.getState().setAuth(user, accessToken, refreshToken);

      // Update user cache
      queryClient.setQueryData(authKeys.user(), user);

      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error: any) => {
      console.error("Login error:", error);
    },
  });
}

// Register mutation
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response;

      // Store tokens in localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      apiClient.setAuthToken(accessToken);

      // Update Zustand auth store
      useAuthStore.getState().setAuth(user, accessToken, refreshToken);

      // Update user cache
      queryClient.setQueryData(authKeys.user(), user);

      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error: any) => {
      console.error("Register error:", error);
    },
  });
}

// Logout mutation
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onMutate: async () => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries();
    },
    onSuccess: () => {
      // Clear tokens from localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      apiClient.clearAuthToken();

      // Clear Zustand auth store
      useAuthStore.getState().logout();

      // Clear all cached data immediately
      queryClient.clear();
      queryClient.removeQueries();
      queryClient.resetQueries();

      // Clear any persisted data
      try {
        localStorage.removeItem("auth-storage");
      } catch (error) {
        console.warn("Failed to clear persisted auth data:", error);
      }
    },
    onError: (error: any) => {
      console.warn("Logout request failed:", error);

      // Still clear local data even if server request fails
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      apiClient.clearAuthToken();

      // Clear Zustand auth store
      useAuthStore.getState().logout();

      // Clear all cached data
      queryClient.clear();
      queryClient.removeQueries();
      queryClient.resetQueries();

      // Clear any persisted data
      try {
        localStorage.removeItem("auth-storage");
      } catch (error) {
        console.warn("Failed to clear persisted auth data:", error);
      }
    },
    onSettled: () => {
      // Force a complete refresh of the query client
      queryClient.invalidateQueries();
    },
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<User>) => authService.updateProfile(updates),
    onSuccess: (updatedUser) => {
      // Update user cache with optimistic update
      queryClient.setQueryData(authKeys.user(), updatedUser);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
    onError: (error: any) => {
      console.error("Profile update error:", error);

      // Invalidate user data to refetch from server
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
}

// Cha
// Change password mutation
export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => authService.changePassword({ currentPassword, newPassword }),
    onError: (error: unknown) => {
      console.error("Password change error:", error);
    },
  });
}

// Refresh user data
export function useRefreshUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.getCurrentUser,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.user(), user);
    },
    onError: (error: unknown) => {
      console.error("Refresh user error:", error);
    },
  });
}

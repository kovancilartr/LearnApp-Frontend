import { apiClient } from '../api';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  AuthResponseData,
  RefreshTokenResponse,
  User 
} from '@/types';

export class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponseData> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    // Transform backend response to frontend format
    return {
      user: response.data!.user,
      accessToken: response.data!.accessToken,
      refreshToken: response.data!.refreshToken,
    };
  }

  async register(userData: RegisterRequest): Promise<AuthResponseData> {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    // Transform backend response to frontend format
    return {
      user: response.data!.user,
      accessToken: response.data!.accessToken,
      refreshToken: response.data!.refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });
    return {
      accessToken: response.data!.accessToken,
      refreshToken: response.data!.refreshToken,
    };
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data!;
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/auth/profile', updates);
    return response.data!;
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await apiClient.put('/auth/password', data);
  }

  async validateToken(refreshToken: string): Promise<{ isValid: boolean }> {
    const response = await apiClient.post<{ isValid: boolean }>('/auth/validate-token', {
      refreshToken
    });
    return response.data!;
  }

  async checkEmail(email: string): Promise<{ exists: boolean }> {
    const response = await apiClient.post<{ exists: boolean }>('/auth/check-email', {
      email
    });
    return response.data!;
  }

  async logoutAll(): Promise<void> {
    await apiClient.post('/auth/logout-all');
  }

  async getActiveTokensCount(): Promise<{ count: number }> {
    const response = await apiClient.get<{ count: number }>('/auth/active-tokens');
    return response.data!;
  }
}

export const authService = new AuthService();
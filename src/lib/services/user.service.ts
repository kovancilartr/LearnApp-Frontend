import { apiClient } from '../api';
import { 
  User,
  AuthResponse,
  QueryParams,
  PaginatedResponse 
} from '@/types';
import { 
  StudentProfile, 
  TeacherProfile, 
  ParentProfile,
  UpdateUserProfileRequest,
  LinkParentChildRequest,
  UnlinkParentChildRequest,
  RoleSwitchRequest
} from '@/types/user.types';

export class UserService {
  // Admin user management
  async getUsers(params?: QueryParams): Promise<PaginatedResponse<User>> {
    try {
      console.log('🔧 UserService getUsers called with params:', params);
      console.log('🔧 Current token:', localStorage.getItem('accessToken') ? 'Token exists' : 'No token');
      
      // Backend endpoint: GET /api/users (mounted at /api)
      const response = await apiClient.get<PaginatedResponse<User>>('/users', params);
      console.log('🔧 UserService getUsers response:', response);
      
      if (!response.success) {
        console.error('❌ UserService getUsers - API returned success: false');
        throw new Error('Failed to fetch users');
      }
      
      // Backend response.data contains the paginated response
      return response.data!;
    } catch (error) {
      console.error('❌ UserService getUsers error:', error);
      throw error;
    }
  }

  async createUser(userData: { name: string; email: string; password: string; role: string }): Promise<User> {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    return response.data!.user;
  }

  async getUser(id: string): Promise<User> {
    // Backend endpoint: GET /api/users/:userId (mounted at /api)
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data!;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    // Backend endpoint: PUT /api/users/:userId (mounted at /api)
    const response = await apiClient.put<User>(`/users/${id}`, updates);
    return response.data!;
  }

  async deleteUser(id: string): Promise<void> {
    // Backend endpoint: DELETE /api/users/:userId (mounted at /api)
    await apiClient.delete(`/users/${id}`);
  }

  // Student management
  async getStudent(userId: string): Promise<StudentProfile> {
    // Backend endpoint: GET /api/users/:userId/student (mounted at /api)
    const response = await apiClient.get<StudentProfile>(`/users/${userId}/student`);
    return response.data!;
  }

  async linkStudentToParent(studentId: string, parentId: string): Promise<void> {
    // Backend endpoint: POST /api/users/link-parent-student (mounted at /api)
    const linkData: LinkParentChildRequest = {
      parentId,
      studentId,
    };
    await apiClient.post('/users/link-parent-student', linkData);
  }

  async unlinkStudentFromParent(studentId: string, parentId: string): Promise<void> {
    // Backend endpoint: POST /api/users/unlink-parent-student (mounted at /api)
    const unlinkData: UnlinkParentChildRequest = {
      studentId,
    };
    await apiClient.post('/users/unlink-parent-student', unlinkData);
  }

  // Teacher management
  async getTeacher(userId: string): Promise<TeacherProfile> {
    // Backend endpoint: GET /api/users/:userId/teacher (mounted at /api)
    const response = await apiClient.get<TeacherProfile>(`/users/${userId}/teacher`);
    return response.data!;
  }

  // Parent management
  async getParent(userId: string): Promise<ParentProfile> {
    // Backend endpoint: GET /api/users/:userId/parent (mounted at /api)
    const response = await apiClient.get<ParentProfile>(`/users/${userId}/parent`);
    return response.data!;
  }

  async getStudentsWithoutParent(): Promise<StudentProfile[]> {
    // Backend endpoint: GET /api/users/students-without-parent (mounted at /api)
    const response = await apiClient.get<StudentProfile[]>('/users/students-without-parent');
    return response.data!;
  }

  async getAllParents(): Promise<ParentProfile[]> {
    // Backend endpoint: GET /api/users/all-parents (mounted at /api)
    const response = await apiClient.get<ParentProfile[]>('/users/all-parents');
    return response.data!;
  }

  // Profile management
  async getCurrentUserProfile(): Promise<User> {
    // Backend endpoint: GET /api/profile/detailed (mounted at /api)
    const response = await apiClient.get<User>('/profile/detailed');
    return response.data!;
  }

  async getUserDetailedProfile(userId: string): Promise<User> {
    // Backend endpoint: GET /api/users/:userId/profile/detailed (mounted at /api)
    const response = await apiClient.get<User>(`/users/${userId}/profile/detailed`);
    
    if (!response.data) {
      throw new Error('User profile data is undefined');
    }
    
    return response.data;
  }

  async updateCurrentUserProfile(updates: UpdateUserProfileRequest): Promise<User> {
    // Backend endpoint: PUT /api/profile/detailed (mounted at /api)
    const response = await apiClient.put<User>('/profile/detailed', updates);
    return response.data!;
  }

  // Role switching for parents
  async switchUserRole(data: RoleSwitchRequest): Promise<User> {
    // Backend endpoint: POST /api/switch-role (mounted at /api)
    const response = await apiClient.post<User>('/switch-role', data);
    return response.data!;
  }


}

export const userService = new UserService();
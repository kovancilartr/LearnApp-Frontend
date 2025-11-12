import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/lib/services';
import { User, QueryParams, PaginatedResponse } from '@/types';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: QueryParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  profiles: () => [...userKeys.all, 'profile'] as const,
  studentProfile: (userId: string) => [...userKeys.profiles(), 'student', userId] as const,
  teacherProfile: (userId: string) => [...userKeys.profiles(), 'teacher', userId] as const,
  parentProfile: (userId: string) => [...userKeys.profiles(), 'parent', userId] as const,
  studentsWithoutParent: () => [...userKeys.all, 'students-without-parent'] as const,
};

// Users list query
export const useUsersQuery = (params: QueryParams) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// User detail query
export const useUserQuery = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => userService.getUser(userId),
    enabled: !!userId && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// User detailed profile query (includes role-specific data)
export const useUserDetailedProfileQuery = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: [...userKeys.detail(userId), 'detailed'],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return await userService.getUserDetailedProfile(userId);
    },
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Disable retry to prevent infinite loops
    refetchOnWindowFocus: false, // Prevent refetch on window focus
  });
};

// Student profile query
export const useStudentProfileQuery = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: userKeys.studentProfile(userId),
    queryFn: () => userService.getStudent(userId),
    enabled: !!userId && enabled,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

// Teacher profile query
export const useTeacherProfileQuery = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: userKeys.teacherProfile(userId),
    queryFn: () => userService.getTeacher(userId),
    enabled: !!userId && enabled,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

// Parent profile query
export const useParentProfileQuery = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: userKeys.parentProfile(userId),
    queryFn: () => userService.getParent(userId),
    enabled: !!userId && enabled,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

// Students without parent query
export const useStudentsWithoutParentQuery = (enabled = true) => {
  return useQuery({
    queryKey: userKeys.studentsWithoutParent(),
    queryFn: () => userService.getStudentsWithoutParent(),
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Mutations
export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: { name: string; email: string; password: string; role: string }) => 
      userService.createUser(userData),
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<User> }) =>
      userService.updateUser(id, updates),
    onSuccess: (data, variables) => {
      // Update specific user cache
      queryClient.setQueryData(userKeys.detail(variables.id), data);
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: (_, userId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: userKeys.detail(userId) });
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

export const useLinkStudentToParentMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ studentId, parentId }: { studentId: string; parentId: string }) =>
      userService.linkStudentToParent(studentId, parentId),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.studentsWithoutParent() });
      queryClient.invalidateQueries({ queryKey: userKeys.profiles() });
    },
  });
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentService } from '@/lib/services';
import { EnrollmentRequestFilters } from '@/types/enrollment.types';
import { toast } from 'react-hot-toast';

// Query keys
export const enrollmentKeys = {
  all: ['enrollmentRequests'] as const,
  lists: () => [...enrollmentKeys.all, 'list'] as const,
  list: (filters?: EnrollmentRequestFilters) => [...enrollmentKeys.lists(), filters] as const,
  details: () => [...enrollmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...enrollmentKeys.details(), id] as const,
  stats: () => [...enrollmentKeys.all, 'stats'] as const,
};

// Get enrollment requests (Admin only)
export const useEnrollmentRequests = (filters?: EnrollmentRequestFilters) => {
  return useQuery({
    queryKey: enrollmentKeys.list(filters),
    queryFn: () => enrollmentService.getEnrollmentRequests(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get student's own enrollment requests
export const useMyEnrollmentRequests = (filters?: Omit<EnrollmentRequestFilters, 'studentId'>) => {
  return useQuery({
    queryKey: [...enrollmentKeys.lists(), 'my', filters],
    queryFn: () => enrollmentService.getMyEnrollmentRequests(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get enrollment request by ID
export const useEnrollmentRequest = (id: string) => {
  return useQuery({
    queryKey: enrollmentKeys.detail(id),
    queryFn: () => enrollmentService.getEnrollmentRequestById(id),
    enabled: !!id,
  });
};

// Get enrollment statistics
export const useEnrollmentStats = () => {
  return useQuery({
    queryKey: enrollmentKeys.stats(),
    queryFn: () => enrollmentService.getEnrollmentStats(),
    staleTime: 60 * 1000, // 1 minute
  });
};

// Approve enrollment request
export const useApproveEnrollmentRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, adminNote }: { id: string; adminNote?: string }) =>
      enrollmentService.approveEnrollmentRequest(id, adminNote),
    onSuccess: (data) => {
      // Invalidate and refetch enrollment requests
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      
      toast.success(`Enrollment request approved for ${data.student.user.name}`);
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to approve enrollment request');
    },
  });
};

// Reject enrollment request
export const useRejectEnrollmentRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, adminNote }: { id: string; adminNote?: string }) =>
      enrollmentService.rejectEnrollmentRequest(id, adminNote),
    onSuccess: (data) => {
      // Invalidate and refetch enrollment requests
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      
      toast.success(`Enrollment request rejected for ${data.student.user.name}`);
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to reject enrollment request');
    },
  });
};

// Bulk approve enrollment requests
export const useBulkApproveRequests = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestIds, adminNote }: { requestIds: string[]; adminNote?: string }) =>
      enrollmentService.bulkApproveRequests(requestIds, adminNote),
    onSuccess: (data) => {
      // Invalidate and refetch enrollment requests
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      
      const successCount = data.successful.length;
      const failCount = data.failed.length;
      
      if (successCount > 0) {
        toast.success(`${successCount} enrollment request(s) approved successfully`);
      }
      
      if (failCount > 0) {
        toast.error(`${failCount} enrollment request(s) failed to approve`);
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to approve enrollment requests');
    },
  });
};

// Bulk reject enrollment requests
export const useBulkRejectRequests = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestIds, adminNote }: { requestIds: string[]; adminNote?: string }) =>
      enrollmentService.bulkRejectRequests(requestIds, adminNote),
    onSuccess: (data) => {
      // Invalidate and refetch enrollment requests
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      
      const successCount = data.successful.length;
      const failCount = data.failed.length;
      
      if (successCount > 0) {
        toast.success(`${successCount} enrollment request(s) rejected successfully`);
      }
      
      if (failCount > 0) {
        toast.error(`${failCount} enrollment request(s) failed to reject`);
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to reject enrollment requests');
    },
  });
};

// Create enrollment request
export const useCreateEnrollmentRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { courseId: string; message?: string }) =>
      enrollmentService.createEnrollmentRequest(data),
    onSuccess: (data) => {
      // Invalidate and refetch enrollment requests
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
      
      toast.success(`Enrollment request created for ${data.course.title}`);
    },
    onError: (error: Error & { response?: { data?: { error?: { message?: string }; message?: string } } }) => {
      toast.error(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to create enrollment request');
    },
  });
};
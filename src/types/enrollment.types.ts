export type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface EnrollmentRequest {
  id: string;
  studentId: string;
  courseId: string;
  status: EnrollmentStatus;
  message?: string;
  adminNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  course: {
    id: string;
    title: string;
    description?: string;
  };
}

export interface CreateEnrollmentRequestData {
  studentId: string;
  courseId: string;
  message?: string;
}

export interface BulkEnrollmentRequestData {
  requestIds: string[];
  action: 'approve' | 'reject';
  adminNote?: string;
}

export interface BulkOperationResult {
  successful: string[];
  failed: Array<{
    requestId: string;
    error: string;
  }>;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
}

export interface EnrollmentRequestStatistics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  requestsByMonth: Array<{
    month: string;
    count: number;
  }>;
  requestsByCourse: Array<{
    courseId: string;
    courseTitle: string;
    count: number;
  }>;
  recentRequests: EnrollmentRequest[];
}

export interface EnrollmentRequestFilters {
  page?: number;
  limit?: number;
  status?: EnrollmentStatus;
  courseId?: string;
  studentId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

export interface EnrollmentRequestsResponse {
  requests: EnrollmentRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
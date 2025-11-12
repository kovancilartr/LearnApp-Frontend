import { apiClient } from "../api";
import {
  EnrollmentRequest,
  EnrollmentRequestFilters,
  EnrollmentRequestsResponse,
  EnrollmentRequestStatistics,
  BulkEnrollmentRequestData as BulkProcessData,
  BulkOperationResult as BulkProcessResult,
} from "@/types/enrollment.types";

export const enrollmentService = {
  // Get enrollment requests with filters and pagination
  async getEnrollmentRequests(
    filters?: EnrollmentRequestFilters
  ): Promise<EnrollmentRequestsResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<EnrollmentRequestsResponse>(
      `/enrollments/requests?${params.toString()}`
    );
    return (
      response.data || {
        requests: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }
    );
  },

  // Get enrollment request statistics
  async getEnrollmentRequestStatistics(): Promise<EnrollmentRequestStatistics> {
    const response = await apiClient.get<EnrollmentRequestStatistics>(
      "/enrollments/requests/statistics"
    );
    return (
      response.data || {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        requestsByMonth: [],
        requestsByCourse: [],
        recentRequests: [],
      }
    );
  },

  // Get pending requests count
  async getPendingRequestsCount(): Promise<{ count: number }> {
    const response = await apiClient.get<{ count: number }>(
      "/enrollments/requests/count/pending"
    );
    return response.data || { count: 0 };
  },

  // Get enrollment request by ID
  async getEnrollmentRequestById(
    requestId: string
  ): Promise<EnrollmentRequest> {
    const response = await apiClient.get<EnrollmentRequest>(
      `/enrollments/requests/${requestId}`
    );
    return response.data!;
  },

  // Approve enrollment request
  async approveEnrollmentRequest(
    requestId: string,
    adminNote?: string
  ): Promise<EnrollmentRequest> {
    const response = await apiClient.post<EnrollmentRequest>(
      `/enrollments/requests/${requestId}/approve`,
      {
        adminNote,
      }
    );
    return response.data!;
  },

  // Reject enrollment request
  async rejectEnrollmentRequest(
    requestId: string,
    adminNote?: string
  ): Promise<EnrollmentRequest> {
    const response = await apiClient.post<EnrollmentRequest>(
      `/enrollments/requests/${requestId}/reject`,
      {
        adminNote,
      }
    );
    return response.data!;
  },

  // Review enrollment request (approve or reject)
  async reviewEnrollmentRequest(
    requestId: string,
    data: {
      action: "approve" | "reject";
      adminNote?: string;
    }
  ): Promise<EnrollmentRequest> {
    if (data.action === "approve") {
      return this.approveEnrollmentRequest(requestId, data.adminNote);
    } else {
      return this.rejectEnrollmentRequest(requestId, data.adminNote);
    }
  },

  // Bulk process enrollment requests
  async bulkProcessEnrollmentRequests(
    data: BulkProcessData
  ): Promise<BulkProcessResult> {
    const response = await apiClient.post<BulkProcessResult>(
      "/enrollments/requests/bulk-process",
      data
    );
    return (
      response.data || {
        successful: [],
        failed: [],
        totalProcessed: 0,
        successCount: 0,
        failureCount: 0,
      }
    );
  },

  // Delete enrollment request
  async deleteEnrollmentRequest(requestId: string): Promise<void> {
    await apiClient.delete(`/enrollments/requests/${requestId}`);
  },

  // Get student's own enrollment requests
  async getMyEnrollmentRequests(
    filters?: Omit<EnrollmentRequestFilters, 'studentId'>
  ): Promise<EnrollmentRequestsResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get<EnrollmentRequestsResponse>(
      `/enrollments/requests/my?${params.toString()}`
    );
    return (
      response.data || {
        requests: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }
    );
  },

  // Bulk approve enrollment requests
  async bulkApproveRequests(
    requestIds: string[],
    adminNote?: string
  ): Promise<BulkProcessResult> {
    const response = await apiClient.post<BulkProcessResult>(
      "/enrollments/requests/bulk-approve",
      {
        requestIds,
        adminNote,
      }
    );
    return (
      response.data || {
        successful: [],
        failed: [],
        totalProcessed: 0,
        successCount: 0,
        failureCount: 0,
      }
    );
  },

  // Bulk reject enrollment requests
  async bulkRejectRequests(
    requestIds: string[],
    adminNote?: string
  ): Promise<BulkProcessResult> {
    const response = await apiClient.post<BulkProcessResult>(
      "/enrollments/requests/bulk-reject",
      {
        requestIds,
        adminNote,
      }
    );
    return (
      response.data || {
        successful: [],
        failed: [],
        totalProcessed: 0,
        successCount: 0,
        failureCount: 0,
      }
    );
  },

  // Create enrollment request (for students)
  async createEnrollmentRequest(data: {
    courseId: string;
    message?: string;
  }): Promise<EnrollmentRequest> {
    const response = await apiClient.post<EnrollmentRequest>(
      "/enrollments/requests",
      data
    );
    return response.data!;
  },

  // Alias for statistics method (for backward compatibility)
  getEnrollmentStats: function () {
    return this.getEnrollmentRequestStatistics();
  },
};

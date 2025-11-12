import { apiClient } from "../api";
import {
  DashboardStats,
  CourseAnalytics,
  UserAnalytics,
  EnrollmentTrends,
  SystemUsageStats,
  TeacherAssignment,
  SystemAnalytics,
  AnalyticsQuery,
  AnalyticsExportRequest,
  AnalyticsExportData,
} from "@/types/analytics.types";

export class AnalyticsService {
  /**
   * Dashboard istatistiklerini getir (Sadece Admin)
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>("/analytics/dashboard");
    return response.data!;
  }

  /**
   * Kurs analitiği verilerini getir (Sadece Admin)
   */
  async getCourseAnalytics(query?: AnalyticsQuery): Promise<CourseAnalytics[]> {
    const response = await apiClient.get<CourseAnalytics[]>(
      "/analytics/courses",
      query
    );
    return response.data!;
  }

  /**
   * Kullanıcı analitiği verilerini getir (Sadece Admin)
   */
  async getUserAnalytics(query?: AnalyticsQuery): Promise<UserAnalytics> {
    const response = await apiClient.get<UserAnalytics>(
      "/analytics/users",
      query
    );
    return response.data!;
  }

  /**
   * Kayıt trendlerini getir (Sadece Admin)
   */
  async getEnrollmentTrends(query?: AnalyticsQuery): Promise<EnrollmentTrends> {
    const response = await apiClient.get<EnrollmentTrends>(
      "/analytics/enrollments",
      query
    );
    return response.data!;
  }

  /**
   * Sistem kullanım istatistiklerini getir (Sadece Admin)
   */
  async getSystemUsageStats(query?: AnalyticsQuery): Promise<SystemUsageStats> {
    const response = await apiClient.get<SystemUsageStats>(
      "/analytics/usage",
      query
    );
    return response.data!;
  }

  /**
   * Öğretmen atamalarını getir (Sadece Admin)
   */
  async getTeacherAssignments(query?: AnalyticsQuery): Promise<TeacherAssignment[]> {
    const response = await apiClient.get<TeacherAssignment[]>(
      "/analytics/teachers",
      query
    );
    return response.data!;
  }

  /**
   * Kapsamlı analytics genel bakışını getir (Sadece Admin)
   */
  async getAnalyticsOverview(query?: AnalyticsQuery): Promise<SystemAnalytics> {
    const response = await apiClient.get<SystemAnalytics>(
      "/analytics/overview",
      query
    );
    return response.data!;
  }

  /**
   * Analytics verilerini dışa aktar (Sadece Admin)
   */
  async exportAnalyticsData(request: AnalyticsExportRequest): Promise<AnalyticsExportData> {
    const response = await apiClient.get<AnalyticsExportData>(
      "/analytics/export",
      request
    );
    return response.data!;
  }

  /**
   * Analytics verilerini CSV olarak indir (Sadece Admin)
   */
  async downloadAnalyticsCSV(type: string = 'overview'): Promise<Blob> {
    const response = await apiClient.client.get(
      `/analytics/export?type=${type}&format=csv`,
      {
        responseType: 'blob',
        headers: {
          'Accept': 'text/csv',
        },
      }
    );
    return response.data;
  }

  /**
   * Analytics verilerini JSON olarak indir (Sadece Admin)
   */
  async downloadAnalyticsJSON(type: string = 'overview'): Promise<Blob> {
    const response = await apiClient.client.get(
      `/analytics/export?type=${type}&format=json`,
      {
        responseType: 'blob',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    return response.data;
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService();
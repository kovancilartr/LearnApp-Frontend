import { apiClient } from '../api';
import { Parent, ChildProgress, Student } from '@/types/auth.types';

export const parentService = {
  // Get parent profile with children
  async getParentProfile(): Promise<Parent> {
    const response = await apiClient.get<Parent>('/parent/profile');
    return response.data;
  },

  // Get all children linked to parent
  async getChildren(): Promise<Student[]> {
    const response = await apiClient.get<Student[]>('/parent/children');
    return response.data;
  },

  // Get specific child's progress
  async getChildProgress(childId: string): Promise<ChildProgress> {
    const response = await apiClient.get<ChildProgress>(`/parent/children/${childId}/progress`);
    return response.data;
  },

  // Get child's course enrollments
  async getChildCourses(childId: string) {
    const response = await apiClient.get(`/parent/children/${childId}/courses`);
    return response.data;
  },

  // Get child's quiz results
  async getChildQuizResults(childId: string) {
    const response = await apiClient.get(`/parent/children/${childId}/quiz-results`);
    return response.data;
  },

  // Get child's recent activity
  async getChildActivity(childId: string, limit: number = 10) {
    const response = await apiClient.get(`/parent/children/${childId}/activity?limit=${limit}`);
    return response.data;
  },

  // Get combined statistics for all children
  async getParentStats() {
    const response = await apiClient.get('/parent/stats');
    return response.data;
  },

  // Enhanced parent progress monitoring features

  // Get detailed progress report for all children
  async getDetailedProgressReport() {
    const response = await apiClient.get('/progress/parent/detailed-report');
    return response.data;
  },

  // Get progress comparison between children
  async getChildrenProgressComparison() {
    const response = await apiClient.get('/progress/parent/children-comparison');
    return response.data;
  },

  // Export progress data in various formats
  async exportProgressData(format: 'json' | 'csv' | 'pdf' = 'json', dateRange?: { startDate: string; endDate: string }) {
    const params = new URLSearchParams({ format });
    if (dateRange) {
      params.append('startDate', dateRange.startDate);
      params.append('endDate', dateRange.endDate);
    }
    
    const response = await apiClient.get(`/progress/parent/export?${params.toString()}`);
    return response.data;
  },

  // Get progress notifications
  async getProgressNotifications() {
    const response = await apiClient.get('/progress/parent/notifications');
    return response.data;
  }
};
import { analyticsService } from '../analytics.service';
import { apiClient } from '../../api';

// Mock apiClient
jest.mock('../../api', () => ({
  apiClient: {
    get: jest.fn(),
    client: {
      get: jest.fn(),
    },
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('dashboard istatistiklerini başarıyla getirmeli', async () => {
      const mockStats = {
        totalCourses: 10,
        totalStudents: 50,
        totalTeachers: 5,
        totalParents: 30,
        totalLessons: 100,
        totalQuizzes: 25,
        activeEnrollments: 75,
        pendingRequests: 5,
        monthlyGrowth: {
          courses: 10,
          students: 15,
          enrollments: 20,
        },
      };

      mockApiClient.get.mockResolvedValue({ data: mockStats });

      const result = await analyticsService.getDashboardStats();

      expect(mockApiClient.get).toHaveBeenCalledWith('/analytics/dashboard');
      expect(result).toEqual(mockStats);
    });

    it('API hatası durumunda hata fırlatmalı', async () => {
      const mockError = new Error('API Hatası');
      mockApiClient.get.mockRejectedValue(mockError);

      await expect(analyticsService.getDashboardStats()).rejects.toThrow('API Hatası');
    });
  });

  describe('getCourseAnalytics', () => {
    it('kurs analitiği verilerini başarıyla getirmeli', async () => {
      const mockAnalytics = [
        {
          courseId: '1',
          title: 'Test Kursu',
          studentCount: 20,
          completionRate: 85,
          averageProgress: 75,
          teacherName: 'Test Öğretmen',
          lessonCount: 10,
          quizCount: 5,
          createdAt: new Date(),
        },
      ];

      mockApiClient.get.mockResolvedValue({ data: mockAnalytics });

      const result = await analyticsService.getCourseAnalytics();

      expect(mockApiClient.get).toHaveBeenCalledWith('/analytics/courses', undefined);
      expect(result).toEqual(mockAnalytics);
    });

    it('query parametreleri ile çağrılabilmeli', async () => {
      const query = { startDate: '2024-01-01', endDate: '2024-12-31' };
      mockApiClient.get.mockResolvedValue({ data: [] });

      await analyticsService.getCourseAnalytics(query);

      expect(mockApiClient.get).toHaveBeenCalledWith('/analytics/courses', query);
    });
  });

  describe('getUserAnalytics', () => {
    it('kullanıcı analitiği verilerini başarıyla getirmeli', async () => {
      const mockUserAnalytics = {
        totalUsers: 100,
        usersByRole: {
          ADMIN: 2,
          TEACHER: 10,
          STUDENT: 70,
          PARENT: 18,
        },
        newUsersThisMonth: 15,
        activeUsersThisMonth: 85,
        userGrowthTrend: [
          { month: '2024-01', count: 50 },
          { month: '2024-02', count: 75 },
          { month: '2024-03', count: 100 },
        ],
      };

      mockApiClient.get.mockResolvedValue({ data: mockUserAnalytics });

      const result = await analyticsService.getUserAnalytics();

      expect(mockApiClient.get).toHaveBeenCalledWith('/analytics/users', undefined);
      expect(result).toEqual(mockUserAnalytics);
    });
  });

  describe('getEnrollmentTrends', () => {
    it('kayıt trendlerini başarıyla getirmeli', async () => {
      const mockTrends = {
        monthly: [
          { month: '2024-01', enrollments: 20, completions: 15, requests: 25 },
          { month: '2024-02', enrollments: 30, completions: 20, requests: 35 },
        ],
        popular: [
          { courseId: '1', title: 'Popüler Kurs', enrollmentCount: 50 },
        ],
      };

      mockApiClient.get.mockResolvedValue({ data: mockTrends });

      const result = await analyticsService.getEnrollmentTrends();

      expect(mockApiClient.get).toHaveBeenCalledWith('/analytics/enrollments', undefined);
      expect(result).toEqual(mockTrends);
    });
  });

  describe('getSystemUsageStats', () => {
    it('sistem kullanım istatistiklerini başarıyla getirmeli', async () => {
      const mockUsageStats = {
        totalLogins: 1000,
        averageSessionDuration: 45,
        mostActiveHours: [
          { hour: 9, activityCount: 100 },
          { hour: 14, activityCount: 120 },
        ],
        deviceStats: {
          desktop: 60,
          mobile: 35,
          tablet: 5,
        },
      };

      mockApiClient.get.mockResolvedValue({ data: mockUsageStats });

      const result = await analyticsService.getSystemUsageStats();

      expect(mockApiClient.get).toHaveBeenCalledWith('/analytics/usage', undefined);
      expect(result).toEqual(mockUsageStats);
    });
  });

  describe('getTeacherAssignments', () => {
    it('öğretmen atamalarını başarıyla getirmeli', async () => {
      const mockAssignments = [
        {
          teacherId: '1',
          teacherName: 'Test Öğretmen',
          assignedCourses: 3,
          totalStudents: 45,
          averageProgress: 78,
        },
      ];

      mockApiClient.get.mockResolvedValue({ data: mockAssignments });

      const result = await analyticsService.getTeacherAssignments();

      expect(mockApiClient.get).toHaveBeenCalledWith('/analytics/teachers', undefined);
      expect(result).toEqual(mockAssignments);
    });
  });

  describe('getAnalyticsOverview', () => {
    it('kapsamlı analytics genel bakışını başarıyla getirmeli', async () => {
      const mockOverview = {
        overview: { totalCourses: 10 },
        courses: [],
        users: { totalUsers: 100 },
        enrollments: { monthly: [], popular: [] },
        teachers: [],
        usage: { totalLogins: 1000 },
      };

      mockApiClient.get.mockResolvedValue({ data: mockOverview });

      const result = await analyticsService.getAnalyticsOverview();

      expect(mockApiClient.get).toHaveBeenCalledWith('/analytics/overview', undefined);
      expect(result).toEqual(mockOverview);
    });
  });

  describe('downloadAnalyticsCSV', () => {
    it('CSV dosyasını başarıyla indirmeli', async () => {
      const mockBlob = new Blob(['test csv data'], { type: 'text/csv' });
      mockApiClient.client.get.mockResolvedValue({ data: mockBlob });

      const result = await analyticsService.downloadAnalyticsCSV('dashboard');

      expect(mockApiClient.client.get).toHaveBeenCalledWith(
        '/analytics/export?type=dashboard&format=csv',
        {
          responseType: 'blob',
          headers: {
            'Accept': 'text/csv',
          },
        }
      );
      expect(result).toEqual(mockBlob);
    });
  });

  describe('downloadAnalyticsJSON', () => {
    it('JSON dosyasını başarıyla indirmeli', async () => {
      const mockBlob = new Blob(['{"test": "json data"}'], { type: 'application/json' });
      mockApiClient.client.get.mockResolvedValue({ data: mockBlob });

      const result = await analyticsService.downloadAnalyticsJSON('courses');

      expect(mockApiClient.client.get).toHaveBeenCalledWith(
        '/analytics/export?type=courses&format=json',
        {
          responseType: 'blob',
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockBlob);
    });
  });
});
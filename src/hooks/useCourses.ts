import { useCallback } from 'react';
import { useCourseStore } from '@/store';
import { apiClient } from '@/lib/api';
import { Course, Enrollment } from '@/types';

export const useCourses = () => {
  const {
    courses,
    enrollments,
    selectedCourse,
    isLoading,
    setCourses,
    setEnrollments,
    setSelectedCourse,
    addCourse,
    updateCourse,
    removeCourse,
    addEnrollment,
    removeEnrollment,
    setLoading,
  } = useCourseStore();

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{items: Course[], pagination: any}>('/courses');
      if (response.success && response.data?.items && Array.isArray(response.data.items)) {
        setCourses(response.data.items);
        return { success: true, data: response.data.items };
      }
      return { success: false, error: 'Failed to fetch courses' };
    } catch (error: any) {
      console.error('Fetch courses error:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch courses',
      };
    } finally {
      setLoading(false);
    }
  }, [setCourses, setLoading]);

  const fetchCourse = useCallback(async (courseId: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get<Course>(`/courses/${courseId}`);
      if (response.success) {
        setSelectedCourse(response.data);
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Failed to fetch course' };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch course',
      };
    } finally {
      setLoading(false);
    }
  }, [setSelectedCourse, setLoading]);

  const createCourse = useCallback(async (courseData: Partial<Course>) => {
    try {
      setLoading(true);
      const response = await apiClient.post<Course>('/courses', courseData);
      if (response.success) {
        addCourse(response.data);
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Failed to create course' };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to create course',
      };
    } finally {
      setLoading(false);
    }
  }, [addCourse, setLoading]);

  const enrollInCourse = useCallback(async (courseId: string) => {
    try {
      setLoading(true);
      const response = await apiClient.post<Enrollment>(`/courses/${courseId}/enroll`);
      if (response.success) {
        addEnrollment(response.data);
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Failed to enroll in course' };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to enroll in course',
      };
    } finally {
      setLoading(false);
    }
  }, [addEnrollment, setLoading]);

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<Enrollment[]>('/enrollments');
      if (response.success) {
        setEnrollments(response.data);
        return { success: true, data: response.data };
      }
      return { success: false, error: 'Failed to fetch enrollments' };
    } catch (error: unknown) {
      return {
        success: false,
        error: (error as any).response?.data?.error?.message || 'Failed to fetch enrollments',
      };
    } finally {
      setLoading(false);
    }
  }, [setEnrollments, setLoading]);

  return {
    courses,
    enrollments,
    selectedCourse,
    isLoading,
    fetchCourses,
    fetchCourse,
    createCourse,
    enrollInCourse,
    fetchEnrollments,
    setSelectedCourse,
  };
};
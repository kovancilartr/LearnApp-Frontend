import { create } from "zustand";
import { Course, Enrollment, ApiError } from "@/types";
import { courseService } from "@/lib/services";

interface CourseState {
  // Data
  courses: Course[];
  enrollments: Enrollment[];
  selectedCourse: Course | null;
  availableCourses: Course[];
  enrolledCourses: Course[];

  // Loading states
  isLoading: boolean;
  isLoadingCourses: boolean;
  isLoadingEnrollments: boolean;
  isCreatingCourse: boolean;
  isUpdatingCourse: boolean;
  isDeletingCourse: boolean;
  isEnrolling: boolean;

  // Error states
  error: ApiError | null;
  coursesError: ApiError | null;
  enrollmentsError: ApiError | null;

  // Actions
  setCourses: (courses: Course[]) => void;
  setEnrollments: (enrollments: Enrollment[]) => void;
  setSelectedCourse: (course: Course | null) => void;
  setAvailableCourses: (courses: Course[]) => void;
  setEnrolledCourses: (courses: Course[]) => void;

  // CRUD operations
  addCourse: (course: Course) => void;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
  removeCourse: (courseId: string) => void;
  addEnrollment: (enrollment: Enrollment) => void;
  removeEnrollment: (enrollmentId: string) => void;

  // Loading setters
  setLoading: (loading: boolean) => void;
  setLoadingCourses: (loading: boolean) => void;
  setLoadingEnrollments: (loading: boolean) => void;
  setCreatingCourse: (loading: boolean) => void;
  setUpdatingCourse: (loading: boolean) => void;
  setDeletingCourse: (loading: boolean) => void;
  setEnrolling: (loading: boolean) => void;

  // Error setters
  setError: (error: ApiError | null) => void;
  setCoursesError: (error: ApiError | null) => void;
  setEnrollmentsError: (error: ApiError | null) => void;
  clearErrors: () => void;

  // Async actions
  fetchCourses: () => Promise<void>;
  fetchAvailableCourses: () => Promise<void>;
  fetchEnrolledCourses: () => Promise<void>;
  fetchEnrollments: (courseId: string) => Promise<void>;
  createCourse: (
    courseData: Omit<Course, "id" | "createdAt" | "updatedAt" | "sections">
  ) => Promise<Course | null>;
  enrollInCourse: (courseId: string) => Promise<Enrollment | null>;
  unenrollFromCourse: (courseId: string, studentId: string) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  // Initial state
  courses: [],
  enrollments: [],
  selectedCourse: null,
  availableCourses: [],
  enrolledCourses: [],

  // Loading states
  isLoading: false,
  isLoadingCourses: false,
  isLoadingEnrollments: false,
  isCreatingCourse: false,
  isUpdatingCourse: false,
  isDeletingCourse: false,
  isEnrolling: false,

  // Error states
  error: null,
  coursesError: null,
  enrollmentsError: null,

  // Basic setters
  setCourses: (courses) => set({ courses }),
  setEnrollments: (enrollments) => set({ enrollments }),
  setSelectedCourse: (course) => set({ selectedCourse: course }),
  setAvailableCourses: (courses) => set({ availableCourses: courses }),
  setEnrolledCourses: (courses) => set({ enrolledCourses: courses }),

  // CRUD operations
  addCourse: (course) => {
    set((state) => ({
      courses: [...state.courses, course],
      availableCourses: [...state.availableCourses, course],
    }));
  },

  updateCourse: (courseId, updates) => {
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === courseId ? { ...course, ...updates } : course
      ),
      availableCourses: state.availableCourses.map((course) =>
        course.id === courseId ? { ...course, ...updates } : course
      ),
      enrolledCourses: state.enrolledCourses.map((course) =>
        course.id === courseId ? { ...course, ...updates } : course
      ),
      selectedCourse:
        state.selectedCourse?.id === courseId
          ? { ...state.selectedCourse, ...updates }
          : state.selectedCourse,
    }));
  },

  removeCourse: (courseId) => {
    set((state) => ({
      courses: state.courses.filter((course) => course.id !== courseId),
      availableCourses: state.availableCourses.filter(
        (course) => course.id !== courseId
      ),
      enrolledCourses: state.enrolledCourses.filter(
        (course) => course.id !== courseId
      ),
      selectedCourse:
        state.selectedCourse?.id === courseId ? null : state.selectedCourse,
    }));
  },

  addEnrollment: (enrollment) => {
    set((state) => ({
      enrollments: [...state.enrollments, enrollment],
    }));
  },

  removeEnrollment: (enrollmentId) => {
    set((state) => ({
      enrollments: state.enrollments.filter((e) => e.id !== enrollmentId),
    }));
  },

  // Loading setters
  setLoading: (loading) => set({ isLoading: loading }),
  setLoadingCourses: (loading) => set({ isLoadingCourses: loading }),
  setLoadingEnrollments: (loading) => set({ isLoadingEnrollments: loading }),
  setCreatingCourse: (loading) => set({ isCreatingCourse: loading }),
  setUpdatingCourse: (loading) => set({ isUpdatingCourse: loading }),
  setDeletingCourse: (loading) => set({ isDeletingCourse: loading }),
  setEnrolling: (loading) => set({ isEnrolling: loading }),

  // Error setters
  setError: (error) => set({ error }),
  setCoursesError: (error) => set({ coursesError: error }),
  setEnrollmentsError: (error) => set({ enrollmentsError: error }),
  clearErrors: () =>
    set({ error: null, coursesError: null, enrollmentsError: null }),

  // Async actions
  fetchCourses: async () => {
    set({ isLoadingCourses: true, coursesError: null });
    try {
      const courses = await courseService.getTeacherCourses();
      set({ courses, isLoadingCourses: false });
    } catch (error: any) {
      set({
        coursesError: error.response?.data || {
          success: false,
          error: {
            code: "FETCH_ERROR",
            message: "Kurslar yüklenirken hata oluştu",
          },
          timestamp: new Date().toISOString(),
        },
        isLoadingCourses: false,
      });
    }
  },

  fetchAvailableCourses: async () => {
    set({ isLoadingCourses: true, coursesError: null });
    try {
      const courses = await courseService
        .getCourses()
        .then((response) => response.items);
      set({ availableCourses: courses, isLoadingCourses: false });
    } catch (error: any) {
      set({
        coursesError: (error as any).response?.data || {
          success: false,
          error: {
            code: "FETCH_ERROR",
            message: "Mevcut kurslar yüklenirken hata oluştu",
          },
          timestamp: new Date().toISOString(),
        },
        isLoadingCourses: false,
      });
    }
  },

  fetchEnrolledCourses: async () => {
    set({ isLoadingCourses: true, coursesError: null });
    try {
      // Always use getMyEnrollments for current user
      const enrollments = await courseService.getMyEnrollments();

      // Extract courses from enrollments
      const courses = enrollments
        .map((enrollment: any) => enrollment.course)
        .filter(Boolean);
      set({ enrolledCourses: courses, isLoadingCourses: false });
    } catch (error: any) {
      console.error("Fetch enrolled courses error:", error);
      set({
        coursesError: error.response?.data || {
          success: false,
          error: {
            code: "FETCH_ERROR",
            message: "Kayıtlı kurslar yüklenirken hata oluştu",
          },
          timestamp: new Date().toISOString(),
        },
        isLoadingCourses: false,
      });
    }
  },

  fetchEnrollments: async (courseId: string) => {
    set({ isLoadingEnrollments: true, enrollmentsError: null });
    try {
      const enrollments = await courseService.getEnrollments(courseId);
      set({ enrollments, isLoadingEnrollments: false });
    } catch (error: any) {
      set({
        enrollmentsError: error.response?.data || {
          success: false,
          error: {
            code: "FETCH_ERROR",
            message: "Kayıtlar yüklenirken hata oluştu",
          },
          timestamp: new Date().toISOString(),
        },
        isLoadingEnrollments: false,
      });
    }
  },

  createCourse: async (courseData) => {
    set({ isCreatingCourse: true, error: null });
    try {
      const course = await courseService.createCourse(courseData);
      get().addCourse(course);
      set({ isCreatingCourse: false });
      return course;
    } catch (error: any) {
      set({
        error: error.response?.data || {
          success: false,
          error: {
            code: "CREATE_ERROR",
            message: "Kurs oluşturulurken hata oluştu",
          },
          timestamp: new Date().toISOString(),
        },
        isCreatingCourse: false,
      });
      return null;
    }
  },

  enrollInCourse: async (courseId) => {
    set({ isEnrolling: true, error: null });
    try {
      const enrollment = await courseService.enrollInCourse(courseId);
      get().addEnrollment(enrollment);
      set({ isEnrolling: false });
      return enrollment;
    } catch (error: unknown) {
      set({
        error: (error as any).response?.data || {
          success: false,
          error: {
            code: "ENROLL_ERROR",
            message: "Kursa kayıt olurken hata oluştu",
          },
          timestamp: new Date().toISOString(),
        },
        isEnrolling: false,
      });
      return null;
    }
  },

  unenrollFromCourse: async (courseId, studentId) => {
    set({ isEnrolling: true, error: null });
    try {
      await courseService.unenrollFromCourse(courseId, studentId);
      // Find and remove the enrollment from state
      const enrollments = get().enrollments;
      const enrollmentToRemove = enrollments.find(
        (e) => e.courseId === courseId && e.studentId === studentId
      );
      if (enrollmentToRemove) {
        get().removeEnrollment(enrollmentToRemove.id);
      }
      set({ isEnrolling: false });
    } catch (error: unknown) {
      set({
        error: (error as any).response?.data || {
          success: false,
          error: {
            code: "UNENROLL_ERROR",
            message: "Kurs kaydı silinirken hata oluştu",
          },
          timestamp: new Date().toISOString(),
        },
        isEnrolling: false,
      });
    }
  },
}));

// Auth types
export type {
  User,
  StudentProfile,
  TeacherProfile,
  ParentProfile,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  AuthResponseData,
  RefreshTokenResponse,
  Student,
  Parent,
  ChildProgress,
  QuizScore,
  ActivityItem
} from './auth.types';

// Course types
export type {
  Course,
  Section,
  Lesson,
  Enrollment,
  Completion,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseSearchQuery,
  AssignTeacherRequest,
  CourseWithDetails,
  CourseListItem,
  CreateSectionRequest,
  UpdateSectionRequest,
  CreateLessonRequest,
  UpdateLessonRequest,
  EnrollStudentRequest,
  UnenrollStudentRequest,
  LessonProgress,
  SectionProgress,
  CourseProgress,
  BulkEnrollRequest,
  BulkUnenrollRequest,
  BulkEnrollResult
} from './course.types';

// Analytics types
export type {
  DashboardStats,
  CourseAnalytics,
  UserAnalytics,
  EnrollmentTrends,
  SystemUsageStats,
  TeacherAssignment,
  SystemAnalytics,
  AnalyticsQuery,
  AnalyticsExportData,
  AnalyticsExportRequest
} from './analytics.types';

// Quiz types
export type {
  Quiz,
  Question,
  Choice,
  Attempt,
  Response,
  CreateQuizRequest,
  UpdateQuizRequest,
  QuizWithDetails,
  QuizListItem,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  QuestionWithChoices,
  QuestionWithDetails,
  CreateChoiceRequest,
  UpdateChoiceRequest,
  StartQuizAttemptRequest,
  SubmitQuizAttemptRequest,
  SubmitResponseRequest,
  AttemptWithDetails,
  AttemptWithStudent,
  ResponseWithDetails,
  QuizResult,
  QuizResponseResult,
  QuizStatistics,
  QuestionStatistics,
  ChoiceStatistics,
  StudentQuizProgress,
  StudentQuizAttempt,
  QuizSearchQuery,
  QuizValidationResult
} from './quiz.types';

// API types
export * from './api.types';

// Notification types
export * from './notification.types';

// Enrollment types
export * from './enrollment.types';
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum NotificationType {
  ENROLLMENT_APPROVED = 'ENROLLMENT_APPROVED',
  ENROLLMENT_REJECTED = 'ENROLLMENT_REJECTED',
  COURSE_ASSIGNED = 'COURSE_ASSIGNED',
  QUIZ_COMPLETED = 'QUIZ_COMPLETED',
  LESSON_COMPLETED = 'LESSON_COMPLETED',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT'
}

export interface CreateNotificationRequest {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
}

export interface UpdateNotificationRequest {
  read?: boolean;
}

export interface NotificationQuery {
  userId: string;
  read?: boolean;
  type?: NotificationType;
  page?: number;
  limit?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
}

export interface NotificationResponse {
  items: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface MarkAsReadRequest {
  notificationId: string;
}

export interface DeleteNotificationRequest {
  notificationId: string;
}
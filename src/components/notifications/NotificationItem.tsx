'use client';

import { Notification, NotificationType } from '@/types/notification.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  BookOpen, 
  Trophy, 
  GraduationCap, 
  Bell,
  Trash2,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useMarkAsRead, useDeleteNotification } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.ENROLLMENT_APPROVED:
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case NotificationType.ENROLLMENT_REJECTED:
      return <XCircle className="h-5 w-5 text-red-500" />;
    case NotificationType.COURSE_ASSIGNED:
      return <BookOpen className="h-5 w-5 text-blue-500" />;
    case NotificationType.QUIZ_COMPLETED:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case NotificationType.LESSON_COMPLETED:
      return <GraduationCap className="h-5 w-5 text-purple-500" />;
    case NotificationType.SYSTEM_ANNOUNCEMENT:
      return <Bell className="h-5 w-5 text-gray-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case NotificationType.ENROLLMENT_APPROVED:
      return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
    case NotificationType.ENROLLMENT_REJECTED:
      return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
    case NotificationType.COURSE_ASSIGNED:
      return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    case NotificationType.QUIZ_COMPLETED:
      return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
    case NotificationType.LESSON_COMPLETED:
      return 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800';
    case NotificationType.SYSTEM_ANNOUNCEMENT:
      return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    default:
      return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
  }
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const markAsReadMutation = useMarkAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const handleMarkAsRead = () => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const handleDelete = () => {
    deleteNotificationMutation.mutate(notification.id);
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: tr,
  });

  return (
    <div
      className={`
        p-4 border rounded-lg transition-all duration-200 hover:shadow-md
        ${notification.read 
          ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
          : getNotificationColor(notification.type)
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {notification.message}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {timeAgo}
                </span>
                {!notification.read && (
                  <Badge variant="secondary" className="text-xs">
                    Yeni
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAsRead}
                  disabled={markAsReadMutation.isPending}
                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Okundu olarak işaretle"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleteNotificationMutation.isPending}
                className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600"
                title="Bildirimi sil"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
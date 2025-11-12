'use client';

import { useNotifications, useUnreadCount, useMarkAllAsRead, useDeleteAllRead } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { EnrollmentNotificationItem } from './EnrollmentNotificationItem';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCheck, Trash2, Bell } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationType } from '@/types/notification.types';

export function NotificationList() {
  const { data: notificationData, isLoading, error } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteAllReadMutation = useDeleteAllRead();

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 text-sm">
          Bildirimler yüklenirken bir hata oluştu
        </div>
      </div>
    );
  }

  const notifications = notificationData?.items || [];

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Henüz bildirim yok
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Yeni bildirimler burada görünecek
        </p>
      </div>
    );
  }

  const hasUnread = unreadCount > 0;
  const hasRead = notifications.some(n => n.read);

  return (
    <div className="max-h-96 overflow-y-auto">
      {/* Header with actions */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Bildirimler
            </h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} yeni
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {hasUnread && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="text-xs h-8"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Tümünü Okundu İşaretle
              </Button>
            )}
            
            {hasRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteAllReadMutation.mutate()}
                disabled={deleteAllReadMutation.isPending}
                className="text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Okunanları Sil
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notification items */}
      <div className="p-4 space-y-3">
        {notifications.map((notification) => {
          // Enrollment ile ilgili bildirimler için özel bileşen kullan
          if (notification.type === NotificationType.ENROLLMENT_APPROVED || 
              notification.type === NotificationType.ENROLLMENT_REJECTED) {
            return (
              <EnrollmentNotificationItem
                key={notification.id}
                notification={notification}
              />
            );
          }
          
          // Diğer bildirimler için varsayılan bileşen
          return (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          );
        })}
      </div>
    </div>
  );
}
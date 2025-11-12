'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Notification, NotificationType } from '@/types/notification.types';
import { CheckCircle, XCircle, Clock, BookOpen, Eye, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useMarkAsRead, useDeleteNotification } from '@/hooks/useNotifications';
import Link from 'next/link';

interface EnrollmentNotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function EnrollmentNotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}: EnrollmentNotificationItemProps) {
  const markAsRead = useMarkAsRead();
  const deleteNotification = useDeleteNotification();

  const handleMarkAsRead = () => {
    if (!notification.read) {
      markAsRead.mutate(notification.id);
      onMarkAsRead?.(notification.id);
    }
  };

  const handleDelete = () => {
    deleteNotification.mutate(notification.id);
    onDelete?.(notification.id);
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case NotificationType.ENROLLMENT_APPROVED:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case NotificationType.ENROLLMENT_REJECTED:
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <BookOpen className="h-5 w-5 text-blue-600" />;
    }
  };

  const getNotificationColor = () => {
    switch (notification.type) {
      case NotificationType.ENROLLMENT_APPROVED:
        return 'border-l-green-400 bg-green-50';
      case NotificationType.ENROLLMENT_REJECTED:
        return 'border-l-red-400 bg-red-50';
      default:
        return 'border-l-blue-400 bg-blue-50';
    }
  };

  const getActionButton = () => {
    switch (notification.type) {
      case NotificationType.ENROLLMENT_APPROVED:
        // Mesajdan kurs ID'sini çıkarmaya çalış (backend'den gelen mesajda olmalı)
        const courseIdMatch = notification.message.match(/kurs.*?([a-f0-9-]{36})/i);
        const courseId = courseIdMatch?.[1];
        
        if (courseId) {
          return (
            <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
              <Link href={`/student/courses/${courseId}`}>
                <BookOpen className="h-4 w-4 mr-2" />
                Kursa Git
              </Link>
            </Button>
          );
        }
        return (
          <Button asChild size="sm" variant="outline">
            <Link href="/student/enrollment-requests">
              <Eye className="h-4 w-4 mr-2" />
              Başvurularım
            </Link>
          </Button>
        );
        
      case NotificationType.ENROLLMENT_REJECTED:
        return (
          <Button asChild size="sm" variant="outline">
            <Link href="/student/enrollment-requests">
              <Eye className="h-4 w-4 mr-2" />
              Başvurularım
            </Link>
          </Button>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card className={`${getNotificationColor()} border-l-4 ${!notification.read ? 'shadow-md' : 'opacity-75'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-1">
            {getNotificationIcon()}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {notification.title}
                  {!notification.read && (
                    <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 text-xs">
                      Yeni
                    </Badge>
                  )}
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  {notification.message}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    {formatDistanceToNow(new Date(notification.createdAt), { 
                      addSuffix: true, 
                      locale: tr 
                    })}
                  </span>
                  <span>•</span>
                  <span className="capitalize">
                    {notification.type === NotificationType.ENROLLMENT_APPROVED && 'Kayıt Onayı'}
                    {notification.type === NotificationType.ENROLLMENT_REJECTED && 'Kayıt Reddi'}
                  </span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAsRead}
                    disabled={markAsRead.isPending}
                    className="h-8 w-8 p-0"
                    title="Okundu olarak işaretle"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteNotification.isPending}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Bildirimi sil"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="mt-3">
              {getActionButton()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
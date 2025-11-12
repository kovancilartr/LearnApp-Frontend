'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store';
import { NOTIFICATION_QUERY_KEYS } from '@/hooks/useNotifications';
import { Notification, NotificationType } from '@/types/notification.types';
import { toast } from 'react-hot-toast';

interface WebSocketMessage {
  type: 'notification' | 'enrollment_update' | 'ping';
  data?: Notification;
  payload?: any;
}

export function useRealtimeNotifications() {
  const { user, accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (!user || !accessToken) return;

    try {
      // WebSocket URL'ini environment'a göre ayarla
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = process.env.NEXT_PUBLIC_WS_URL || `${wsProtocol}//${window.location.host}`;
      const wsUrl = `${wsHost}/ws?token=${accessToken}`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected for notifications');
        reconnectAttempts.current = 0;
        
        // Ping mesajı gönder
        wsRef.current?.send(JSON.stringify({ type: 'ping' }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'notification':
              if (message.data) {
                handleNewNotification(message.data);
              }
              break;
              
            case 'enrollment_update':
              if (message.payload) {
                handleEnrollmentUpdate(message.payload);
              }
              break;
              
            case 'ping':
              // Pong gönder
              wsRef.current?.send(JSON.stringify({ type: 'pong' }));
              break;
          }
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        
        // Otomatik yeniden bağlanma
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const handleNewNotification = (notification: Notification) => {
    // Query cache'i güncelle
    queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.notifications });
    queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.unreadCount });
    
    // Toast bildirimi göster
    showNotificationToast(notification);
  };

  const handleEnrollmentUpdate = (payload: any) => {
    // Enrollment ile ilgili cache'leri güncelle
    queryClient.invalidateQueries({ queryKey: ['enrollment-requests'] });
    queryClient.invalidateQueries({ queryKey: ['my-enrollment-requests'] });
    
    // Eğer enrollment notification'ı ise özel toast göster
    if (payload.type === 'enrollment_approved' || payload.type === 'enrollment_rejected') {
      const message = payload.type === 'enrollment_approved' 
        ? `${payload.courseTitle} kursuna kayıt talebiniz onaylandı!`
        : `${payload.courseTitle} kursuna kayıt talebiniz reddedildi.`;
        
      toast.success(message, {
        duration: 5000,
        icon: payload.type === 'enrollment_approved' ? '✅' : '❌'
      });
    }
  };

  const showNotificationToast = (notification: Notification) => {
    const getToastIcon = () => {
      switch (notification.type) {
        case NotificationType.ENROLLMENT_APPROVED:
          return '✅';
        case NotificationType.ENROLLMENT_REJECTED:
          return '❌';
        case NotificationType.COURSE_ASSIGNED:
          return '📚';
        case NotificationType.QUIZ_COMPLETED:
          return '🎯';
        case NotificationType.LESSON_COMPLETED:
          return '📖';
        default:
          return '🔔';
      }
    };

    const getToastType = () => {
      switch (notification.type) {
        case NotificationType.ENROLLMENT_APPROVED:
          return 'success';
        case NotificationType.ENROLLMENT_REJECTED:
          return 'error';
        default:
          return 'success';
      }
    };

    if (getToastType() === 'success') {
      toast.success(`${notification.title}\n${notification.message}`, {
        duration: 4000,
        icon: getToastIcon()
      });
    } else {
      toast.error(`${notification.title}\n${notification.message}`, {
        duration: 4000,
        icon: getToastIcon()
      });
    }
  };

  useEffect(() => {
    if (user && accessToken) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user, accessToken]);

  // Sayfa kapatılırken bağlantıyı kapat
  useEffect(() => {
    const handleBeforeUnload = () => {
      disconnect();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      disconnect();
    };
  }, []);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    reconnectAttempts: reconnectAttempts.current,
    connect,
    disconnect
  };
}
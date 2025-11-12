'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { NOTIFICATION_QUERY_KEYS } from '@/hooks/useNotifications';
import { notificationService } from '@/lib/services/notification.service';
import { toast } from 'react-hot-toast';

interface PollingOptions {
  interval?: number; // milliseconds
  enabled?: boolean;
}

export function useNotificationPolling(options: PollingOptions = {}) {
  const { interval = 30000, enabled = true } = options; // Default 30 seconds
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUnreadCountRef = useRef<number>(0);

  const startPolling = () => {
    if (!user || !enabled) return;

    // İlk unread count'u al
    notificationService.getUnreadCount().then(count => {
      lastUnreadCountRef.current = count;
    }).catch(() => {
      // Hata durumunda sessizce devam et
    });

    intervalRef.current = setInterval(async () => {
      try {
        // Unread count'u kontrol et
        const currentUnreadCount = await notificationService.getUnreadCount();
        
        // Eğer unread count artmışsa yeni bildirim var demektir
        if (currentUnreadCount > lastUnreadCountRef.current) {
          const newNotificationCount = currentUnreadCount - lastUnreadCountRef.current;
          
          // Cache'i güncelle
          queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.notifications });
          queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.unreadCount });
          
          // Toast göster
          if (newNotificationCount === 1) {
            toast.success('Yeni bir bildiriminiz var!', {
              icon: '🔔',
              duration: 3000
            });
          } else {
            toast.success(`${newNotificationCount} yeni bildiriminiz var!`, {
              icon: '🔔',
              duration: 3000
            });
          }
        }
        
        lastUnreadCountRef.current = currentUnreadCount;
        
      } catch (error) {
        console.error('Notification polling error:', error);
        // Hata durumunda polling'i durdurmayız, sadece log'larız
      }
    }, interval);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const restartPolling = () => {
    stopPolling();
    startPolling();
  };

  useEffect(() => {
    if (enabled && user) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [user, enabled, interval]);

  // Sayfa focus/blur olaylarını dinle
  useEffect(() => {
    const handleFocus = () => {
      if (enabled && user) {
        // Sayfa focus olduğunda hemen kontrol et
        queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.notifications });
        queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.unreadCount });
        restartPolling();
      }
    };

    const handleBlur = () => {
      // Sayfa blur olduğunda polling'i durdur (performans için)
      stopPolling();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [enabled, user]);

  return {
    isPolling: intervalRef.current !== null,
    startPolling,
    stopPolling,
    restartPolling
  };
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '@/lib/services';
import { toast } from 'react-hot-toast';

export const NOTIFICATION_QUERY_KEYS = {
  notifications: ['notifications'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

export function useNotifications(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: [...NOTIFICATION_QUERY_KEYS.notifications, page, limit],
    queryFn: () => NotificationService.getNotifications(page, limit),
    refetchInterval: 30000, // 30 saniyede bir yenile
    staleTime: 10000, // 10 saniye boyunca fresh kabul et
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
    queryFn: NotificationService.getUnreadCount,
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: NotificationService.markAsRead,
    onSuccess: () => {
      // Bildirimleri ve okunmamış sayısını yenile
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.notifications });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.unreadCount });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || 'Bildirim okundu olarak işaretlenemedi');
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: NotificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.notifications });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.unreadCount });
      toast.success('Tüm bildirimler okundu olarak işaretlendi');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || 'Bildirimler işaretlenemedi');
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: NotificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.notifications });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.unreadCount });
      toast.success('Bildirim silindi');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || 'Bildirim silinemedi');
    },
  });
}

export function useDeleteAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: NotificationService.deleteAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.notifications });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.unreadCount });
      toast.success('Okunmuş bildirimler silindi');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || 'Bildirimler silinemedi');
    },
  });
}
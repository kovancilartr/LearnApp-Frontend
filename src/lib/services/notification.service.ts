import { apiClient } from "../api";
import { NotificationResponse } from "@/types/notification.types";

export const notificationService = {
  async getNotifications(
    page: number = 1,
    limit: number = 20
  ): Promise<NotificationResponse> {
    const response = await apiClient.get<NotificationResponse>(
      `/notifications?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>(
      "/notifications/count"
    );
    return response.data.count;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.post<void>(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post<void>("/notifications/mark-all-read");
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete<void>(`/notifications/${notificationId}`);
  },

  async deleteAllRead(): Promise<void> {
    await apiClient.client.delete(`${this.BASE_URL}/cleanup`, {
      data: {
        readOnly: true,
        olderThanDays: 0, // Tüm okunmuş bildirimleri sil
      },
    });
  },
};

// Backward compatibility
export const NotificationService = {
  getNotifications: notificationService.getNotifications,
  getUnreadCount: notificationService.getUnreadCount,
  markAsRead: notificationService.markAsRead,
  markAllAsRead: notificationService.markAllAsRead,
  deleteNotification: notificationService.deleteNotification,
  deleteAllRead: notificationService.deleteAllRead,
};

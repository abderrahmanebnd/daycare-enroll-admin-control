import { Notification, UserRole } from "@/types";
import { MOCK_NOTIFICATIONS } from "./mockData";
import axiosPrivate from "@/axios/axios";

// Mock service for notifications
class NotificationService {
  private notifications: Notification[] = [...MOCK_NOTIFICATIONS];

  async getAllNotifications(): Promise<Notification[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [...this.notifications];
  }

  async getNotificationById(id: string): Promise<Notification | undefined> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return this.notifications.find((notification) => notification.id === id);
  }

  async getNotificationsByRole(role: UserRole): Promise<Notification[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return this.notifications.filter(
      (notification) => notification.targetRole === role
    );
  }

  async getNotificationsByUserId(): Promise<Notification[]> {
    const { data } = await axiosPrivate.get(`/notifications/me`);
    return data.data;
  }

  async createNotification(
    notification: Omit<Notification, "id" | "createdAt">
  ): Promise<Notification> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newNotification: Notification = {
      ...notification,
      id: (this.notifications.length + 1).toString(),
      createdAt: new Date().toISOString(),
    };

    this.notifications.push(newNotification);
    return newNotification;
  }

  async markAsRead(id: string): Promise<Notification | undefined> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const index = this.notifications.findIndex(
      (notification) => notification.id === id
    );

    if (index === -1) {
      return undefined;
    }

    const updatedNotification: Notification = {
      ...this.notifications[index],
      read: true,
    };

    this.notifications[index] = updatedNotification;
    return updatedNotification;
  }

  async markAllAsRead(userId: string): Promise<number> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let count = 0;

    this.notifications = this.notifications.map((notification) => {
      if (
        (notification.targetUserId === userId ||
          (notification.targetRole === "parent" && userId.startsWith("3")) ||
          (notification.targetRole === "educator" && userId.startsWith("2")) ||
          (notification.targetRole === "admin" && userId.startsWith("1"))) &&
        !notification.read
      ) {
        count++;
        return { ...notification, read: true };
      }
      return notification;
    });

    return count;
  }
}

export const notificationService = new NotificationService();

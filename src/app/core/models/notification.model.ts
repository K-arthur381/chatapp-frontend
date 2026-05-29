export interface AppNotification {
  notificationId: string;
  userId: string;
  type: string;
  title: string;
  body?: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: Date;
}
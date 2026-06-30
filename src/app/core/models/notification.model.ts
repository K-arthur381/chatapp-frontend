export interface AppNotification {
  notificationId: string;
  type: string;
  title: string;
  body?: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: Date;
}
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { SignalRService } from '../../../core/services/signalr.service';
import { AppNotification } from '../../../core/models/notification.model';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-notification-panel',
  templateUrl: './notification-panel.component.html',
  styleUrls: ['./notification-panel.component.css']
})
export class NotificationPanelComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  
  notifications: AppNotification[] = [];
  loading = false;
 private subs = new Subscription();
  constructor(
    private toast : ToastService ,
    private notificationService: NotificationService,
    private signalR: SignalRService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
   
  }


  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  markAsRead(notification: AppNotification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.notificationId).subscribe();
      notification.isRead = true;
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
    });
  }

  getTimeAgo(date: Date): string {
    const now = new Date().getTime();
    const then = new Date(date).getTime();
    const diff = Math.floor((now - then) / 1000);
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }
}
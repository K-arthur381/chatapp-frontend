import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DeviceService } from './device.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private messaging: any = null;
  private initialized = false;
  public notificationReceived = new BehaviorSubject<any>(null);

  constructor(private deviceService: DeviceService) {}

  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    );
  }

  private async initializeFirebase(): Promise<void> {
    if (this.initialized) return;

    if (!this.isSupported()) {
      console.warn('⚠️ Push notifications not supported');
      return;
    }

    try {
      const { initializeApp } = await import('firebase/app');
      const { getMessaging } = await import('firebase/messaging');

      const app = initializeApp(environment.firebase);
      this.messaging = getMessaging(app);
      this.initialized = true;
      console.log('✅ Firebase Messaging initialized');
    } catch (err) {
      console.error('❌ Firebase initialization failed:', err);
    }
  }

  async requestPermission(): Promise<string | null> {
    // if (!this.isSupported()) {
    //   console.log('⚠️ Push notifications not supported');
    //   return null;
    // }

    try {
      await this.initializeFirebase();
      if (!this.messaging) return null;

   //   const permission = await Notification.requestPermission();
   const permission = 'granted';

      if (permission === 'granted') {
        console.log('✅ Notification permission GRANTED');

        const { getToken } = await import('firebase/messaging');
        const token = await getToken(this.messaging, {
          vapidKey: environment.firebase.vapidKey
        });

        if (token) {
          console.log('📱 FCM Token:', token);

          this.deviceService.registerDevice(token, 'mobile').subscribe({
            next: () => console.log('✅ Device registered'),
            error: (err) => console.error('Device registration failed:', err)
          });

          this.listenForForegroundMessages();
          return token;
        }
      } else {
        console.log('❌ Notification permission DENIED');
      }
    } catch (err) {
      console.error('Permission error:', err);
    }
    return null;
  }

  // ✅ Listen for FOREGROUND messages (app is open & focused)
  private async listenForForegroundMessages(): Promise<void> {
    if (!this.messaging) {
      console.error('❌ No messaging instance');
      return;
    }

    try {
      const { onMessage } = await import('firebase/messaging');

      onMessage(this.messaging, (payload: any) => {
        console.log('🟢 FOREGROUND MESSAGE RECEIVED:', payload);

        this.notificationReceived.next(payload);

        if (payload.notification) {
          // ✅ Show Viber-style floating notification
          this.showViberNotification(
            payload.notification.title || 'New message',
            payload.notification.body || '',
            payload.data?.conversationId
          );
        }
      });

      console.log('✅ Foreground message listener ACTIVE');
    } catch (err) {
      console.error('❌ Failed to listen for foreground messages:', err);
    }
  }

  // ✅ VIBER-STYLE FLOATING NOTIFICATION
  private showViberNotification(title: string, body: string, conversationId?: string): void {
    // Remove existing
    const existing = document.getElementById('viber-notif');
    if (existing) existing.remove();

    // Create notification element
    const notif = document.createElement('div');
    notif.id = 'viber-notif';
    notif.innerHTML = `
      <div class="viber-notif-inner">
        <div class="viber-notif-icon">💬</div>
        <div class="viber-notif-content">
          <div class="viber-notif-title">${this.escapeHtml(title)}</div>
          <div class="viber-notif-body">${this.escapeHtml(body)}</div>
        </div>
        <button class="viber-notif-close" id="viber-close">✕</button>
      </div>
    `;

    // Add styles
    if (!document.getElementById('viber-styles')) {
      const style = document.createElement('style');
      style.id = 'viber-styles';
      style.textContent = `
        #viber-notif {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 999999;
          animation: viberIn 0.35s ease-out;
        }
        .viber-notif-inner {
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
          border-radius: 16px;
          padding: 14px 16px;
          min-width: 300px;
          max-width: 380px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          border-left: 4px solid #2563eb;
          cursor: pointer;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .viber-notif-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(37,99,235,0.2);
        }
        .viber-notif-content {
          flex: 1;
          min-width: 0;
        }
        .viber-notif-title {
          font-weight: 600;
          font-size: 14px;
          color: #1f2937;
          margin-bottom: 2px;
          line-height: 1.3;
        }
        .viber-notif-body {
          font-size: 13px;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .viber-notif-close {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: #f3f4f6;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #9ca3af;
          transition: all 0.2s;
        }
        .viber-notif-close:hover {
          background: #fee2e2;
          color: #ef4444;
        }
        @keyframes viberIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes viberOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(120%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notif);

    // Click → navigate to chat
    notif.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).id !== 'viber-close') {
        if (conversationId) {
          window.location.href = `/chat/${conversationId}`;
        }
        this.removeViberNotification();
      }
    });

    // Close button
    const closeBtn = notif.querySelector('#viber-close');
    closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeViberNotification();
    });

    // Auto-dismiss after 5 seconds
    const timeout = setTimeout(() => this.removeViberNotification(), 5000);
    (notif as any)._timeout = timeout;
  }

  private removeViberNotification(): void {
    const el = document.getElementById('viber-notif');
    if (!el) return;

    clearTimeout((el as any)._timeout);
    el.style.animation = 'viberOut 0.3s ease-in';

    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 300);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async deleteToken(): Promise<void> {
    if (!this.messaging) return;
    try {
      const { getToken } = await import('firebase/messaging');
      const token = await getToken(this.messaging, { vapidKey: environment.firebase.vapidKey });
      if (token) {
        this.deviceService.unregisterDevice(token).subscribe();
      }
    } catch (err) {
      console.error('Delete token failed:', err);
    }
  }
}
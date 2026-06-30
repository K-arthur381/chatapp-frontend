import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PushNotificationService } from '../../../core/services/push-notification.service';
import { SignalRService } from '../../../core/services/signalr.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
 fcmToken: string | null = null;
  constructor(
    private fb: FormBuilder,
    private pushService: PushNotificationService,
    private auth: AuthService,
    private router: Router,
    private signalR: SignalRService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

async getMyDeviceToken() {
    // This will prompt for notification permission and return the token
    const token = await this.pushService.requestPermission();
    this.fcmToken = token;
    console.log('📱 My FCM Token:', token);
    
    // Copy to clipboard automatically
    if (token) {
      await navigator.clipboard.writeText(token);
      alert('Token copied to clipboard! Share it with your team.');
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    
    this.auth.login(this.loginForm.value).subscribe({
      next: async () => {
        // Start SignalR connection
        this.signalR.startConnection();

        // ✅ Check if browser supports notifications
        if (!this.pushService.isSupported()) {
          console.log('Push notifications not supported in this browser');
          this.router.navigate(['/chat']);
          return;
        }

        // ✅ Request permission and show result
        try {
          const token = await this.pushService.requestPermission();
          
          if (token) {
            // ✅ Success
            console.log('✅ Notifications ENABLED - Token:', token);
            // Optional: show a subtle toast instead of alert
            alert('🔔 Notifications enabled! You will receive message notifications.');
          } else {
            // ✅ Denied or failed
            console.log('❌ Notifications NOT enabled');
            alert('⚠️ Notifications are disabled. You won\'t receive alerts for new messages.\n\nYou can enable them later in your browser settings.');
          }
        } catch (err) {
          console.error('Notification setup error:', err);
        }

        // Navigate to chat regardless
        this.router.navigate(['/chat']);
      },
      error: () => {
        this.loading = false;
        alert('Invalid credentials');
      }
    });
  }
}
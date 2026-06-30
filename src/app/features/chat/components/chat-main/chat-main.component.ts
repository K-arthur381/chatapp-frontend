import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { SignalRService } from '../../../../core/services/signalr.service';
import { ChatService } from '../../../../core/services/chat.service';
import { Subscription } from 'rxjs';
import { User } from '../../../../core/models/user.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-chat-main',
  templateUrl: './chat-main.component.html',
  styleUrls: ['./chat-main.component.css']
})
export class ChatMainComponent implements OnInit, OnDestroy {
  isMobile = false;
  showNotifications = false;
unreadNotificationCount = 0;
  currentUser: User | null = null;
  conversationName: string = '';
avatarUrl?: string;
 showNewChatDialog = false;
isOnline: boolean = false;
  conversationId: string | undefined;
  private routeSub: Subscription | undefined;
  currentUserId!: string;
 private subs = new Subscription();

  constructor(
     private toast : ToastService ,
    private notificationService: NotificationService,
    private auth: AuthService,
    private signalR: SignalRService,
      private chatService: ChatService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    // Load unread count
      this.subs.add(
  this.notificationService.getUnreadCount().subscribe(count => {
    this.unreadNotificationCount = count;
  }));
   

  // Listen for real-time updates
    this.subs.add(
  this.signalR.newNotification.subscribe(() => {
    this.unreadNotificationCount++;
  }));

     // Load current user
    this.currentUser = this.auth.getUser();

     this.currentUserId = this.auth.getUser()!.userId;
  this.routeSub = this.route.paramMap.subscribe(params => {
    this.conversationId = params.get('conversationId') ?? undefined;
    if (this.conversationId) {
      this.loadConversationInfo(this.conversationId);
    }
  });
}

toggleNotifications(): void {
  this.showNotifications = !this.showNotifications;

    this.notificationService.getUnreadCount().subscribe(count => {
      this.unreadNotificationCount = count;
    });
  
}

private loadConversationInfo(conversationId: string): void {
  // Fetch from your service or get from the chat list component
  this.chatService.getConversations().subscribe(convs => {
    const conv = convs.find(c => c.conversationId === conversationId);
    if (conv) {
      if (conv.type === 'Private') {
        const other = conv.participants.find(p => p.userId !== this.currentUserId);
        this.conversationName = other?.username ?? 'Chat';
        this.avatarUrl = other?.avatarUrl;
        this.isOnline = other?.isOnline ?? false;
      } else {
        this.conversationName = conv.groupName ?? 'Group';
        this.avatarUrl = conv.groupAvatarUrl;
        this.isOnline = false;
      }
    }
  });
}

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    //this.isMobile = window.innerWidth < 768;
    this.isMobile = window.innerWidth < 1024;
  }

  async logout(): Promise<void> {
    await this.signalR.stopConnection();
    this.auth.logout();
  }

  goBack(): void {
    this.router.navigate(['/chat']);
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

   openNewChatDialog(): void {
    this.showNewChatDialog = true;
  }
}
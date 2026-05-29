import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpEventType } from '@angular/common/http';
import { Message } from '../../../../core/models/message.model';
import { SignalRService } from '../../../../core/services/signalr.service';
import { ChatService } from '../../../../core/services/chat.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { DatePipe } from '@angular/common';
import { MessageInputComponent } from '../message-input/message-input.component';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('messageContainer') private msgContainer!: ElementRef;
 @ViewChild(MessageInputComponent) messageInput!: MessageInputComponent;

  activeConversationId?: string;
  messages: Message[] = [];
  currentUserId!: string;
  private subs = new Subscription();
editingMessageId: string | null = null;
editingContent: string = '';
  conversationName = '';
  lastSeen?: Date;
  conversationType = '';
  avatarUrl?: string;
  isOnline = false;
  replyMessage?: Message;
  typingUsers: any[] = [];

  loadingOlder = false;
  private allOlderLoaded = false;
  private initialTake = 5;
  private pageSize = 20;

  showNewMessageBanner = false;
  hasUnreadMessages = false;
  private isNearBottom = true;
  private scrollThreshold = 100;

  // Group management
  groupMembers: any[] = [];
  showMembers = false;
  isGroupAdmin = false;
  newMemberId = '';
  isUploading: boolean = false;
  uploadProgress: number = 0;

  constructor(
    private route: ActivatedRoute,
    private signalR: SignalRService,
    private chatService: ChatService,
    private auth: AuthService,
    private router: Router
  ) {  this.currentUserId = this.auth.getUser()!.userId;

    this.subs.add(this.route.paramMap.subscribe(params => {
      const id = params.get('conversationId');
      if (id) {
        this.activeConversationId = id;
        this.resetChat();
        this.loadConversationInfo(id);
        this.loadInitialMessages();
         this.markAllMessagesAsRead(id);  // ✅ Mark all as read
      }
    }));



    this.subs.add(this.signalR.messageReceived.subscribe(msg => {
      if (msg.conversationId === this.activeConversationId) this.handleIncomingMessage(msg);
    }));

    this.subs.add(this.signalR.userTyping.subscribe(data => {
      if (data.isTyping) {
        this.typingUsers = [...this.typingUsers.filter(u => u.userId !== data.user.userId), data.user];
      } else {
        this.typingUsers = this.typingUsers.filter(u => u.userId !== data.user.userId);
      }
    }));

    this.subs.add(this.signalR.messageReaction.subscribe(data => {
      const msg = this.messages.find(m => m.messageId === data.messageId);
      if (msg) this.refreshMessage(data.messageId);
    }));

    this.subs.add(this.signalR.messageRead.subscribe(data => {
      const msg = this.messages.find(m => m.messageId === data.messageId);
      if (msg) msg.readCount = Math.min(msg.readCount + 1, msg.totalParticipants);
    }));

    // Group members updated (add/remove)
    this.subs.add(this.signalR.groupMembersUpdated.subscribe(data => {
      if (data.conversationId === this.activeConversationId) {
        this.groupMembers = data.participants;
        const me = data.participants.find((p: { userId: any; }) => p.userId === this.currentUserId);
        if (!me) {
          alert('You have been removed from this group.');
          this.router.navigate(['/chat']);
        } else {
          this.isGroupAdmin = me.role === 'Admin';
        }
      }
    }));


    this.subs.add(
  this.signalR.messageEdited.subscribe(data => {
    const msg = this.messages.find(m => m.messageId === data.messageId);
    if (msg) {
      msg.content = data.content;
      msg.editedAt = new Date(data.editedAt);
      msg.isEdited = true;
    }
  })
);

this.subs.add(
  this.signalR.messageDeleted.subscribe(data => {
    const msg = this.messages.find(m => m.messageId === data.messageId);
    if (msg) {
      msg.isDeleted = true;
      msg.content = 'This message was deleted';
    }
  })
);}

  ngOnInit(): void {
  
  }

  private markAllMessagesAsRead(conversationId: string): void {
  this.chatService.markAllAsRead(conversationId).subscribe({
    next: () => {
      console.log('All messages marked as read');
    },
    error: (err) => console.error('Failed to mark all as read:', err)
  });
}
  ngAfterViewInit() {}

  private resetChat(): void {
    this.messages = [];
    this.loadingOlder = false;
    this.allOlderLoaded = false;
    this.showNewMessageBanner = false;
    this.hasUnreadMessages = false;
    this.replyMessage = undefined;
    this.typingUsers = [];
    this.showMembers = false;
  }

  // private loadInitialMessages(): void {
  //   if (!this.activeConversationId) return;
  //   this.chatService.getMessages(this.activeConversationId, 0, this.initialTake).subscribe(msgs => {
  //     this.messages = [...msgs].reverse();
  //     setTimeout(() => this.scrollToBottom(false), 100);
  //     if (msgs.length < this.initialTake) this.allOlderLoaded = true;
  //   });
  // }

 goBack(): void {
    this.router.navigate(['/chat']);
  }

  private loadInitialMessages(): void {
  if (!this.activeConversationId) return;
  this.chatService.getMessages(this.activeConversationId, 0, this.initialTake).subscribe(msgs => {
    this.messages = [...msgs].reverse();
    setTimeout(() => {
      this.scrollToBottom(false);
      this.markVisibleMessagesAsRead();  // ✅ mark all loaded as read
    }, 100);
    if (msgs.length < this.initialTake) this.allOlderLoaded = true;
  });
}

// Add this method to ChatWindowComponent
private markVisibleMessagesAsRead(): void {
  if (!this.activeConversationId) return;
  
  // Get all message IDs that are not yet read (you can track them or mark all)
  this.messages.forEach(msg => {
    // Only mark messages sent by others as read
    if (msg.sender.userId !== this.currentUserId) {
      // Check if already read (readCount logic)
      this.signalR.markAsRead(msg.messageId);
    }
  });
}

  loadMoreMessages(): void {
    if (!this.activeConversationId || this.loadingOlder || this.allOlderLoaded) return;
    this.loadingOlder = true;
    const skip = this.messages.length;
    this.chatService.getMessages(this.activeConversationId, skip, this.pageSize).subscribe({
      next: (olderMsgs) => {
        if (olderMsgs.length === 0) { this.allOlderLoaded = true; }
        else { this.messages = [...[...olderMsgs].reverse(), ...this.messages]; }
        this.loadingOlder = false;
      },
      error: () => this.loadingOlder = false
    });
  }

  onScroll(): void {
    const el = this.msgContainer.nativeElement;
    const scrolledToBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= this.scrollThreshold;
    this.isNearBottom = scrolledToBottom;
    if (scrolledToBottom && this.showNewMessageBanner) {
      this.showNewMessageBanner = false; this.hasUnreadMessages = false;
    }
    if (el.scrollTop === 0 && !this.loadingOlder && !this.allOlderLoaded) this.loadMoreMessages();
  }

  // private handleIncomingMessage(msg: Message): void {
  //   this.messages = [...this.messages, msg];
  //   this.markAsRead(msg.messageId);
  //   if (this.isNearBottom) { this.scrollToBottom(true); this.showNewMessageBanner = false; }
  //   else { this.showNewMessageBanner = true; this.hasUnreadMessages = true; }
  // }

  private handleIncomingMessage(msg: Message): void {
    // ✅ Check if message already exists (prevent duplicates)
   // alert('receive mesasge')
  const exists = this.messages.some(m => m.messageId === msg.messageId);
  if (exists) return;

  this.messages = [...this.messages, msg];
  
  // Only mark others' messages as read automatically
  if (msg.sender.userId !== this.currentUserId) {
    this.markAsRead(msg.messageId);
  }
  
  if (this.isNearBottom) {
    this.scrollToBottom(true);
    this.showNewMessageBanner = false;
  } else {
    this.showNewMessageBanner = true;
    this.hasUnreadMessages = true;
  }
}

  scrollToNewMessages(): void { this.scrollToBottom(true); this.showNewMessageBanner = false; }

  private scrollToBottom(smooth = false): void {
    try { const el = this.msgContainer.nativeElement; el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' }); } catch (e) {}
  }

  loadConversationInfo(conversationId: string): void {
    this.chatService.getConversations().subscribe(convs => {
      const conv = convs.find(c => c.conversationId === conversationId);
      if (conv) {
        this.conversationType = conv.type;
        if (conv.type === 'Private') {
          const other = conv.participants.find(p => p.userId !== this.currentUserId);
          this.conversationName = other?.username ?? 'Unknown';
          this.avatarUrl = other?.avatarUrl;
          this.isOnline = other?.isOnline ?? false;
          this.lastSeen = other?.lastSeen;
        } else {
          this.conversationName = conv.groupName ?? 'Group';
          this.avatarUrl = conv.groupAvatarUrl;
          this.isOnline = true;
        }
      }
    });
  }

get lastSeenText(): string {
  if (!this.lastSeen) return '';
  
  const now = new Date();
  const lastSeenDate = new Date(this.lastSeen);
  
  // Convert both to UTC milliseconds for accurate comparison
  const nowUtc = Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
    now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()
  );
  
  const lastSeenUtc = Date.UTC(
    lastSeenDate.getUTCFullYear(), lastSeenDate.getUTCMonth(), lastSeenDate.getUTCDate(),
    lastSeenDate.getUTCHours(), lastSeenDate.getUTCMinutes(), lastSeenDate.getUTCSeconds()
  );
  
  const diffMs = nowUtc - lastSeenUtc;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return lastSeenDate.toLocaleDateString();
}

  sendMessage(content: string): void {
    if (!this.activeConversationId || !content.trim()) return;
    this.signalR.sendMessage({
      conversationId: this.activeConversationId,
      content: content.trim(),
      messageType: 'Text',
      replyToMessageId: this.replyMessage?.messageId
    });
    this.cancelReply();
  }

  reactToMessage(messageId: string, reaction: string): void { 
    this.signalR.reactToMessage(messageId, reaction);
    this.refreshMessage(messageId);
   }

  refreshMessage(messageId: string): void {
    if (!this.activeConversationId) return;
    this.chatService.getMessagebyId(messageId).subscribe(msgs => {
      const fresh = msgs;
      if (fresh) {
        const idx = this.messages.findIndex(m => m.messageId === messageId);
        if (idx > -1) this.messages[idx] = fresh;
      }
    });
  }

  setReply(msg: Message): void { 
    this.replyMessage = msg;
  }
  cancelReply(): void { this.replyMessage = undefined; }
  onTyping(isTyping: boolean): void { if (this.activeConversationId) this.signalR.typingIndicator(this.activeConversationId, isTyping); }
  markAsRead(messageId: string): void { this.signalR.markAsRead(messageId); }

  // ─── Group management methods ─────
  toggleMembers(): void {
    this.showMembers = !this.showMembers;
    if (this.showMembers) this.loadGroupMembers();
  }

  loadGroupMembers(): void {
    if (!this.activeConversationId) return;
    this.chatService.getParticipants(this.activeConversationId).subscribe(users => {
      this.groupMembers = users;
      this.isGroupAdmin = users.find(u => u.userId === this.currentUserId)?.role === 'Admin';
    });
  }

  addMember(): void {
    if (!this.activeConversationId || !this.newMemberId.trim()) return;
    this.chatService.addMember(this.activeConversationId, this.newMemberId.trim()).subscribe(() => {
      this.newMemberId = '';
      this.loadGroupMembers();
    }, err => alert(err.error));
  }

  removeMember(userId: string): void {
    if (!this.activeConversationId) return;
    this.chatService.removeMember(this.activeConversationId, userId).subscribe(() => this.loadGroupMembers(), err => alert(err.error));
  }

// Add this property
selectedFile: File | null = null;

// Add this method
// In the template, change (fileSelected) to (filesSelected):
// <app-message-input (send)="sendMessage($event)" (typing)="onTyping($event)" (filesSelected)="onFilesSelected($event)"></app-message-input>

// Replace onFileSelected with onFilesSelected:
// onFilesSelected(files: File[]): void { 
//   if(!this.activeConversationId || files.length === 0) return;

//   files.forEach(file => {
//      if (!this.activeConversationId)  return;  

//     this.chatService.uploadFile(this.activeConversationId, file).subscribe({
//       next: (attachments: any[]) => {
//         if (attachments.length > 0) {
//           const att = attachments[0];
//          // alert(file.type)
//           const isImage = file.type.startsWith('image/');
//           this.signalR.sendMessage({
//             conversationId: this.activeConversationId,
//             content: att.fileUrl,
//             messageType: isImage ? 'Image' : 'File',
//             replyToMessageId: this.replyMessage?.messageId,
//             fileName: att.fileName || file.name,
//             fileSize: att.fileSize || file.size
//           });
//         }
//       },
//       error: (err) => {
//         console.error('Upload failed:', err);
//         alert('File upload failed');
//       }
//     });
//   });
// }

// Edit message
startEditMessage(msg: Message): void {
  this.editingMessageId = msg.messageId;
  this.editingContent = msg.content || '';
}

cancelEdit(): void {
  this.editingMessageId = null;
  this.editingContent = '';
}

saveEdit(): void {
  if (!this.editingMessageId || !this.editingContent.trim()) return;
  
  this.chatService.editMessage(this.editingMessageId, this.editingContent.trim()).subscribe({
    next: () => {
      const msg = this.messages.find(m => m.messageId === this.editingMessageId);
      if (msg) {
        msg.content = this.editingContent.trim();
        msg.editedAt = new Date();
        msg.isEdited = true;
      }
      this.cancelEdit();
    },
    error: () => alert('Failed to edit message')
  });
}

// Delete message
deleteMessage(messageId: string): void {
  if (!confirm('Delete this message?')) return;
  
  this.chatService.deleteMessage(messageId).subscribe({
    next: () => {
      const msg = this.messages.find(m => m.messageId === messageId);
      if (msg) {
        msg.isDeleted = true;
        msg.content = 'This message was deleted';
      }
    },
    error: () => alert('Failed to delete message')
  });
}

// Multi-image upload
// onFilesSelected(files: File[]): void {
//   if (!this.activeConversationId || files.length === 0) return;
  
//   const imageFiles = files.filter(f => f.type.startsWith('image/'));
//   const otherFiles = files.filter(f => !f.type.startsWith('image/'));
  
//   // Upload all files together
//   this.chatService.uploadFiles(this.activeConversationId, files).subscribe({
    
//     next: (attachments: any[]) => {

//       var length=attachments.length;
     

//       if (attachments.length > 0) {
//         const isImage = imageFiles.length > 0;
//         this.signalR.sendMessage({
//           conversationId: this.activeConversationId,
//           content: '',
//           messageType: isImage ? 'Image' : 'File',
//           replyToMessageId: this.replyMessage?.messageId,
//           attachments: attachments  // ✅ Send all attachments
//         });
//       }
//     },
//     error: (err) => {
//       console.error('Upload failed:', err);
//       alert('File upload failed');
//     }
//   });
// }
// onFilesSelected(files: File[]): void {
//   if (!this.activeConversationId || files.length === 0) return;
  
//   this.isUploading = true;
//   this.uploadProgress = 0;
  
//   this.chatService.uploadFiles(this.activeConversationId, files).subscribe({
//     next: (event: any) => {
//       if (event.type === 1) {
//         // Upload progress
//         this.uploadProgress = Math.round(100 * event.loaded / event.total);
//       } else if (event.type === 4) {
//         // Response received
//         const attachments = event.body;
//         this.isUploading = false;
        
//         if (attachments.length > 0) {
//           const isImage = files.every(f => f.type.startsWith('image/'));
//           const attachmentData = attachments.map((att: any) => ({
//             fileUrl: att.fileUrl,
//             fileName: att.fileName,
//             contentType: att.contentType,
//             fileSize: att.fileSize
//           }));

//           this.signalR.sendMessage({
//             conversationId: this.activeConversationId,
//             content: '',
//             messageType: isImage ? 'Image' : 'File',
//             replyToMessageId: this.replyMessage?.messageId,
//             attachments: attachmentData
//           });
//         }
//       }
//     },
//     error: (err) => {
//       console.error('Upload failed:', err);
//       this.isUploading = false;
//       alert('File upload failed');
//     }
//   });
// }

 // ✅ Real file upload with progress
  onFilesSelected(files: File[]): void {
    if (!this.activeConversationId || files.length === 0) return;
    
    // Show progress in input component
    this.messageInput?.showUploadProgress(files.length);
    
    this.chatService.uploadFiles(this.activeConversationId, files).subscribe({
      next: (event: any) => {
        // ✅ Handle HTTP events
        if (event.type === HttpEventType.UploadProgress) {
          // Calculate progress percentage
          const percentDone = Math.round(100 * event.loaded / (event.total || 1));
          this.messageInput?.updateProgress(percentDone);
        }
        else if (event.type === HttpEventType.Response) {
          // Upload complete - get the response body
          const attachments = event.body;
          
          // Hide progress
          this.messageInput?.hideUploadProgress();
          
          if (attachments && attachments.length > 0) {
            const isImage = files.every(f => f.type.startsWith('image/'));
            const attachmentData = attachments.map((att: any) => ({
              fileUrl: att.fileUrl,
              fileName: att.fileName,
              contentType: att.contentType,
              fileSize: att.fileSize
            }));

            // Send ONE message with all attachments
            this.signalR.sendMessage({
              conversationId: this.activeConversationId,
              content: '',
              messageType: isImage ? 'Image' : 'File',
              replyToMessageId: this.replyMessage?.messageId,
              attachments: attachmentData
            });
          }
        }
      },
      error: (err) => {
        console.error('Upload failed:', err);
        this.messageInput?.hideUploadProgress();
        alert('File upload failed');
      }
    });
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }
}
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-new-chat-dialog',
  templateUrl: './new-chat-dialog.component.html',
  styleUrls: ['./new-chat-dialog.component.css']
})
export class NewChatDialogComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  users: User[] = [];
  isGroup = false;
  groupName: string = '';
  groupDescription: string = '';
  selectedUsers: User[] = [];
  loading = false;
  searchQuery: string = '';
  
  // Group image
  groupImagePreview: string | null = null;
  selectedGroupImage: File | null = null;

  constructor(
    private chatService: ChatService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.chatService.getUsers().subscribe(users => this.users = users);
  }

  get filteredUsers(): User[] {
    if (!this.searchQuery.trim()) return this.users;
    const query = this.searchQuery.toLowerCase();
    return this.users.filter(u => 
      u.username.toLowerCase().includes(query) || 
      u.email.toLowerCase().includes(query)
    );
  }

  toggleGroup(): void {
    this.isGroup = !this.isGroup;
    this.selectedUsers = [];
    this.searchQuery = '';
    this.groupName = '';
    this.groupDescription = '';
    this.groupImagePreview = null;
    this.selectedGroupImage = null;
  }

  toggleUserSelection(user: User): void {
    const idx = this.selectedUsers.findIndex(u => u.userId === user.userId);
    if (idx > -1) {
      this.selectedUsers.splice(idx, 1);
    } else {
      if (this.isGroup) {
        this.selectedUsers.push(user);
      } else {
        this.selectedUsers = [user];
      }
    }
  }

  isSelected(userId: string): boolean {
    return this.selectedUsers.some(u => u.userId === userId);
  }

  // Group image upload
  onGroupImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedGroupImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.groupImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeGroupImage(): void {
    this.selectedGroupImage = null;
    this.groupImagePreview = null;
  }

  startChat(): void {
    if (!this.isGroup && this.selectedUsers.length !== 1) return;
    if (this.isGroup && (!this.groupName.trim() || this.selectedUsers.length === 0)) return;

    const currentUserId = this.auth.getUser()!.userId;
    const memberIds = [currentUserId, ...this.selectedUsers.map(u => u.userId)];

    this.loading = true;
    
    // If group with image, upload first then create
    if (this.isGroup && this.selectedGroupImage) {
      this.chatService.uploadFile('4025b051-8576-46dc-99de-14753fd1c963', this.selectedGroupImage).subscribe({
        next: (attachments: any[]) => {
          const avatarUrl = attachments[0]?.fileUrl || null;
          this.createConversation(memberIds, avatarUrl);
        },
        error: () => {
          this.loading = false;
          alert('Failed to upload group image');
        }
      });
    } else {
      this.createConversation(memberIds, null);
    }
  }

  private createConversation(memberIds: string[], groupAvatarUrl: string | null): void {
    const dto = this.isGroup
      ? { type: 'Group', groupName: this.groupName, memberIds, groupAvatarUrl }
      : { type: 'Private', memberIds };

    this.chatService.createConversation(dto).subscribe({
      next: (conv) => {
        this.router.navigate(['/chat', conv.conversationId]);
        this.close.emit();
      },
      error: () => {
        this.loading = false;
        alert('Failed to create conversation');
      }
    });
  }
}
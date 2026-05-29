import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../../../../core/services/chat.service';
import { StorageService } from '../../../../core/services/storage.service';
import { Conversation } from '../../../../core/models/conversation.model';
import { Subscription } from 'rxjs';
import { SignalRService } from '../../../../core/services/signalr.service';
import { Message } from '../../../../core/models/message.model';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css']
})
export class ChatListComponent implements OnInit {
  conversations: Conversation[] = [];
  selectedId?: string;
 showNewChatDialog = false;
currentUserId?: string;
private subs = new Subscription();

  constructor(private chatService: ChatService,private signalR: SignalRService, private storage: StorageService, private router: Router) {}


// ngOnInit(): void {
  

//   this.chatService.getConversations()
//     .subscribe(convs => this.conversations = convs);
// }

ngOnInit(): void {
  const cachedUser = this.storage.getUser();

  this.currentUserId = cachedUser?.userId;

    this.loadConversations();

    // New conversation created / added to group
    this.subs.add(
      this.signalR.newConversation.subscribe((convDto: any) => {
        const exists = this.conversations.some(c => c.conversationId === convDto.conversationId);
        if (!exists) {
          const newConv: Conversation = {
            conversationId: convDto.conversationId,
            type: convDto.type,
            groupName: convDto.groupName,
            groupAvatarUrl: convDto.groupAvatarUrl,
            participants: convDto.participants,
            lastMessage: convDto.lastMessage,
             unreadCount: 0
          };
          this.conversations.unshift(newConv);
        }
      })
    );

    // Kicked from group
    this.subs.add(
      this.signalR.conversationRemoved.subscribe((conversationId: string) => {
        this.conversations = this.conversations.filter(c => c.conversationId !== conversationId);
        if (this.selectedId === conversationId) {
          this.selectedId = undefined;
          this.router.navigate(['/chat']);
        }
      })
    );

    // New message → update last message + unread count
    this.subs.add(
      this.signalR.messageReceived.subscribe((msg: Message) => {
       
        const conv = this.conversations.find(c => c.conversationId === msg.conversationId);
        if (conv) {
          conv.lastMessage = msg;
          // Increment unread count only if this conversation is NOT currently open
          const selectedId = localStorage.getItem('selectedConversationId');

          if (selectedId !== msg.conversationId) {
           
            conv.unreadCount = (conv.unreadCount || 0) + 1;
          }
          this.sortConversations();
        } else {
          this.loadConversations();
        }
   
       
      })
    );

    // Message read event → reset unread for the currently selected conversation
    this.subs.add(
      this.signalR.messageRead.subscribe(() => {
        const conv = this.conversations.find(c => c.conversationId === this.selectedId);
        if (conv) conv.unreadCount = 0;
      })
    );
  }

  loadConversations(): void {
    this.chatService.getConversations().subscribe(convs => {
      this.conversations = convs;
      this.sortConversations();
    });
  }

    private sortConversations(): void {
    this.conversations.sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.sentAt).getTime() : 0;
      const bTime = b.lastMessage ? new Date(b.lastMessage.sentAt).getTime() : 0;
      return bTime - aTime;
    });
  }

getConversationUserName(conv: Conversation) {
  if (conv.type !== 'Private') {
    return null;
  }


  var result= conv.participants.find(
    p => p.userId !== this.currentUserId
  );
// console.log("Current User Id",this.currentUserId)
// console.log("other User",result?.userId)
  return result?.username ?? null;
}

getConversationUserAvatarUrl(conv: Conversation) {
  if (conv.type !== 'Private') {
    return "";
  }


  var result= conv.participants.find(
    p => p.userId !== this.currentUserId
  );
// console.log("Current User Id",this.currentUserId)
// console.log("other User",result?.userId)
  return result?.avatarUrl ?? "";
}

getConversationUserOnline(conv: Conversation) {
  if (conv.type !== 'Private') {
    return null;
  }

   var result= conv.participants.find(
    p => p.userId !== this.currentUserId
  );
// console.log("Current User Id",this.currentUserId)
// console.log("other User",result?.userId)
  return result?.isOnline ?? null;
}


 selectConversation(id: string): void {

  const savedId = localStorage.getItem('selectedConversationId');
  // If already exists, remove old one
  if (savedId) {
    localStorage.removeItem('selectedConversationId');
  }
  // Save new selected id
  localStorage.setItem('selectedConversationId', id);
  this.selectedId = id;
  const conv = this.conversations.find(
    c => c.conversationId === id
  );
  if (conv) {conv.unreadCount = 0;}
  this.router.navigate(['/chat', id]);
}


   openNewChatDialog(): void {
    this.showNewChatDialog = true;
  }
}
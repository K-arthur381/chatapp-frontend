import { Injectable, EventEmitter } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Message } from '../models/message.model';
import { AppNotification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  
  // ✅ Connection state
  public isConnected = false;
  public connectionEstablished = new EventEmitter<void>();
  private pendingMessages: any[] = [];

  // Events
  public messageReceived = new EventEmitter<Message>();
  public userTyping = new EventEmitter<{ user: any; isTyping: boolean }>();
  public messageRead = new EventEmitter<{ messageId: string; userId: string }>();
  public messageReaction = new EventEmitter<any>();
  public userOnline = new EventEmitter<string>();
  public userOffline = new EventEmitter<string>();
  public newConversation = new EventEmitter<any>();
  public conversationRemoved = new EventEmitter<string>();
  public groupMembersUpdated = new EventEmitter<any>();
  public messageEdited = new EventEmitter<any>();
  public messageDeleted = new EventEmitter<any>();
  public allMessagesRead = new EventEmitter<any>();
  public newNotification = new EventEmitter<AppNotification>();


  constructor(private auth: AuthService) {}

  async startConnection(): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.isConnected = true;
      this.connectionEstablished.emit();
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.hubUrl, {
        accessTokenFactory: () => this.auth.getToken()!,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // ✅ Retry delays
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.registerEvents();

    // ✅ Handle reconnection
    this.hubConnection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      this.isConnected = false;
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR reconnected');
      this.isConnected = true;
      this.connectionEstablished.emit();
      // ✅ Send any pending messages
      this.sendPendingMessages();
    });

    this.hubConnection.onclose(() => {
      console.log('SignalR connection closed');
      this.isConnected = false;
    });

    try {
      await this.hubConnection.start();
      console.log('SignalR connected successfully');
      this.isConnected = true;
      this.connectionEstablished.emit();
      // ✅ Send any messages that were queued while connecting
      this.sendPendingMessages();
    } catch (err) {
      console.error('SignalR connection failed:', err);
      this.isConnected = false;
      // Retry after delay
      setTimeout(() => this.startConnection(), 3000);
    }
  }

  async stopConnection(): Promise<void> {
    this.isConnected = false;
    this.pendingMessages = [];
    if (this.hubConnection) {
      await this.hubConnection.stop();
    }
  }

  private registerEvents(): void {
    this.hubConnection.on('NewMessage', (msg: Message) => this.messageReceived.emit(msg));
    this.hubConnection.on('UserTyping', (data: any) => this.userTyping.emit(data));
    this.hubConnection.on('MessageRead', (data: any) => this.messageRead.emit(data));
    this.hubConnection.on('MessageReaction', (data: any) => this.messageReaction.emit(data));
    this.hubConnection.on('UserOnline', (userId: string) => this.userOnline.emit(userId));
    this.hubConnection.on('UserOffline', (userId: string) => this.userOffline.emit(userId));
    this.hubConnection.on('NewConversation', (data: any) => this.newConversation.emit(data));
    this.hubConnection.on('ConversationRemoved', (id: string) => this.conversationRemoved.emit(id));
    this.hubConnection.on('GroupMembersUpdated', (data: any) => this.groupMembersUpdated.emit(data));
    this.hubConnection.on('MessageEdited', (data: any) => this.messageEdited.emit(data));
    this.hubConnection.on('MessageDeleted', (data: any) => this.messageDeleted.emit(data));
    this.hubConnection.on('AllMessagesRead', (data: any) => this.allMessagesRead.emit(data));
    this.hubConnection.on('NewNotification', (data: AppNotification) => {this.newNotification.emit(data);
});
  }

  // ✅ Queue message if not connected, send immediately if connected
  async sendMessage(dto: any): Promise<void> {
    if (this.isConnected && this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('SendMessage', dto);
      } catch (err) {
        console.error('Send message failed, queuing:', err);
      //  this.pendingMessages.push(dto);
      }
    } else {
      console.log('Not connected, queuing message');
   //   this.pendingMessages.push(dto);
    }
  }

  async typingIndicator(conversationId: string, isTyping: boolean): Promise<void> {
    if (!this.isConnected) return;
    await this.hubConnection.invoke('TypingIndicator', conversationId, isTyping);
  }

  async markAsRead(messageId: string): Promise<void> {
    if (!this.isConnected) return;
    await this.hubConnection.invoke('MarkAsRead', messageId);
  }

  async reactToMessage(messageId: string, reaction: string): Promise<void> {
    if (!this.isConnected) return;
    await this.hubConnection.invoke('ReactToMessage', messageId, reaction);
  }

  // ✅ Send queued messages when connection is established
  private async sendPendingMessages(): Promise<void> {
    if (this.pendingMessages.length === 0) return;
    console.log(`Sending ${this.pendingMessages.length} pending messages`);
    const messages = [...this.pendingMessages];
    this.pendingMessages = [];
    for (const dto of messages) {
      await this.sendMessage(dto);
    }
  }
}
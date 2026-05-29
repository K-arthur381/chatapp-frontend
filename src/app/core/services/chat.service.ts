import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Conversation } from '../models/conversation.model';
import { Message } from '../models/message.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private http: HttpClient) {}

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${environment.apiUrl}/conversations`);
  }

  createConversation(dto: any): Observable<Conversation> {
    return this.http.post<Conversation>(`${environment.apiUrl}/conversations`, dto);
  }

markAllAsRead(conversationId: string): Observable<void> {
  return this.http.post<void>(
    `${environment.apiUrl}/messages/conversation/${conversationId}/mark-all-read`, 
    {}
  );
}

  getMessages(conversationId: string, skip: number, take: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${environment.apiUrl}/messages/conversation/${conversationId}?skip=${skip}&take=${take}`);
  }

  getMessagebyId(messageId: string): Observable<Message> {
    return this.http.get<Message>(`${environment.apiUrl}/messages/${messageId}`);
  }


  uploadFile(conversationId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('files', file);
    return this.http.post(`${environment.apiUrl}/messages/upload?conversationId=${conversationId}`, formData);
  }
  
 // ✅ Real upload with progress tracking
  uploadFiles(conversationId: string, files: File[]): Observable<HttpEvent<any>> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const req = new HttpRequest(
      'POST',
      `${environment.apiUrl}/messages/upload?conversationId=${conversationId}`,
      formData,
      {
        reportProgress: true  // ✅ Enable progress tracking
      }
    );

    return this.http.request(req);
  }
  
  // Group management
  getParticipants(conversationId: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/conversations/${conversationId}/participants`);
  }

  addMember(conversationId: string, userId: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/conversations/${conversationId}/members`, { userId });
  }

  removeMember(conversationId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/conversations/${conversationId}/members/${userId}`);
  }

editMessage(messageId: string, content: string): Observable<void> {
  return this.http.put<void>(`${environment.apiUrl}/messages/${messageId}`, { content });
}

deleteMessage(messageId: string): Observable<void> {
  return this.http.delete<void>(`${environment.apiUrl}/messages/${messageId}`);
}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }
}
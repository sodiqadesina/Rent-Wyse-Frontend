// message.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';


@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private BACKEND_URL =    environment.apiUrl; 

  constructor(private http: HttpClient, private authService: AuthService) {}

  // In message.service.ts
private unreadMessageCount = new BehaviorSubject<number>(0);

getUnreadMessageCount(): Observable<number> {
  return this.unreadMessageCount.asObservable();
}

updateUnreadMessageCount(count: number) {
  this.unreadMessageCount.next(count);
}


  startOrGetConversation(partnerId: string): Observable<any> {
    return this.http.post(`${this.BACKEND_URL}/conversations/start`, { recipientId: partnerId });
  }

  getMessagesForConversation(conversationId: string): Observable<any> {
    return this.http.get(`${this.BACKEND_URL}/conversations/${conversationId}/messages`);
  }

  getAllConversationsForUser(userId: string): Observable<any> {
    return this.http.get(`${this.BACKEND_URL}/conversations/user/${userId}`);
  }

  sendMessage(receiver: string, content: string): Observable<any> {
    return this.http.post(`${this.BACKEND_URL}/messages`, { receiver, content });
  }

  replyMessage(conversationId: string, receiver: string, content: string): Observable<any> {
    return this.http.post(`${this.BACKEND_URL}/messages`,  { conversationId, receiver, content });
  }

  markMessagesAsRead(conversationId: string): Observable<any> {
    // Call the service to mark messages as read
    this.fetchUnreadMessageCount();
    return this.http.patch(`${this.BACKEND_URL}/messages/markAsRead/${conversationId}`, {})
      
  }

fetchUnreadMessageCount(): void {
  const userId = this.authService.getUserId();
  this.http.get<{ count: number }>(`${this.BACKEND_URL}/messages/unreadCount/${userId}`)
    .subscribe(response => {
      this.updateUnreadMessageCount(response.count);
    });
}
  

}

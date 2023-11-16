// messages.component.ts
import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { MessageService } from '../messaging.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/notification/socket.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
  providers: [DatePipe] // Adding DatePipe to the component's providers
})
export class MessagesComponent implements OnInit, AfterViewChecked, OnDestroy{
  conversations: any[] = [];
  selectedConversation: any;
  selectedConversationMessages: any[] = [];
  isLoading = false;
  messageForm: FormGroup; // Add this line
  currentUserId = this.authService.getUserId();
  private newMessageSub!: Subscription;
  conversationReadStatus: { [conversationId: string]: boolean } = {};

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private fb: FormBuilder, // Injecting FormBuilder
    private datePipe: DatePipe, // Injecting DatePipe here
    private route: ActivatedRoute, // Injecting ActivatedRoute here
    private socketService: SocketService
  ) {
    this.messageForm = this.fb.group({ // Initialize the form group
      content: ['', Validators.required] // Add validators as needed
    });
  }

  @ViewChild('messagesContainer')
    private messagesContainer!: ElementRef;

    ngOnInit() {
        this.loadConversations(() => {
          // After conversations have loaded, select the one from the route parameter if it exists
          this.route.params.subscribe(params => {
            const conversationId = params['conversationId'];
            if (conversationId) {
              this.selectConversationById(conversationId);
            }
          });
        });
        this.setupNewMessageListener();
      }

   
      setupNewMessageListener() {
        // Listen for new messages using the existing connection
        this.socketService.onNewMessage((message) => {
          // Find the conversation in the list
          const conversationIndex = this.conversations.findIndex(c => c._id === message.conversationId);
          if (conversationIndex > -1) {
            // Increment the unread message count or set it to 1 if it doesn't exist
            const conversation = this.conversations[conversationIndex];
            conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      
            // Update the conversation in the list to trigger change detection
            this.conversations[conversationIndex] = { ...conversation };
          }
          
          // If the new message belongs to the selected conversation, update the message list
          if (this.selectedConversation && message.conversationId === this.selectedConversation._id) {
            this.selectConversation(this.selectedConversation); // Reload messages
            // Reset the unread count for the selected conversation
            this.resetUnreadCount(this.selectedConversation._id);
            this.isLoading = false;
            this.scrollToBottom();
          }
        });
      }
      
      resetUnreadCount(conversationId: string) {
        const conversationIndex = this.conversations.findIndex(c => c._id === conversationId);
        if (conversationIndex > -1) {
          const conversation = this.conversations[conversationIndex];
          conversation.unreadCount = 0;
          this.conversations[conversationIndex] = { ...conversation };
        }
      }
      
    
      markConversationAsRead(conversationId: string) {
        this.conversationReadStatus[conversationId] = true;
        
      }
      
      

      selectConversationById(conversationId: string) {
        const conversation = this.conversations.find(c => c._id === conversationId);
        if (conversation) {
          this.selectConversation(conversation);
        } else {
          // If we're sure the conversation exists but is not in the loaded list,
          // we might need to fetch it from the server or handle this case appropriately.
          // For now, we log an error.
          console.error('Conversation not found: ', conversationId);
        }
      }
    

  formatDate(date: string) {
    // Formatting the date to a readable format
    return this.datePipe.transform(date, 'MMM d, h:mm a');
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      // Catch any errors that occur during scrolling
      //console.log(err)
    }
  }

  loadConversations(callback?: () => void) {
    this.isLoading = true;
    const userId = this.currentUserId;
    this.messageService.getAllConversationsForUser(userId).subscribe(conversations => {
      this.conversations = conversations.map((convo: { participants: any[]; }) => {
        // Find the other participant's username
        const otherParticipant = convo.participants.find((participant: { _id: string; }) => participant._id !== userId);
        return { ...convo, otherParticipantUsername: otherParticipant?.username };
      });
      this.isLoading = false;
      if (callback) {
        callback(); // Call the callback function if provided
      }
    }, error => {
      // Handle error
      this.isLoading = false;
    });
  }
  

  
// messages.component.ts
selectConversation(conversation: any) {
    this.selectedConversation = conversation;
    this.isLoading = true;
    this.messageService.getMessagesForConversation(conversation._id).subscribe(response => {
      // Update the message list for the selected conversation
      this.selectedConversationMessages = response.messages.sort(
        (a: { createdAt: string | number | Date; }, b: { createdAt: string | number | Date; }) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      this.isLoading = false;
      // Mark the messages in the conversation as read
      this.messageService.markMessagesAsRead(conversation._id).subscribe(() => {
        // Successfully marked as read
        this.resetUnreadCount(conversation._id);
        this.messageService.fetchUnreadMessageCount()
      });
    }, error => {
      console.error('Error fetching messages:', error);
      this.isLoading = false;
    });
  }
  

  
  

  onSendMessage() {
    if (this.messageForm.invalid) {
      return;
    }
    this.isLoading = true;
    const messageContent = this.messageForm.controls['content'].value;
    const recipientId = this.selectedConversation.participants.find((p: { _id: any; }) => p._id !== this.currentUserId)._id; // assuming this.currentUserId holds the ID of the current user

    // Check if we have a recipientId; if not, we cannot send the message
    if (!recipientId) {
      console.error('Recipient ID not found.');
      this.isLoading = false;
      return;
    }
    
    // Check if we have an existing conversationId
    if (this.selectedConversation && this.selectedConversation._id) {
      // Use replyToMessage for existing conversation
      this.messageService.replyMessage(this.selectedConversation._id, recipientId, messageContent).subscribe(() => {
        // Handle successful message sending
        this.afterMessageSent();
      }, (error: any) => {
        // Handle error
        this.handleMessageError(error);
      });
    } else {
      // Use createMessage for the first message in a new conversation
      this.messageService.sendMessage(recipientId, messageContent).subscribe(() => {
        // Handle successful message sending
        this.afterMessageSent();
      }, (error: any) => {
        // Handle error
        this.handleMessageError(error);
      });
    }
  }
  
  afterMessageSent() {
    // After sending the message, clear the form and reload the messages for the conversation
    this.messageForm.reset();
    this.selectConversation(this.selectedConversation); // Reload messages
    this.isLoading = false;
    this.scrollToBottom();
  }
  
  handleMessageError(error: any) {
    // Handle error
    console.error('Error sending message:', error);
    this.isLoading = false;
  }
  
  
  ngOnDestroy() {
    // Clean up the subscription when the component is destroyed
    //this.socketService.disconnectMessageListener();; // Assuming you have implemented this method
  }

}

  


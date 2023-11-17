
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { MessageService } from '../messaging/messaging.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
  })
  export class HeaderComponent implements OnInit, OnDestroy {
    private authListenerSubs!: Subscription ;
    unreadMessageCount: number = 0;
    userIsAuth = false;

    constructor(private authService: AuthService,private messageService: MessageService){

    }

    toggleNav() {
        const navList = document.querySelector('.nav-list');
        if (navList) {
            navList.classList.toggle('active');
        }
    }
    

    ngOnInit(){
      this.userIsAuth = this.authService.getIsAuth();
      this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuthenticated =>{
        this.userIsAuth = isAuthenticated;
        if(isAuthenticated){
          this.messageService.fetchUnreadMessageCount()
          this.messageService.getUnreadMessageCount().subscribe(count => {
          this.unreadMessageCount = count;
          console.log("unreadmessage count " + count)
          });
        }
      });
        
    }

    onLogout(){
      this.messageService.fetchUnreadMessageCount()
      this.authService.logout();
    }

    ngOnDestroy(){
      this.authListenerSubs.unsubscribe();
      this.messageService.fetchUnreadMessageCount()
    }


    
  }
  













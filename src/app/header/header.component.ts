
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
  })
  export class HeaderComponent implements OnInit, OnDestroy {
    private authListenerSubs!: Subscription ;
    userIsAuth = false;
    constructor(private authService: AuthService){

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
      });
    }

    onLogout(){
      this.authService.logout();
    }

    ngOnDestroy(){
      this.authListenerSubs.unsubscribe();
    }


    
  }
  













import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthData } from "./auth-data.model"
import { Subject } from "rxjs";
import { Router } from "@angular/router";
import { environment } from '../../environments/environment';
import { LoadingService } from "../loading.service";
const BACKEND_URL =    environment.apiUrl   + '/user/';

@Injectable({providedIn: "root"})




export class AuthService{
    private isAuthenticated = false;
    private token: string | undefined | null; // token is private here to use it outside use the getToken method
    private authStatusListener = new Subject<boolean>();
    private tokenTimer!:  number;
    private userId!: any;
constructor(private http: HttpClient, private router: Router, private loadingService: LoadingService){}

  
    createUser(
        email: string,
        password: string,
        username: string,
        firstName?: string,
        lastName?: string,
        address?: string,
        phone?: string
    ) {
        const authData: AuthData = {
            username: username,
            password: password,
            email: email,
            firstName: firstName,
            lastName: lastName,
            address: address,
            phone: phone
        };
        this.http.post(BACKEND_URL + "/signup", authData).subscribe(() => {
            this.router.navigate(["/auth/login"]);
        }, error => {
            this.authStatusListener.next(false)
        });
    }
    

    getAuthStatusListener(){
        return this.authStatusListener.asObservable();
    }

    getIsAuth(){
        return this.isAuthenticated
    }

    getUserId(){
        return this.userId;
    }

    getToken(){// 
        return this.token
    }


    login(username: string, password:string){
        const authData: AuthData = {username: username, password: password, email: ""}

        this.http.post<{token: string, expiresIn: number, userId: string}>(BACKEND_URL+ "/login", authData).subscribe(response =>{
            console.log('Auth Service res'+response)
            const token = response.token
            this.token = token;
            if(token){
                const expireDuration = response.expiresIn
                console.log("Token expires "+ expireDuration)
                this.setAuthTimer(expireDuration)
                this.isAuthenticated = true;
                this.authStatusListener.next(true);
                this.userId = response.userId;
                console.log("user id from server = " + response.userId)
                const now = new Date();
                const expirationDate = new Date (now.getTime() + expireDuration * 1000) ;
                console.log("Token expiry date"+expirationDate)
                this.saveAuthData(token, expirationDate, this.userId)
                this.router.navigate(['/']);
            }
        },error =>{
            this.authStatusListener.next(false);
            console.log("auth is false", error)
        })
    }


    autoAuthUser(){ // we are using this one to Authorize the user if the page gets reloaded making reference to the  token and expirationDate stored in the local storage
        const authInfo = this.getAuthData()
        console.log(authInfo)
        if(!authInfo){
            return
        }
        const now = new Date();
        const expiresIn = authInfo!.expirationDate.getTime() - now.getTime();
        if(expiresIn > 0){
            this.token = authInfo!.token;
            this.isAuthenticated = true;
            this.userId = authInfo.userId;
            this.setAuthTimer(expiresIn / 1000)
            this.authStatusListener.next(true)
        }
        // note you have to call this in the app.component.ts
    }





    logout(){
        this.token = null;
        this.isAuthenticated = false;
        this.authStatusListener.next(false);
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.userId = null;
        this.router.navigate(['/']);
    
    }

    private setAuthTimer(duration: number){
        console.log("setting timer: "+ duration)
        this.tokenTimer = setTimeout(()=>{ // we setting up a timer so we know when token is expired on the backend
            this.logout();
        }, duration * 1000) as unknown as number
    }

    private saveAuthData(token: string, expirationDate: Date, userId: string){// storing the token expiring date in the browsers local storage 
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
        localStorage.setItem('userId', userId)
    }

    private clearAuthData(){
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
        localStorage.removeItem('userIdn');
    }

    private getAuthData(){ // we are using this to get items stored in the local storage 
        const token = localStorage.getItem('token');
        const expirationDate =  localStorage.getItem('expiration')
        const userId = localStorage.getItem('userId')
        return{
            token:token,
            expirationDate: new Date(expirationDate as unknown as Date),
            userId: userId
        }
    
    }

}
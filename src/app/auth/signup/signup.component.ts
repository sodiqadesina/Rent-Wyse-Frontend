import { Component , OnInit, OnDestroy} from "@angular/core";
import { NgForm } from "@angular/forms";
import { AuthService } from "../auth.service";
import { Subscription } from "rxjs";
import { LoadingService } from "src/app/loading.service";

@Component({
    // note we are not using selector here cause we dont need a physical component onthe screen we are just going to route users to this page !!
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css']
})

export class SignupComponent implements OnInit, OnDestroy{
    isLoading = false;
    private authStatusSub!: Subscription;
    constructor(public authService: AuthService,){}
    hide = true;

    togglePasswordVisibility() {
        this.hide = !this.hide;
    }
    
    ngOnInit(){
       this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
        authStatus => {
            this.isLoading = false;
        }
       );
    }

    onSignup(form: NgForm){
        console.log(form.value)
        if(form.invalid){
            return;
        }
        this.isLoading = true;
        this.authService.createUser(form.value.email, form.value.password, form.value.username, form.value.phone, form.value.firstName, form.value.lastName, form.value.address );
    }
    ngOnDestroy(){
        this.authStatusSub.unsubscribe()
    }

}
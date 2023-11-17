import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { PasswordValidator } from '../password.validator';

@Component({
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
    signupForm: FormGroup;
    isLoading = false;
    private authStatusSub!: Subscription;

    constructor(private fb: FormBuilder, public authService: AuthService) {
        // Initialize the form group here in the constructor
        this.signupForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            username: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', Validators.required],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            address: ['', Validators.required],
            city: ['', Validators.required],
            province: ['', Validators.required],
            zipcode: ['', Validators.required],
            country: ['', Validators.required],
            phone: ['', [Validators.required, ]]
        }, { validator: PasswordValidator.match('password', 'confirmPassword') });
    }

    ngOnInit() {
        this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
            authStatus => {
                this.isLoading = authStatus;
            }
        );
    }

    onSignup() {
        if (this.signupForm.invalid) {
            return;
        }
        this.isLoading = true;
        this.authService.createUser(
            this.signupForm.value.email,
            this.signupForm.value.password,
            this.signupForm.value.username,
            this.signupForm.value.firstName,
            this.signupForm.value.lastName,
            this.signupForm.value.address,
            this.signupForm.value.city,
            this.signupForm.value.province,
            this.signupForm.value.zipcode,
            this.signupForm.value.country,
            this.signupForm.value.phone
        )
    }

    ngOnDestroy() {
        this.authStatusSub.unsubscribe();
    }
}

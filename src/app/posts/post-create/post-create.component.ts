import { Component, OnDestroy, OnInit } from '@angular/core';
import { post } from '../post.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PostsService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { mimeType } from './mime-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {
    enteredContent = ''
    enteredTitle = '';
    postId: any;
    post: any;
    isLoading = false; // for the spinner
    form: any;
    imagePreview: any;
    private mode = 'create';
    private authStatusSub!: Subscription;

    constructor(public postsService: PostsService, public route: ActivatedRoute, private authService: AuthService){}

    ngOnInit() {
        this.authStatusSub = this.authService.getAuthStatusListener().subscribe(authStatus =>{
            this.isLoading = false;
        })
        this.form = new FormGroup({
            title: new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]}),
            content: new FormControl(null, {validators: [Validators.required]}),
            image: new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeType]}),
            city: new FormControl(null),
            address: new FormControl(null),
            province: new FormControl(null),
            zipcode: new FormControl(null, {validators: [Validators.required]}),
            country: new FormControl(null)
        });
            
        this.route.paramMap.subscribe((paramMap: ParamMap) =>{
            if(paramMap.has('postId')){
                this.mode = 'edit';
                this.postId = paramMap.get('postId');
                // this is where the loader starts 
                this.isLoading = true;
                this.post = this.postsService.getPost(this.postId).subscribe(postData =>{
                    // this is where it stops loading 
                    this.isLoading = false;
                    this.post = {id: postData._id,
                         title: postData.title,
                          content: postData.content,
                           imagePath: postData.imagePath,
                           creator: postData.creator, 
                           city: postData.city,
                           address: postData.address,
                           province: postData.province,
                           zipcode: postData.zipcode,
                           country: postData.country
                        };

                    this.form.setValue({title: this.post.title,
                            content: this.post.content,
                            image: this.post.imagePath, 
                            city: this.post.city,
                            address: this.post.address,
                            province: this.post.province,
                            zipcode: this.post.zipcode,
                            country: this.post.country
                        });
                })
            }else{
                this.mode = 'create';
                this.postId = null;
            }
        });
    };

  onImagePicked(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;
    if (fileList && fileList.length > 0) {
        this.form.patchValue({ image: fileList });
        this.form.get('image').updateValueAndValidity();
        this.imagePreview = [];

        Array.from(fileList).forEach((file) => {
            const reader = new FileReader();  // Create a new instance for each file

            reader.onload = () => {
                this.imagePreview.push(reader.result as string);
                reader.onload = null;  // Clear the onload to ensure no lingering references
            };

            reader.readAsDataURL(file);
        });
    }
}

   
    

    onAddPost(){

        if(this.form.invalid){
            return;
        }
        this.isLoading = true;
        const image: File[] = Array.from(this.form.get('image').value);
        if(this.mode == 'create'){
            this.postsService.addPost(
                this.form.value.title,
                this.form.value.content,
                image,   // Send the entire FileList object
                this.form.value.city,
                this.form.value.address,
                this.form.value.province,
                this.form.value.zipcode,
                this.form.value.country,
            );
        }else{
            this.postsService.updatePost(
                this.postId,
                this.form.value.title, 
                this.form.value.content, 
                image,
                this.form.value.city,
                this.form.value.address,
                this.form.value.province,
                this.form.value.zipcode,
                this.form.value.country, 
                null,
                )
        }
  
        var post: post = {
            title: this.form.value.title, content: this.form.value.content,
            _id: this.form.value._id, imagePath: [], creator: ''
        };

        console.log(post)

        this.form.reset();
    }


ngOnDestroy(){
    this.authStatusSub.unsubscribe();
}


}
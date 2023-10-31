import { Component ,  OnDestroy,  OnInit } from '@angular/core';
import {post} from '../post.model'
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/auth/auth.service';


@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: post[] = [];
  
  private postsSub!: Subscription;
  totalPosts = 10;
  isLoading = false;
  postPerPage =2;
  currentPage = 1;
  pageSizeOptions = [1,2,5,10]
  private authStatusSub!: Subscription;
  userIsAuth = false;
  userId!: any;

  constructor(public postsService: PostsService, private authService: AuthService){}


ngOnInit(){
  this.isLoading = true;
  this.postsService.getPosts(this.postPerPage, this.currentPage);
  this.userId = this.authService.getUserId();
  this.postsSub = this.postsService.getPostUpdateListener().subscribe((postData: {post: post[], postCount: number}) => {
    this.isLoading = false;
    this.totalPosts = postData.postCount;
    this.posts = postData.post;
    console.log(this.posts)
    console.log(this.userId)
  });
  this.userIsAuth = this.authService.getIsAuth();
  this.authStatusSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated =>{
    this.userIsAuth = isAuthenticated;
    this.userId = this.authService.getUserId();
    console.log(this.userId)
  })
}


onChangePage(pageData: PageEvent){
  this.isLoading = true;
  console.log(pageData)
  this.currentPage = pageData.pageIndex + 1;
  this.postPerPage = pageData.pageSize;
  this.postsService.getPosts(this.postPerPage, this.currentPage);

}


onDelete(postId: string){
  this.isLoading = true;
  this.postsService.deletePost(postId).subscribe(()=> {
  this.postsService.getPosts(this.postPerPage,this.currentPage)
}, ()=>{
  this.isLoading = false
})
}

ngOnDestroy(){
  this.postsSub.unsubscribe();
  this.authStatusSub.unsubscribe();
}

}
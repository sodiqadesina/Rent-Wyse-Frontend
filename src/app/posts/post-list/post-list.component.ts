import { Component ,  OnDestroy,  OnInit } from '@angular/core';
import {post} from '../post.model'
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { InquiryDialogComponent } from '../../messaging/Inquiry-dialog/inquiry-dialog.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: post[] = [];
  currentImageIndices: { [postId: string]: number } = {};

  private postsSub!: Subscription;
  totalPosts = 10;
  isLoading = false;
  postPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [1,2,5,10]
  private authStatusSub!: Subscription;
  userIsAuth = false;
  userId!: any;
  filterCity = '';
  filterBedroom!: number;
  filterBathroom!: number;
  filterFurnished!: boolean;
  filterParkingAvailable!: boolean;
  filterMinPrice!: number;
  filterMaxPrice!: number;


  constructor(public postsService: PostsService, private authService: AuthService, public dialog: MatDialog, private route: ActivatedRoute){}


ngOnInit(){
  this.isLoading = true;
  // this.postsService.getPosts(this.postPerPage, this.currentPage,);
  this.userId = this.authService.getUserId();
  this.postsSub = this.postsService.getPostUpdateListener().subscribe((postData: {posts: post[], postCount: number}) => {
    this.isLoading = false;
    this.totalPosts = postData.postCount;
    this.posts = postData.posts;
    console.log(this.posts)
    console.log(this.userId)
  });
  this.userIsAuth = this.authService.getIsAuth();
  this.authStatusSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated =>{
    this.userIsAuth = isAuthenticated;
    this.userId = this.authService.getUserId();
    console.log(this.userId)
  })

  //Handling paramited  reroute
  this.route.queryParams.subscribe(params => {
    const city = params['city'];
    if (city) {
      this.filterCity = city;
      this.fetchPostsFilteredByCity(city);
    } else {
      this.fetchAllPosts();
    }
  });
}

applyFilters() {
  this.isLoading = true;
  this.postsService.getPosts(
    this.postPerPage, 
    this.currentPage, 
    this.filterCity, 
    this.filterBedroom,
    this.filterBathroom,
    this.filterFurnished,
    this.filterParkingAvailable,
    this.filterMinPrice,
    this.filterMaxPrice
  );
}


private fetchPostsFilteredByCity(city: string) {
  // Call your service method to fetch posts filtered by the city
  this.postsService.getPosts(this.postPerPage, this.currentPage, city);

}

private fetchAllPosts() {
  // Existing code to fetch all posts
  this.postsService.getPosts(this.postPerPage, this.currentPage);

}











openInquiryDialog(partnerId: string, postId:string): void {
  this.dialog.open(InquiryDialogComponent, {
    width: '250px',
    data: { partnerId, postId }
  });
}

previousImage(postId: string) {
    if (this.currentImageIndices[postId] > 0) {
        this.currentImageIndices[postId]--;
    }
}

nextImage(postId: string, maxIndex: number) {
    if (!this.currentImageIndices[postId]) {
        this.currentImageIndices[postId] = 0;
    }
    if (this.currentImageIndices[postId] < maxIndex - 1) {
        this.currentImageIndices[postId]++;
    }
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
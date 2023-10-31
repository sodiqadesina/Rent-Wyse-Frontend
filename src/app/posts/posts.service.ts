import { post } from './post.model'
import { Subject, map } from 'rxjs'
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { response } from 'express';
import { environment } from '../../environments/environment';




const BACKEND_URL =    environment.apiUrl   + '/posts/';

@Injectable({ providedIn: "root"})

export class PostsService { 
    private posts: post[] = [];
    private postsUpdated = new Subject<{post: post[],postCount: number}>();


    constructor(private http: HttpClient, private router: Router){}

    

    getPosts(postsPerPage: number, currentPage: number){
        const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
        this.http.get<{message: string, posts: post[], maxPost:number}>(BACKEND_URL + queryParams).pipe(
            map( postData => {
                return {posts: postData.posts.map(post => {
                    return {
                        title: post.title,
                        content: post.content,
                        _id: post._id,
                        imagePath: post.imagePath,  // Updated this line
                        creator: post.creator,
                        city: post.city,             // Add the new fields
                        address: post.address,
                        province: post.province,
                        zipcode: post.zipcode,
                        country: post.country
                    }
                }), maxPost: postData.maxPost}
            })
        ).subscribe((postData) => {
            console.log(postData)
            this.posts = postData.posts;
            this.postsUpdated.next({post: [...this.posts], postCount: postData.maxPost});
        })
    }

    getPost(id: string) {
        return this.http.get<{
            _id: string;
            title: string;
            content: string;
            imagePath: any[]; 
            creator: string;
            city: string;
            address: string;
            province: string;
            zipcode: number;   
            country: string;
        }>(BACKEND_URL + id);
    }
    


    getPostUpdateListener(){
        return this.postsUpdated.asObservable();
    }


    addPost(title: string, content: string, image: File[], city: string, address: string, province: string, zipcode: number, country: string) {
        const postData = new FormData();
        postData.append("title", title);
        postData.append("content", content);
        
        image.forEach((file, index) => {
            postData.append("image", file, file.name);
        });
        postData.append("city", city);
        postData.append("address", address);
        postData.append("province", province);
        postData.append("zipcode", zipcode.toString());
        postData.append("country", country);
        this.http.post<{message: string, post: post}>(BACKEND_URL, postData).subscribe((responseData) => {
            
            console.log(responseData.message, responseData.post._id);
            // const post: post = { _id: 'null', title: title,content: content, imagePath: responseData.post.imagePath}
           
            // this.posts.push(post);
  
            this.router.navigate(["/"]); // redirecting to list route 
        })
        }

        updatePost(
            id: string, 
            title: string, 
            content: string, 
            image: File[] , 
            city: string,
            address: string,
            province: string,
            zipcode: string,
            country: string,
            creator: any
            ){
                let postData: FormData | post;
            
                if (image && image.length > 0 && typeof(image[0]) === 'object') {
                    postData = new FormData();
                    postData.append("id", id);
                    postData.append("title", title);
                    postData.append("content", content);
            
                    if (Array.isArray(image)) {
                        image.forEach((file: File) => {
                            (postData as FormData).append("image", file, file.name);  // Type assertion here
                        });
                    }
            
                    postData.append("city", city);
                    postData.append("address", address);
                    postData.append("province", province);
                    postData.append("zipcode", zipcode);
                    postData.append("country", country);
                } else {
                    postData = {
                        _id: id, 
                        title: title, 
                        content: content, 
                        imagePath: image,  
                        city: city, 
                        address: address,
                        province: province,
                        zipcode: zipcode,
                        country: country,
                        creator: null  
                    };
                }
        this.http.put(BACKEND_URL + id, postData).subscribe(response =>{
        // const updatedPosts = [...this.posts];
        // const oldPostIndex = updatedPosts.findIndex(p => p._id === id)
        // const post: post = {
        //     _id:id, title: title, content: content, imagePath: ''
        // }
        // updatedPosts[oldPostIndex] = post;
        // this.posts = updatedPosts;
        this.router.navigate(["/"]); // redirecting the route
    });
    }

    deletePost(postId: string){
        return this.http.delete(BACKEND_URL + postId)
    }

}














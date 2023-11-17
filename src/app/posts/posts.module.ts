import {NgModule} from "@angular/core"
import { PostCreateComponent } from './post-create/post-create.component';
import { PostListComponent } from './post-list/post-list.component'; 
import { ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from "../angular-material.module";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule} from '@angular/material/core'
import {MatCheckboxModule} from '@angular/material/checkbox';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {UserPostListComponent} from './user-post-list/user-post-list.component'

@NgModule({
    declarations: [
        PostCreateComponent,
        PostListComponent,
        UserPostListComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AngularMaterialModule,
        RouterModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatSelectModule,
        MatNativeDateModule,
        MatCheckboxModule,
        DragDropModule,
    ]
})

export class PostsModule {}
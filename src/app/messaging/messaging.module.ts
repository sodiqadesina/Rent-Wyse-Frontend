import { NgModule } from "@angular/core";
import { AngularMaterialModule } from "../angular-material.module";
import { CommonModule } from "@angular/common";
import { InquiryDialogComponent } from "./Inquiry-dialog/inquiry-dialog.component";
import { FormsModule } from '@angular/forms';
import { MessagesComponent } from "./messages/messages.component";
import { RouterModule } from "@angular/router";
import { MatListModule } from '@angular/material/list';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';

@NgModule({
declarations: [
    InquiryDialogComponent,
    MessagesComponent,
],
imports: [
CommonModule,
AngularMaterialModule,
FormsModule,
RouterModule,
MatListModule,
ReactiveFormsModule,
MatBadgeModule,

]

})
export class MessagingModule {}
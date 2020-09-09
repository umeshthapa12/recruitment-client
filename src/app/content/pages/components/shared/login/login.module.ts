import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
    declarations: [LoginComponent],
    imports: [CommonModule, FormsModule, ReactiveFormsModule,  DragDropModule],
    exports: [LoginComponent],
    entryComponents: [LoginComponent],
    providers: [],
})
export class LoginModule { }

import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { RentComponent } from './rent/rent.component';
import { HomeComponent } from './home/home.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SubscribeComponent } from './subscribe/subscribe.component';
import { BringBackComponent } from './bring-back/bring-back.component';

import { BrowserModule } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CodeInputModule } from 'angular-code-input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule} from '@angular/material/radio';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule} from '@angular/material/button';

import { HttpClientModule } from '@angular/common/http';
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MaterialExampleModule} from "./material.module";




@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    HomeComponent,
    RentComponent,
    BringBackComponent,
    SubscribeComponent,

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    MatToolbarModule,
    FormsModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatButtonModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatFormFieldModule,
    MatRadioModule,
    MatRippleModule,
    MatDatepickerModule,
    MaterialExampleModule,


    CodeInputModule.forRoot({
      codeLength: 5,
      isCharsCode: true,
      code: ''
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

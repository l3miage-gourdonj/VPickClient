import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { RentComponent } from './rent/rent.component';
import { HomeComponent } from './home/home.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SubscribeComponent } from './subscribe/subscribe.component';
import { BringBackComponent } from './bring-back/bring-back.component';

import { BrowserModule } from '@angular/platform-browser';
import { MaterialExampleModule } from '../material.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CodeInputModule, CodeInputComponent } from 'angular-code-input';
// import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
// import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule} from '@angular/material/button';

import { HttpClientModule } from '@angular/common/http';




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
    CodeInputComponent,
    FormsModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatButtonModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MaterialExampleModule,
    MatFormFieldModule,
    MatFormFieldModule,
    MatRadioModule,
    MatRippleModule,
    

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

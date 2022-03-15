import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SignInComponent } from './sign-in/sign-in.component';
import { CodeInputModule } from 'angular-code-input';
import { HomeComponent } from './home/home.component';
import { MatButtonModule} from '@angular/material/button';
import { RentComponent } from './rent/rent.component';
import { BringBackComponent } from './bring-back/bring-back.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    HomeComponent,
    RentComponent,
    BringBackComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    MatToolbarModule,
    CodeInputModule.forRoot({
      codeLength: 5,
      isCharsCode: true,
      code: ''
    }),
    MatButtonModule,
    BrowserAnimationsModule,
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

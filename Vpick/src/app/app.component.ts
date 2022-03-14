import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SignInComponent } from './sign-in/sign-in.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Vpick';

  constructor(public dialog: MatDialog){}
  openConnect(){
    this.dialog.open(SignInComponent, {
      height: '400px',
      width: '600px',
    })
  }
}

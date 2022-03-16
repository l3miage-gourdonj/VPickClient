import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SignInComponent } from './sign-in/sign-in.component';
import { Personne, getClientLS } from './vepickDefinitions'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'Vpick';
    public client!:Personne | null;

    constructor(public dialog: MatDialog){}

    openConnect(){
        this.dialog.open(SignInComponent, {
            height: '400px',
            width: '600px',
        })
    }

    getClientLS() {
        return this.client = getClientLS();
    }

    disconnect() {
        localStorage.removeItem('client');
    }
}

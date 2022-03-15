import { Component, OnInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { CodeInputComponent } from 'angular-code-input';
import { HttpClient } from '@angular/common/http';



@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  private codeS!:string;
  private codeResultat!:string;
  private ConnectionUrl = 'https:/localhost:9000/GET/...';


  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {

  }

  sauvCodeSecret(codeS: string) {
    this.codeS = codeS;
  }

  Connexion(CB:HTMLInputElement) {
      let numCB:number = Number(CB.value.replace(/\s/g, ""));

      console.log("String CB: "+CB.value);
      console.log("Num CB: "+numCB);
      console.log("Code Secret: "+this.codeS);
      
      // Faire une requete GET :
      this.httpClient.get(this.ConnectionUrl).subscribe(
          data => { console.log(data), console.log(data.toString); },
          error => { console.error('Connexion error!', error); }
      );
      
      console.log("Return: "+this.codeResultat);
  }

  CB_format(CB: HTMLInputElement) {
      let creditCard:string = CB.value;
      // console.log("Num CB: "+creditCard);
      
      if(creditCard !== null) {
          let matches = creditCard.replace(/\s+/g, '').replace(/[^0-9]/gi, '').match(/\d{4,16}/g);
          let match = matches && matches[0] || '';
          let parts = [];

          for (let i = 0; i < match.length; i+=4) {
              parts.push(match.substring(i, i+4));
          }
          
          console.log("Part: "+parts);
          
          for (let i = 0; i < parts.length; i++) {
              if(i === 0)
                  CB.value = parts[i];
              else 
                  CB.value += " " + parts[i];
          }
      }
  }
}
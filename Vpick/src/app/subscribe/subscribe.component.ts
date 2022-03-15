import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss']
})
export class SubscribeComponent implements OnInit {
    public sexe!: string;

    ngOnInit(): void { }

  constructor(private httpClient: HttpClient) { }

  Inscription(nom:HTMLInputElement, prenom:HTMLInputElement, adresse:HTMLInputElement ,CB:HTMLInputElement) {

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

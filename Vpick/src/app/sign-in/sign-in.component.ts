import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';



@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
    private codeS!:string;
    private ConnectionUrl = 'http://localhost:9000/api/vpick';
        
    constructor(private httpClient: HttpClient) { }
    ngOnInit(): void { }

    sauvCodeSecret(codeS: string) {
        this.codeS = codeS;
    }

    Connexion(CB:HTMLInputElement) {
        let numCB:number = Number(CB.value.replace(/\s/g, ""));

        console.log("String CB: "+CB.value);
        console.log("Num CB: "+numCB);
        console.log("Code Secret: "+this.codeS);

        // Générer la requete / URL :
        this.ConnectionUrl += '/abo/cb/'+CB.value+'/code/'+this.codeS;

        // Faire une requete GET :
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data => { console.log(data); },
            error => { console.error('Connexion error!', error); }
        );
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

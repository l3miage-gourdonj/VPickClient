import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatRadioButton } from '@angular/material/radio';
import { getLocaleFirstDayOfWeek } from '@angular/common';


interface Personne {
    nom: string, 
    prenom: string, 
    dateNaissance: Date, 
    adresse: string, 
    sexe: Sexe, 
    codeSecret: string,
    carteBanquaire: string,
    dateDebut: Date,
    dateFin: Date
}

enum Sexe {
    HOMME = "HOMME", 
    FEMME = "FEMME"
}

@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss']
})
export class SubscribeComponent implements OnInit {
    public sexe!: Sexe;
    private codeS!:string;
    private dateN!:Date;
    private ConnectionUrl = 'http://localhost:9000/api/vpick';

    ngOnInit(): void { }

    constructor(private httpClient: HttpClient) { }

    Inscription(nom:HTMLInputElement, prenom:HTMLInputElement, dateN:HTMLInputElement, adresse:HTMLInputElement, sexe: MatRadioButton,CB:HTMLInputElement) {
        if(sexe.checked) {
            this.sexe = Sexe.HOMME;
        } else {
            this.sexe = Sexe.FEMME;
        }

        this.dateN = new Date(dateN.value);
        let dateDebut = new Date();
        let dateFin = new Date();
        dateFin.setFullYear(dateDebut.getFullYear() + 1);        
        
        // Générer l'objet de type Personne
        const objClient:Personne = {
            nom: nom.value.toLowerCase(), 
            prenom: prenom.value.toLowerCase(), 
            dateNaissance: this.dateN, 
            adresse: adresse.value.toLowerCase(), 
            sexe: this.sexe,
            codeSecret: this.codeS,
            carteBanquaire: CB.value,
            dateDebut: dateDebut,
            dateFin: dateFin
        }
        console.log(objClient);

        // Générer la requete / URL :
        this.ConnectionUrl += '/POST/subscribe/';

        // Faire une requete POST :
        this.httpClient.post<Personne>(this.ConnectionUrl, objClient).subscribe({
            next: data => { console.log(data); },
            error: error => { console.error('There was an error!', error); }
        });
    }

    sauvCodeSecret(codeS: string) {
        this.codeS = codeS;
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

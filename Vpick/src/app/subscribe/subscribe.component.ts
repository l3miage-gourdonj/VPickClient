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
    private dateN!: Date;
    public creditCard: string = "";
    private secretCode: string = "";
    private ConnectionUrl = 'http://localhost:9000/api/vpick';
    private regex = new RegExp("\\d{4} \\d{4} \\d{4} \\d{4}");

    ngOnInit(): void { }

    constructor(private httpClient: HttpClient) { }

    onSubmit(nom:HTMLInputElement, prenom:HTMLInputElement, dateN:HTMLInputElement, adresse:HTMLInputElement, sexe: MatRadioButton,CB:HTMLInputElement) {
        // Envoie une requete POST pour générer un abonné en BD

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
            codeSecret: this.secretCode,
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

    saveSecretCode(codeS: string) {
        this.secretCode = codeS;
    }

    isCreditCardInvalid() {
        return this.creditCard.length === 19 && !this.regex.test(this.creditCard);
    }

    isFormValid() {
        return this.regex.test(this.creditCard) && this.secretCode.replace(/\s+/g, '').length === 5;
    }

    CB_format(CB: HTMLInputElement) {
        this.creditCard = CB.value.replace(/\s+/g, '');
        if (this.creditCard !== null) {
            let cpt = 4;
            while (cpt < this.creditCard.length) {
                this.creditCard = this.creditCard.slice(0, cpt) + " " + this.creditCard.slice(cpt);
                cpt += 5;
            }
        }
    }
}

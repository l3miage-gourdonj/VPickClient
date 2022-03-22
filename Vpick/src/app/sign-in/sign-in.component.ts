import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Personne, Sexe, setClientLS } from '../vepickDefinitions'
import { MatDialog } from '@angular/material/dialog';


@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
    public creditCard:string = "";
    private secretCode:string = "";
    private ConnectionUrl:string = 'http://localhost:9000/api/vpick';
    private regex = new RegExp("\\d{4} \\d{4} \\d{4} \\d{4}");

    constructor(private httpClient: HttpClient, public dialog: MatDialog) { }

    ngOnInit(): void {
        /*
        let cl:Personne = {
            nom: 'GBZ',
            prenom: 'Jerome',
            adresse: '25 route de vh',
            carteBanquaire: '1425 2145 2155 2156',
            codeSecret: '01234',
            dateDebut: new Date('01/03/2022'),
            dateFin: new Date('01/03/2023'),
            dateNaissance: new Date('01/01/1980'),
            sexe: Sexe.HOMME,
            creditTemps: 0
        }
        setClientLS(cl);
        console.log(cl);


        //console.log( getClientLS() );
        */
    }

    onSubmit() {
        // Générer la requete / URL :
        this.ConnectionUrl += '/abo/cb/' + this.creditCard + '/code/' + this.secretCode;

        // Faire une requete GET :
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data  => { setClientLS(data as Personne); }
        );

        this.dialog.closeAll();
    }

    saveSecretCode(codeS: string) {
        this.secretCode = codeS;
    }

    isCreditCardInvalid() {
        return this.creditCard.length === 19 && !this.regex.test(this.creditCard);
    }

    isFormValid() {
        document.getElementById
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

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { CodeInputComponent } from 'angular-code-input';



@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
    private codeS!: string;
    codeDone = false;
    private codeResultat!: string;
    private ConnectionUrl = 'https:/localhost:9000/GET/';
    creditCard = "";

    constructor(private httpClient: HttpClient) { }

    ngOnInit(): void { }

    sauvCodeSecret(codeS: string) {
        this.codeS = codeS;
        this.codeDone = true;
    }

    resetCodeDone(){
        this.codeDone = false;
    }

    Connexion(CB: HTMLInputElement) {
        let numCB: number = Number(CB.value.replace(/\s/g, ""));

        console.log("String CB: " + CB.value);
        console.log("Num CB: " + numCB);
        console.log("Code Secret: " + this.codeS);

        // Générer la requete / URL :
        this.ConnectionUrl = 'http://localhost:9000/api/vpick/abo/cb/' + CB.value + '/code/' + this.codeS;

        // Faire une requete GET :
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data => { console.log(data), console.log(data.toString); },
            error => { console.error('Connexion error!', error); }
        );

        console.log("Return: " + this.codeResultat);
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

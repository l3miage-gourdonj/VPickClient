import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Personne, Sexe, setClientLS } from '../vepickDefinitions'
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';


@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
    public carteBancaire:string = "";
    private secretCode:string = "";
    private ConnectionUrl:string = 'http://localhost:9000/api/vpick';
    private regex = new RegExp("\\d{4} \\d{4} \\d{4} \\d{4}");

    private connexionCorrect:boolean = true;

    constructor(private router: Router, private httpClient: HttpClient, public dialog: MatDialog) { }

    ngOnInit(): void { }

    onSubmit() {
        // Générer la requete / URL :
        this.ConnectionUrl = 'http://localhost:9000/api/vpick/abo/cb/' + this.carteBancaire + '/code/' + this.secretCode;

        // Faire une requete GET :
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data  => { 
                if(data != null) {
                    let client:Personne = data as Personne;
                    console.log(client);                
                    console.log(this.carteBancaire);
                    
                    client.carteBancaire = this.carteBancaire;

                    setClientLS(client); 
                    console.log(data); 

                    this.connexionCorrect = true;
                    this.dialog.closeAll();
                    this.router.navigate(['/']);
                } else {
                    this.connexionCorrect = false;
                }
            }
        );
    }

    isConnexionInvalid(): boolean {
        return !this.connexionCorrect;
    }

    saveSecretCode(codeS: string) {
        this.secretCode = codeS;
    }

    isCreditCardInvalid() {
        return this.carteBancaire.length === 19 && !this.regex.test(this.carteBancaire);
    }

    isFormValid() {
        return this.regex.test(this.carteBancaire) && this.secretCode.replace(/\s+/g, '').length === 5;
    }

    CB_format(CB: HTMLInputElement) {
        this.carteBancaire = CB.value.replace(/\s+/g, '');
        if (this.carteBancaire !== null) {
            let cpt = 4;
            while (cpt < this.carteBancaire.length) {
                this.carteBancaire = this.carteBancaire.slice(0, cpt) + " " + this.carteBancaire.slice(cpt);
                cpt += 5;
            }
        }
    }
}

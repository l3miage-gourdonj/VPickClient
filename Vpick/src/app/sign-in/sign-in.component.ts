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
    public creditCard:string = "";
    private secretCode:string = "";
    private ConnectionUrl:string = 'http://localhost:9000/api/vpick';
    private regex = new RegExp("\\d{4} \\d{4} \\d{4} \\d{4}");

    constructor(private httpClient: HttpClient) { }

    ngOnInit(): void { }

    onSubmit() {
        // Générer la requete / URL :
        this.ConnectionUrl += '/abo/cb/' + this.creditCard + '/code/' + this.secretCode;

        // Faire une requete GET :
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data => { console.log(data), console.log(data.toString); },
            error => { console.error('Connexion error!', error); }
        );
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

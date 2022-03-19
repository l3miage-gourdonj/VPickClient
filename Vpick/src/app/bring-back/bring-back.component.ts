import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { fromEvent } from 'rxjs';
import { Personne, Sexe, setClientLS, getClientLS } from '../vepickDefinitions'
import {Bornette, Station} from "../vepickDefinitions";

@Component({
  selector: 'app-bring-back',
  templateUrl: './bring-back.component.html',
  styleUrls: ['./bring-back.component.scss']
})
export class BringBackComponent implements OnInit {
    public stepsArray:Array<Element> = [];
    public stepsElem!:HTMLCollectionOf<Element>;
    private ConnectionUrl:string = 'http://localhost:9000/api/vpick';
    public stations:Array<Station> = [];
    public bornettes:Array<Bornette> = [];
    private numPrecedent: number = 0;

    public creditCard:string = "";
    private secretCode:string = "";
    private regex = new RegExp("\\d{4} \\d{4} \\d{4} \\d{4}");

    constructor(private httpClient: HttpClient) { }

    ngOnInit(): void { 
        this.stepsElem = document.getElementsByClassName('step');
        let len = document.getElementsByClassName('step').length;
        console.log(len);
        
        for (let i = 0; i < len; i++) {
            let stepElem:Element = this.stepsElem[i];
            this.stepsArray.push(stepElem);

            fromEvent(stepElem, 'click').subscribe((event) => { 
                let step:Element = event.target as Element;
                this.progressBar(parseInt(step.id));
            });
        }

        if(this.isAlreadyConnected()) {
            this.numPrecedent = 1;
            this.progressBar(1);
        } else {
            // TEMPO / DELETE PLS
            this.numPrecedent = 0;
            this.progressBar(0);
        }
        
    }




    getListBornette(id:number){
      this.httpClient.get("http://localhost:9000/api/vpick/bornette/id="+id).subscribe(
        data  => { this.bornettes = data as Bornette[]},
        error => { console.error('Connexion error!', error); }
      );
      console.log(this.bornettes)
    }

    getListStation(){
      this.ConnectionUrl += '/station';
      this.httpClient.get(this.ConnectionUrl).subscribe(
        data  => { this.stations = data as Station[]},
        error => { console.error('Connexion error!', error); }
      );
      console.log(this.stations)
    }





    selectBornette(bornette:string) {
        console.log(bornette);
        /*
        // Générer la requete / URL :
        this.ConnectionUrl += '/station/list/nomBornette/'+bornette;

        // Requette GET : liste bornette
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data  => { this.progressBar(2); ICI REMPLIR UN TABLEAU DES STRING },
            error => { console.error('Connexion error!', error); }
        );

        // ou le prof conseille avec les promises car le subscribe cest plus si on recoit les données au compte goute

        let promise = new Promise((resolve, reject) => {
            this.http.get(this.ConnectionUrl)
            .toPromise()
            .then(
                res => { // Success
                    this.results = res.json().results;
                    resolve();
                },
                msg => { // Error
                    reject(msg);
                }
            );
        });
        */

        this.numPrecedent = 2;
        this.progressBar(2);
        //this.stations = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
        //this.selectStation();
    }

    async selectStation(id:number) {
        // afficher plein de case en couleur pour faire genre on cherche une station dispo
        // pendant 5 secondes puis go
        //console.log(1);
        //await new Promise(resolve => {setTimeout(resolve, 5000),this.colorStation()} ); // 3 sec
        //console.log(2);

        this.numPrecedent = 2;
        this.progressBar(2);
        this.getListBornette(id);
        console.log("Station ",id," - Selectionné !");
    }

    selectPaiement() {

    }

    selectConnected() {
        /*
        // Générer la requete / URL :
        this.ConnectionUrl += '/connexion/cb/' + this.creditCard + '/code/' + this.secretCode;

        // Faire une requete GET :
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data  => { 
                setClientLS(data as Personne);
                this.numPrecedent = 1;
                this.progressBar(1);
            },
            error => { console.error('Connexion error!', error); }
        );
        */

        // Delette apres avoir mis la requete
        this.numPrecedent = 1;
        this.progressBar(1);
    }

    
    isAlreadyConnected(): boolean {
        return getClientLS() !== null ? true : false;
    }

    displayContent(stepNum:number): void {
        if(stepNum == 0) {
            document.getElementById("connexionContent")?.setAttribute('style',"display:block");
            document.getElementById("stationContent")?.setAttribute('style',"display:none");
            document.getElementById("bornetteContent")?.setAttribute('style',"display:none");
            document.getElementById("paiementContent")?.setAttribute('style',"display:none");
        } else if(stepNum == 1) {
            document.getElementById("connexionContent")?.setAttribute('style',"display:none");
            document.getElementById("stationContent")?.setAttribute('style',"display:block");
            document.getElementById("bornetteContent")?.setAttribute('style',"display:none");
            document.getElementById("paiementContent")?.setAttribute('style',"display:none");
        } else if(stepNum == 2) {
            document.getElementById("connexionContent")?.setAttribute('style',"display:none");
            document.getElementById("stationContent")?.setAttribute('style',"display:none");
            document.getElementById("bornetteContent")?.setAttribute('style',"display:block");
            document.getElementById("paiementContent")?.setAttribute('style',"display:none");
        } else if(stepNum == 3) {
            document.getElementById("connexionContent")?.setAttribute('style',"display:none");
            document.getElementById("stationContent")?.setAttribute('style',"display:none");
            document.getElementById("bornetteContent")?.setAttribute('style',"display:none");
            document.getElementById("paiementContent")?.setAttribute('style',"display:block");
        }
    }

    colorStation(): void {
        setTimeout(() => {
            document.getElementsByClassName("station")[0].setAttribute('id',"sationSelected");
        }, 1000);
    }

    progressBar(stepNum:number) {
        console.log("num Prec:"+this.numPrecedent+" num Actu:"+stepNum);

        if(this.numPrecedent >= stepNum) {
            let progressStyle = "width:"+String(stepNum * 30)+"%"
            let elem = document.getElementsByClassName('percent')[0] as Element;
            elem.setAttribute('style',progressStyle);

            this.stepsArray.forEach((elem:Element) => {
                if (parseInt(elem.id) === stepNum) {
                    elem.classList.add('selected');
                    elem.classList.remove('completed');
                } else if (parseInt(elem.id) < stepNum) {
                    elem.classList.add('completed');
                } else {
                    elem.classList.remove('selected', 'completed');
                }
            });

            this.displayContent(stepNum);
        }
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

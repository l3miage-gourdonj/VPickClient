import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SignInComponent } from '../sign-in/sign-in.component';
import { Bornette, getClientLS, Personne, setClientLS, Station } from '../vepickDefinitions';


@Component({
  selector: 'app-rent',
  templateUrl: './rent.component.html',
  styleUrls: ['./rent.component.scss']
})
export class RentComponent implements OnInit {
    public clientAbo: boolean = true;
    public numStep: number = 0;
    public stepsArray: Array<Element> = [];
    public stepsElem!: HTMLCollectionOf<Element>;

    public stations: Array<Station> = [];
    public locations: Array<Location> = [];
    public listBornSelected: Array<Bornette> = [];

    public stationsSelected!: Station;

    public creditCard:string = "";
    private secretCode: string = "";
    private ConnectionUrl: string = 'http://localhost:9000/api/vpick';
    private regex = new RegExp("\\d{4} \\d{4} \\d{4} \\d{4}");



  /* Initialisation */  
    constructor(private httpClient: HttpClient, public dialog: MatDialog) { }

    ngOnInit(): void {
        this.stepsElem = document.getElementsByClassName('step');
        let len = document.getElementsByClassName('step').length;
        console.log(len);

        for (let i = 0; i < len; i++) {
            let stepElem: Element = this.stepsElem[i];
            this.stepsArray.push(stepElem);
        }

        if (this.isAlreadyConnected()) {
            this.numStep = 1;
            this.progressBar(1);
            this.getListStation();
        } else {
            this.numStep = 0;
            this.progressBar(0);     
        }
    }




  /* GET - Requete */
    reqClientNoAbo(): void {
        // Générer la requete / URL :
        this.ConnectionUrl += '/connexion/code/' + this.secretCode;

        // Faire une requete GET :
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data => {
                setClientLS(data as Personne);
                this.numStep = 1;
                this.progressBar(1);
            }
        );

        // Delette apres avoir mis la requete
        // this.numStep = 1;
        // this.progressBar(1);
    }

    reqClientAbo(): void {
        
    }

    getListStation(): void {
        // Générer la requete / URL :
        this.ConnectionUrl += '/station/nb/5';

        // Requette GET : liste bornette
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data => { this.stations = data as Station[]; }
        );
        /*
        this.stations = [{ 
                            id: 1, 
                            adresse: 'Victor Hugo', 
                            bornettes: [
                              { numero: 1, velo: { modele: 'btwin', coutHoraire: 2.36, etat: 'OK' }, etat: 'OK'}, 
                              { numero: 2, velo: { modele: 'btwin', coutHoraire: 2.36, etat: 'OK' }, etat: 'HS'},
                              { numero: 3, velo: { modele: 'btwin', coutHoraire: 2.36, etat: 'OK' }, etat: 'OK'},
                              { numero: 4, velo: { modele: 'Trek ', coutHoraire: 4.98, etat: 'OK' }, etat: 'OK'},
                              { numero: 5, velo: { modele: 'Trek ', coutHoraire: 4.98, etat: 'OK' }, etat: 'HS'},
                              { numero: 6, velo: { modele: 'Trek ', coutHoraire: 4.98, etat: 'OK' }, etat: 'HS'},
                              { numero: 7, velo: { modele: 'Trek ', coutHoraire: 4.98, etat: 'OK' }, etat: 'OK'},
                              { numero: 8, velo: { modele: 'Trek ', coutHoraire: 4.98, etat: 'OK' }, etat: 'OK'},
                              { numero: 9, velo: { modele: 'Trek ', coutHoraire: 4.98, etat: 'OK' }, etat: 'OK'},
                              { numero: 10, velo: { modele: 'Decathlon', coutHoraire: 3.54, etat: 'OK' }, etat: 'HS'},
                              { numero: 11, velo: { modele: 'Decathlon', coutHoraire: 3.54, etat: 'OK' }, etat: 'HS'},
                              { numero: 12, velo: { modele: 'Decathlon', coutHoraire: 3.54, etat: 'OK' }, etat: 'HS'},
                              { numero: 13, velo: { modele: 'Decathlon', coutHoraire: 3.54, etat: 'OK' }, etat: 'OK'},
                            ]}, { id: 1, adresse: 'Champ Elysée' , bornettes: []}, { id: 1, adresse: 'Concorde' , bornettes: []}
                        ];
        console.log(this.stations);
        */
    }
    
    getBornettesFromStation(): Array<Bornette> {
        return this.stationsSelected.bornettes;
    }

    getPrixLocationParHeure() {
        let prixParH:number = 0.0;
        this.listBornSelected.forEach((b:Bornette) => { 
            let v = b.velo;
            if(v !== null) { prixParH += v.coutHoraire; }
        });

        return prixParH;
    }

    getBornetteSelected(): string {
        // [<span *ngFor="let i=index; let bornette of this.listBornSelected"> {{ bornette.numero }},  </span> ]
        let bornettes: string = "[ ";
        
        this.listBornSelected.forEach( (b:Bornette, i:number) => { 
            bornettes += b.numero;
            if(i+1 !== this.listBornSelected.length) {
                bornettes += ", ";
            }
        });

        bornettes += " ]";
        return bornettes;
    }




  /* ACTION - CHANGEMENT CONTENUE */
    selectStation(station: Station) {
        this.stationsSelected = station;
        this.numStep = 2;
        this.progressBar(2);

        console.log("Station ", station.id, " - Selectionné !");
    }

    selectBornette(bElem: HTMLLIElement, bObj: Bornette) {
        if(!bElem.getAttribute('class')?.includes("selectedBornette")) {
            bElem.setAttribute('class', 'bornette OK selectedBornette');
            this.listBornSelected.push(bObj);
        } else {
            bElem.setAttribute('class', 'bornette OK');            
            let index = this.listBornSelected.indexOf(bObj);
            this.listBornSelected.splice(index,index);
        }
    }

    validBornette() {
        this.numStep = 3;
        this.progressBar(3);
    }

    createLocation() {
        // Générer la requete / URL :
        this.ConnectionUrl += '/POST/list/bornette/seleted/';

        // Faire une requete POST :
        this.httpClient.post<any>(this.ConnectionUrl, this.listBornSelected.map(b => b.id)).subscribe({
            next: data => { console.log(data); },
            error: error => { console.error('There was an error!', error); }
        });
    }


    

  /* AUTRE FONCTION */  
    saveSecretCode(codeS: string) {
        this.secretCode = codeS;
    }

    isFormValid() {
        return this.secretCode.replace(/\s+/g, '').length === 5;
    }

    openLoginAbo():void {
        this.clientAbo = false;
    }

    openLoginNoAbo():void {
        this.clientAbo = true;
    }

    progressBar(stepNum: number) {
        console.log("num Prec:" + this.numStep + " num Actu:" + stepNum);

        if (this.numStep >= stepNum) {
            let progressStyle = "width:" + String(stepNum * 30) + "%"
            let elem = document.getElementsByClassName('percent')[0] as Element;
            elem.setAttribute('style', progressStyle);

            this.stepsArray.forEach((elem: Element) => {
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

    displayContent(stepNum: number): void {
        document.getElementById("connexionContent")?.setAttribute('style', (stepNum == 0 ? "display:block" : "display:none"));
        document.getElementById("stationContent")?.setAttribute('style', (stepNum == 1 ? "display:block" : "display:none"));
        document.getElementById("bornetteContent")?.setAttribute('style', (stepNum == 2 ? "display:block" : "display:none"));
        document.getElementById("paiementContent")?.setAttribute('style', (stepNum == 3 ? "display:block" : "display:none"));
    }
    
    isAlreadyConnected(): boolean {
        return getClientLS() !== null ? true : false;
    }

    isCreditCardInvalid() {
        return this.creditCard.length === 19 && !this.regex.test(this.creditCard);
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

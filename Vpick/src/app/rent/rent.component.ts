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

    private client: Personne|null = getClientLS();



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
        /*
        // Générer la requete / URL :
        this.ConnectionUrl += '/noAbo/code/' + this.secretCode;

        // Faire une requete GET :
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data => {
                setClientLS(data as Personne);
                this.numStep = 1;
                this.progressBar(1);
            }
        ); 
        */

        this.numStep = 1;
        this.progressBar(1);
        this.getListStation();
    }

    reqClientAbo(): void {
        // Générer la requete / URL :
        this.ConnectionUrl = 'http://localhost:9000/api/vpick/abo/cb/' + this.creditCard + '/code/' + this.secretCode;

        // Faire une requete GET :
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data  => { 
                setClientLS(data as Personne);
                this.client = (data as Personne);
                this.numStep = 1;
                this.progressBar(1);
                this.getListStation();
            }
        );

        // this.dialog.closeAll();
    }

    getListStation(): void {
        // Générer la requete / URL :
        this.ConnectionUrl = 'http://localhost:9000/api/vpick/station/';

        // Requette GET : liste bornette
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data => { this.stations = data as Station[]; }
        );
    }
    
    getBornettesFromStation(): Array<Bornette> {
        return this.stationsSelected.bornettes;
    }

    getPrixLocationParHeure() {
        let prixParH:number = 0.0;
        this.listBornSelected.forEach((b:Bornette) => { 
            let v = b.velo;
            if(v !== null) { prixParH += v.modele.coutHoraire; }
        });

        return prixParH;
    }

    getBornetteSelected(): string {
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
        this.ConnectionUrl = 'http://localhost:9000/api/vpick/location/';
        let objLocation = { client: this.client, bornettes: this.listBornSelected.map(b => b.id) }
        // Faire une requete POST :
        this.httpClient.post<any>(this.ConnectionUrl, objLocation).subscribe({
            next: data => { console.log(data); },
            error: error => { console.error('There was an error!', error); }
        });
    }


    

  /* AUTRE FONCTION */  
    saveSecretCode(codeS: string) {
        this.secretCode = codeS;
    }

    isFormValid() {
        return this.regex.test(this.creditCard) && this.secretCode.replace(/\s+/g, '').length === 5;
    }

    openLoginAbo():void {
        this.clientAbo = true;
        document.getElementById("Abo")?.setAttribute('style', "display:block");
        document.getElementById("noAbo")?.setAttribute('style', "display:none");
    }

    openLoginNoAbo():void {
        this.clientAbo = false;
        document.getElementById("Abo")?.setAttribute('style', "display:none");
        document.getElementById("noAbo")?.setAttribute('style', "display:block");
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

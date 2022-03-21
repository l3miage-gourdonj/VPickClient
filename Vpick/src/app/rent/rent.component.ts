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

    public stationsSelected!: Station;
    
    private secretCode: string = "";
    private ConnectionUrl: string = 'http://localhost:9000/api/vpick';

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

        this.clientAbo = false;

        // Delette apres avoir mis la requete
        this.numStep = 1;
        this.progressBar(1);
    }

    getListStation(): void {
        // Générer la requete / URL :
        this.ConnectionUrl += '/station/nb/5';

        // Requette GET : liste bornette
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data => { this.stations = data as Station[]; }
        );

        this.stations = [{ id: 1, adresse: 'Victor Hugo', bornettes: [{ numero: 1, velo: null, etat: 'OK'}]}, { id: 1, adresse: 'Champ Elysée' , bornettes: []}, { id: 1, adresse: 'Concorde' , bornettes: []}];
        console.log(this.stations);
    }
    
    getBornettesFromStation(): Array<Bornette> {
        return this.stationsSelected.bornettes;
    }




  /* ACTION - CHANGEMENT CONTENUE */
    selectStation(station: Station) {
        this.stationsSelected = station;
        this.numStep = 2;
        this.progressBar(2);

        console.log("Station ", station.id, " - Selectionné !");
    }


    

  /* AUTRE FONCTION */  
    saveSecretCode(codeS: string) {
        this.secretCode = codeS;
    }

    isFormValid() {
        return this.secretCode.replace(/\s+/g, '').length === 5;
    }

    openDialogLogin(){
        this.dialog.open(SignInComponent, {
            height: '400px',
            width: '600px',
        })
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
}

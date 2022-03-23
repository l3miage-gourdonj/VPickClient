import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { fromEvent } from 'rxjs';
import { SignInComponent } from '../sign-in/sign-in.component';
import { Personne, Sexe, setClientLS, getClientLS } from '../vepickDefinitions'
import { Bornette, Station, Location, Velo } from "../vepickDefinitions";

@Component({
    selector: 'app-bring-back',
    templateUrl: './bring-back.component.html',
    styleUrls: ['./bring-back.component.scss']
})
export class BringBackComponent implements OnInit {
    public stepsArray: Array<Element> = [];
    public stepsElem!: HTMLCollectionOf<Element>;
    private ConnectionUrl: string = 'http://localhost:9000/api/vpick';

    public numStep: number = 0;

    public stations: Array<Station> = [];
    public bornettes: Array<Bornette> = [];
    public locations: Array<Location> = [];

    public locationSelected!: Location;
    public stationsSelected!: Station;

    public carteBancaire: string = "";
    private secretCode: string = "";
    private regex = new RegExp("\\d{4} \\d{4} \\d{4} \\d{4}");

    public clientAbo:boolean = true;
    private client: Personne|null = getClientLS();

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
            this.getLocation();
            this.numStep = 1;
            this.progressBar(1);
        } else {
            this.numStep = 0;
            this.progressBar(0);
        }
    }


    reqClientNoAbo(): void {
        // Générer la requete / URL :
        this.ConnectionUrl = 'http://localhost:9000/api/vpick/noabo/code/' + this.secretCode;

        // Faire une requete GET :
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data => {
                setClientLS(data as Personne);
                this.numStep = 1;
                this.progressBar(1);
            }
        );

        this.clientAbo = false;
    }

    reqClientAbo(): void {
        // Générer la requete / URL :
        this.ConnectionUrl = 'http://localhost:9000/api/vpick/abo/cb/' + this.carteBancaire + '/code/' + this.secretCode;

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


    getLocation(): void {
        // Générer la requete / URL :
        this.ConnectionUrl = 'http://localhost:9000/api/vpick/location/list/';

        // Requette GET : liste bornette
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data => { this.locations = data as Location[] }
        );

        console.log(this.locations);
    }

    getListStation(): void {
        // Générer la requete / URL :
        this.ConnectionUrl = 'http://localhost:9000/api/vpick/station/';

        // Requette GET : liste bornette
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data => { this.stations = data as Station[]; }
        );

        // this.stations = [{ id: 1, adresse: 'Victor Hugo', bornettes: [{ numero: 1, velo: null, etat: 'OK'}]}, { id: 1, adresse: 'Champ Elysée' , bornettes: []}, { id: 1, adresse: 'Concorde' , bornettes: []}];
        // console.log(this.stations);
    }

    getBornettesFromStation(): Array<Bornette> {
        console.log(this.stationsSelected);

        return this.stationsSelected.bornettes;
    }

    getPaiement(): void {

    }




    setLocation(loc: Location) {
        this.locationSelected = loc;

        this.numStep = 2;
        this.progressBar(2);
        this.getListStation();
    }

    selectStation(station: Station) {
        this.stationsSelected = station;
        this.numStep = 3;
        this.progressBar(3);

        this.selectBornette(1);

        console.log("Station ", station.id, " - Selectionné !");
    }

    async selectBornette(bornette: number) {
        console.log(bornette);

        await new Promise(resolve => { setTimeout(resolve, 3000), this.colorStation() }); // 3 sec

        this.numStep = 4;
        this.progressBar(4);
        // this.getPaiement();

    }

    selectEtatVelo() {
        let docVelo = document.getElementsByClassName("etat-content");
        console.log(docVelo);

        this.numStep = 5;
        this.progressBar(5);
        this.getPaiement();
    }

    selectPaiement() {

    }

    isAlreadyConnected(): boolean {
        return getClientLS() !== null ? true : false;
    }

    displayContent(stepNum: number): void {
        document.getElementById("connexionContent")?.setAttribute('style', (stepNum == 0 ? "display:block" : "display:none"));
        document.getElementById("locationContent")?.setAttribute('style', (stepNum == 1 ? "display:block" : "display:none"));
        document.getElementById("stationContent")?.setAttribute('style', (stepNum == 2 ? "display:block" : "display:none"));
        document.getElementById("bornetteContent")?.setAttribute('style', (stepNum == 3 ? "display:block" : "display:none"));
        document.getElementById("paiementContent")?.setAttribute('style', (stepNum == 4 ? "display:block" : "display:none"));
    }

    colorStation(): void {
        setTimeout(() => {
            document.getElementsByClassName("bornette")[0].setAttribute('id', "bornetteSelected");
        }, 1000);
    }

    progressBar(stepNum: number) {
        console.log("num Prec:" + this.numStep + " num Actu:" + stepNum);

        if (this.numStep >= stepNum) {
            let progressStyle = "width:" + String(stepNum * 20) + "%"
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

    getPrixLocation(dateD: Date): number {
        let difDate = new Date().getTime() - dateD.getTime();
        let minDif = (difDate / (1000 * 3600));
        let roundHeure = Math.ceil(minDif);
        console.log("roundHeure " + roundHeure);

        let prix = 0;
        this.locationSelected.velos.forEach((v:Velo) => prix += v.modele.coutHoraire * roundHeure)

        return Math.round(prix*100)/100;
    }



  /* AUTRE FONCTION */
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

    dureeLocationString(dateD: Date): string{
        let duree = new Date().getTime() - dateD.getTime();
        let nbMinutes = (duree / (1000 * 60));
        return Math.floor(nbMinutes/60) + "h" + Math.floor(nbMinutes%60) + ", facturé " + Math.ceil(nbMinutes/60) + "h";
    }

    saveSecretCode(codeS: string) {
        this.secretCode = codeS;
    }

    isCreditCardInvalid() {
        return this.carteBancaire.length === 19 && !this.regex.test(this.carteBancaire);
    }

    isFormValidNoAbo() {
        return this.secretCode.replace(/\s+/g, '').length === 5;
    }

    isFormValidAbo() {
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

    openDialogLogin(){
        this.dialog.open(SignInComponent, {
            height: '400px',
            width: '600px',
        })
    }
}

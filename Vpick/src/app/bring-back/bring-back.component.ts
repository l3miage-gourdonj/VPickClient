import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { fromEvent } from 'rxjs';
import { SignInComponent } from '../sign-in/sign-in.component';
import { Personne, Sexe, setClientLS, getClientLS } from '../vepickDefinitions'
import { Bornette, Station, Location, Velo } from "../vepickDefinitions";
import {  } from '@angular/material/checkbox';

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
    public bornettesSelected: Array<number> = [];
    public veloBroken: Array<number> = [];

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
        this.ConnectionUrl = 'http://localhost:9000/api/vpick/location/code/' + this.secretCode;

        // Faire une requete GET :
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data => {
                console.log(data);
                if(data !== null) {
                    this.locations = [data as Location];
                    this.numStep = 1;
                    this.progressBar(1);
                }
            }
        );

        this.clientAbo = false;
    }

    reqClientAbo(): void {
        // Générer la requete / URL :
        this.ConnectionUrl = 'http://localhost:9000/api/vpick/location/cb/' + this.carteBancaire + '/code/' + this.secretCode;

        // Faire une requete GET :
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data  => {
                /*
                this.locations = data as Array<Location>;
                this.numStep = 1;
                this.progressBar(1);

                this.numStep = 1;
                this.progressBar(1);
                this.getListStation();
                */
                console.log(data);
                if(data !== null) {
                    this.locations = data as Array<Location>;
                    this.numStep = 1;
                    this.progressBar(1);
                }
            }
        );

        // this.dialog.closeAll();
    }


    getLocation(): void {
        // Générer la requete / URL :
        this.ConnectionUrl = 'http://localhost:9000/api/vpick/location/';

        // Requette GET : liste bornette
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data => { this.locations = data as Location[] }
        );

        // console.log(this.locations);
    }

    getListStation(): void {
        // Générer la requete / URL :
        this.ConnectionUrl = 'http://localhost:9000/api/vpick/station/nb/'+this.locationSelected.velos.length;

        // Requette GET : liste bornette
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data => { this.stations = data as Station[]; }
        );

        // this.stations = [{ id: 1, adresse: 'Victor Hugo', bornettes: [{ numero: 1, velo: null, etat: 'OK'}]}, { id: 1, adresse: 'Champ Elysée' , bornettes: []}, { id: 1, adresse: 'Concorde' , bornettes: []}];
        // console.log(this.stations);
    }

    getBornettesFromStation(): Array<Bornette> {
        // console.log(this.stationsSelected);

        return this.stationsSelected.bornettes;
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

        // console.log("Station ", station.id, " - Selectionné !");
    }

    async selectBornette(bornette: number) {
        // console.log(bornette);

        await new Promise(resolve => { 
            setTimeout(resolve, 5000), 
            this.colorStationSeleted() 
        }); // 5 sec

        this.numStep = 4;
        this.progressBar(4);
        // this.getPaiement();
    }

    selectEtatVelo() {
        console.log(this.veloBroken);

        this.numStep = 5;
        this.progressBar(5);
        // this.getPaiement();
    }

    selectPaiement() {
        let retourObj = { idlocation: this.locationSelected.id, listeveloHS: this.veloBroken, bornettes: this.bornettesSelected };

        // Générer la requete / URL :
        this.ConnectionUrl = 'http://localhost:9000/api/vpick/retour';

        // Faire une requete POST :
        this.httpClient.post<any>(this.ConnectionUrl, retourObj).subscribe({
            next: data => {
                console.log(data);
            },
            error: error => { console.error('There was an error!', error); }
        });
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

    colorStationSeleted(): void {
        setTimeout(() => {
            let nbVeloARendre:number = this.locationSelected.velos.length;
            let nbVeloDepose:number = 0;
            let i:number = 0;
            let listBornette = this.stationsSelected.bornettes;
            let nbBornetteTotal = listBornette.length;
            
            console.log(this.stationsSelected);
            
            while(nbVeloDepose < nbVeloARendre || i < nbBornetteTotal) {
                if(listBornette[i].etat === "OK" && listBornette[i].velo === null) {
                    nbVeloDepose++;
                    this.bornettesSelected.push(listBornette[i].id);
                    document.getElementsByClassName("bornette")[i].setAttribute('class', "bornette OK selectedBornette");
                }
                
                i++;
            }

            console.log(this.bornettesSelected);
        }, 1000);
    }

    progressBar(stepNum: number) {
        // console.log("num Prec:" + this.numStep + " num Actu:" + stepNum);

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

    getPrixLocation(dateD: string): number {
        let difDate = new Date().getTime() - new Date(dateD).getTime();
        let minDif = (difDate / (1000 * 3600));
        let roundHeure = Math.ceil(minDif);
        // console.log("roundHeure " + roundHeure);

        let prix = 0;
        this.locationSelected.velos.forEach((v:Velo) => prix += v.modele.coutHoraire * roundHeure)

        return Math.round(prix*100)/100;
    }

    updateVeloHS(checkBox: MatCheckboxChange) {
        console.log(checkBox.source.value +" - "+ checkBox.checked);

        let index:number = this.veloBroken.indexOf(parseInt(checkBox.source.value));
        console.log(index);
        
        if(index !== -1 && checkBox.checked === false) {
            console.log("Supprimer obj");
            this.veloBroken = this.veloBroken.splice(index,index);
        }
        
        if(index === -1 && checkBox.checked === true) {
            console.log("ajout");
            
            this.veloBroken.push(parseInt(checkBox.source.value))
        }

        
        console.log(this.veloBroken);   
    }

    getVeloHs(id:number) {
        return this.veloBroken.indexOf(id) === -1 ? false : true;
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

    dureeLocationString(dateD: string): string{
        let duree = new Date().getTime() - new Date(dateD).getTime();
        let nbMinutes = (duree / (1000 * 60));
        return Math.floor(nbMinutes/60) + "h" + Math.floor(nbMinutes%60) + "min - Facturé " + Math.ceil(nbMinutes/60) + "h";
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

    isFormPayerValid() {
        return this.clientAbo === true || (this.clientAbo === false && this.carteBancaire.length === 19 && !this.regex.test(this.carteBancaire));
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

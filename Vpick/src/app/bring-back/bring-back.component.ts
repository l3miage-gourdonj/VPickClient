import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { fromEvent, timestamp } from 'rxjs';
import { SignInComponent } from '../sign-in/sign-in.component';
import { Personne, getClientLS, PlagesHorraires, StatusCourrant, setClientLS } from '../vepickDefinitions'
import { Bornette, Station, Location, Velo } from "../vepickDefinitions";
import {  } from '@angular/material/checkbox';
import { Router } from '@angular/router';

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
    public stationSelected!: Station;
    public bornettesSelected: Array<number> = [];
    public bornettesNumeoSelected: Array<number> = [];
    public veloBroken: Array<number> = [];

    public carteBancaire: string = "";
    private secretCode: string = "";
    private regex = new RegExp("\\d{4} \\d{4} \\d{4} \\d{4}");

    private useCreditTemps:boolean = false;
    public clientAbo:boolean = true;
    private client: Personne|null = getClientLS();

    constructor(private router: Router, private httpClient: HttpClient, public dialog: MatDialog) { }

    ngOnInit(): void {
        this.stepsElem = document.getElementsByClassName('step');
        let len = document.getElementsByClassName('step').length;
        // console.log(len);

        for (let i = 0; i < len; i++) {
            let stepElem: Element = this.stepsElem[i];
            this.stepsArray.push(stepElem);
        }

        if (this.isAlreadyConnected()) {
            let client = getClientLS();
            client?.carteBancaire != null ? this.carteBancaire = client.carteBancaire : this.carteBancaire = "";
            client?.codeSecret != null ? this.secretCode = client.codeSecret : this.secretCode = "";
            this.reqClientAbo();

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
                // console.log(data);
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
                if(data !== null) {
                    this.locations = data as Array<Location>;
                    this.numStep = 1;
                    this.progressBar(1);
                }
            }
        );

        this.clientAbo = true;

        // this.dialog.closeAll();
    }

    getListStation(): void {
        // Générer la requete / URL :
        this.ConnectionUrl = 'http://localhost:9000/api/vpick/station/nb/'+this.locationSelected.velos.length;

        // Requette GET : liste bornette
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data => { 
                this.stations = data as Station[]; console.log( this.stations ); 
            }
        );
    }

    getBornettesFromStation(): Array<Bornette> {
        return this.stationSelected.bornettes;
    }

    getCurrentPlage(station: Station) :StatusCourrant {
        // console.log(station.plagesHoraires[0].statusCourant);
        
        let currentPlageHorraire!:PlagesHorraires;
        let currentHours = new Date().getHours(); 
        let currentMin = new Date().getMinutes(); 

        station.plagesHoraires.forEach(plage => {
            if((new Date(plage.heureDebut).getHours() <= currentHours && new Date(plage.heureDebut).getMinutes() <= currentMin) && 
               (new Date(plage.heureFin).getHours() >= currentHours && new Date(plage.heureFin).getMinutes() >= currentMin)) {
                currentPlageHorraire = plage;
            }
        });

        return (currentPlageHorraire.statusCourant != null && currentPlageHorraire.statusCourant != undefined) ? currentPlageHorraire.statusCourant : StatusCourrant.VNUL;
    }




    setLocation(loc: Location) {
        this.locationSelected = loc;

        this.numStep = 2;
        this.progressBar(2);
        this.getListStation();
    }

    selectStation(station: Station) {
        this.stationSelected = station;
        this.numStep = 3;
        this.progressBar(3);

        this.selectBornette(1);
    }

    async selectBornette(bornette: number) {
        // console.log(bornette);

        await new Promise(resolve => { 
            setTimeout(resolve, 5000), 
            this.colorStationSeleted() 
        }); // 5 sec

        this.numStep = 4;
        this.progressBar(4);
    }
    
    selectEtatVelo() {
        this.numStep = 5;
        this.progressBar(5);
    }

    selectPaiement() {
        let retourObj = { idlocation: this.locationSelected.id, listeveloHS: this.veloBroken, bornettes: this.bornettesSelected };        
        // Générer la requete / URL :
        this.ConnectionUrl = 'http://localhost:9000/api/vpick/location/retour';

        // Faire une requete POST :
        this.httpClient.post<any>(this.ConnectionUrl, retourObj).subscribe({
            next: data => {
                this.router.navigate(['/']);
            },
            error: error => { console.error('There was an error!', error); }
        });

        if(this.clientAbo) {
            let creditTempsObj;            
            this.client = getClientLS();

            console.log(this.useCreditTemps);

            if(this.useCreditTemps) {
                if(this.getCurrentPlage(this.stationSelected) === StatusCourrant.VPLUS) {
                    creditTempsObj = { creditsTemps: ( (-1*this.getNbCredit()) + 15), cb: this.client?.carteBancaire, code: this.client?.codeSecret };

                    if(this.client != null) { 
                        this.client.creditTemps = 15; 
                        setClientLS(this.client);
                    }
                } else {
                    creditTempsObj = { creditsTemps: (-1*this.getNbCredit()), cb: this.client?.carteBancaire, code: this.client?.codeSecret };

                    if(this.client != null) { 
                        this.client.creditTemps = 0; 
                        setClientLS(this.client);
                    }
                }                
            } else {
                console.log(this.getCurrentPlage(this.stationSelected));

                if(this.getCurrentPlage(this.stationSelected) === StatusCourrant.VPLUS) {
                    creditTempsObj = { creditsTemps: 15, cb: this.client?.carteBancaire, code: this.client?.codeSecret };

                    if(this.client != null) { 
                        this.client.creditTemps += 15; 
                        setClientLS(this.client); 
                    }
                }
            }

            

            console.log(creditTempsObj);
            

            if(creditTempsObj?.creditsTemps !== 0) {
                // Générer la requete / URL :
                this.ConnectionUrl = 'http://localhost:9000/api/vpick/abo/credit';

                // Faire une requete POST :
                this.httpClient.post<any>(this.ConnectionUrl, creditTempsObj).subscribe({
                    next: data => {
                        this.router.navigate(['/']);
                    },
                    error: error => { console.error('There was an error!', error); }
                });
            }
        }
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
            let listBornette = this.stationSelected.bornettes;
            let nbBornetteTotal = listBornette.length;
            
            // console.log(this.stationSelected);
            // console.log("nbVeloARendre: "+nbVeloARendre);
            
            
            while(nbVeloDepose < nbVeloARendre) {
                if(listBornette[i].etat === "OK" && listBornette[i].velo === null) {
                    nbVeloDepose++;
                    this.bornettesSelected.push(listBornette[i].id);
                    this.bornettesNumeoSelected.push(listBornette[i].numero);
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
        let minDif = Math.round( (difDate / (1000 * 3600))*100 )/100;
        let roundHeure = 0;
        let prix = 0;

        console.log(minDif);
        

        if(this.veloBroken.length > 0 && minDif <= 0.05) {
            prix = 0.00;
        } else {
            if(this.useCreditTemps) {                
                roundHeure = Math.ceil(minDif - (this.getNbCredit()*100/60)/100);                                                                        
            } else {
                roundHeure = Math.ceil(minDif);
            }

            this.locationSelected.velos.forEach((v:Velo) => prix += v.modele.coutHoraire * roundHeure)

            if(this.clientAbo) {
                prix = prix * 70 / 100; // 70% du prix pour un abo
            }
        }

        return Math.round(prix*100)/100;
    }

    updateVeloHS(checkBox: MatCheckboxChange) {
        let index:number = this.veloBroken.indexOf(parseInt(checkBox.source.value));
        
        if(index !== -1 && checkBox.checked === false) {
            this.veloBroken.splice(index,1);
        }
        
        if(index === -1 && checkBox.checked === true) {
            this.veloBroken.push(parseInt(checkBox.source.value))
        } 
    }

    updateCreditTemps(checkBox: MatCheckboxChange) {
        if(checkBox.checked === true) {
            this.useCreditTemps = true;
        } else {
            this.useCreditTemps = false;
        }
    }

    getVeloHs(id:number) {
        return this.veloBroken.indexOf(id) === -1 ? false : true;
    }

    getBornetteSelected(): string {
        let bornettes: string = "[ ";

        this.bornettesNumeoSelected.forEach( (b:number, i:number) => {
            bornettes += b;
            if(i+1 !== this.bornettesNumeoSelected.length) {
                bornettes += ", ";
            }
        });

        bornettes += " ]";
        return bornettes;
    }

    returnToHome() {
        this.router.navigate(['/']);
    }

    returnToLocation() {
        this.router.navigate(['/rent']);
    }

    getNbCredit() {
        return this.client?.creditTemps != undefined ? this.client?.creditTemps : 0;
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
        console.log(this.clientAbo);
        // console.log("Verif: "+(this.clientAbo === true));
        console.log("Verif Tot: "+(this.clientAbo === true) || (this.clientAbo === false && this.carteBancaire.length === 19 && this.regex.test(this.carteBancaire)));
        console.log("Verif Tot: "+(this.carteBancaire.length === 19 && this.regex.test(this.carteBancaire)));
        
        
        return (this.clientAbo === true) || (this.clientAbo === false && this.carteBancaire.length === 19 && this.regex.test(this.carteBancaire));
    }

    isAlreadyConnected(): boolean {
        return getClientLS() !== null ? true : false;
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

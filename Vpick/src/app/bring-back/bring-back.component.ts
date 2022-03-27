import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { fromEvent, timestamp } from 'rxjs';
import { SignInComponent } from '../sign-in/sign-in.component';
import { Personne, getClientLS, PlagesHorraires, StatusCourrant, setClientLS } from '../vepickDefinitions'
import { Bornette, Station, Location, Velo } from "../vepickDefinitions";
import { } from '@angular/material/checkbox';
import { Router } from '@angular/router';

@Component({
    selector: 'app-bring-back',
    templateUrl: './bring-back.component.html',
    styleUrls: ['./bring-back.component.scss']
})
export class BringBackComponent implements OnInit {
    public stepsArray: Array<Element> = [];
    public stepsElem!: HTMLCollectionOf<Element>;

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

    private useCreditTemps: boolean = false;
    public clientAbo: boolean = true;
    private client: Personne | null = getClientLS();

    constructor(private router: Router, private httpClient: HttpClient, public dialog: MatDialog) { }

    ngOnInit(): void {
        this.stepsElem = document.getElementsByClassName('step');
        let len = document.getElementsByClassName('step').length;

        for (let i = 0; i < len; i++) {
            let stepElem: Element = this.stepsElem[i];
            this.stepsArray.push(stepElem);
        }

        if (this.isAlreadyConnected()) {
            let client = getClientLS();
            client?.carteBancaire != null ? this.carteBancaire = client.carteBancaire : this.carteBancaire = "";
            client?.codeSecret != null ? this.secretCode = client.codeSecret : this.secretCode = "";
            this.requeteGetLocationAbo();

            this.numStep = 1;
            this.progressBar(1);
        } else {
            this.numStep = 0;
            this.progressBar(0);
        }
    }
      



    // Enregistre la location choisit par le client
    selectLocation(loc: Location): void {
        this.locationSelected = loc;

        this.numStep = 2;
        this.progressBar(2);
        this.requeteGetListStation();
    }   

    // Passe à l'étape suivante et appel la selection automatique des bornettes
    selectStation(station: Station) : void {
        this.stationSelected = station;
        this.numStep = 3;
        this.progressBar(3);

        this.selectAutoBornette();
    }

    // Va faire patienter 5 secondes le client pour qu'il pose les vélo au bonne bornette
    async selectAutoBornette() {
        await new Promise(resolve => {
            setTimeout(resolve, 5000),
                this.colorStationSeleted()
        }); // 5 sec

        this.numStep = 4;
        this.progressBar(4);
    }

    // Passe à l'étape suivante 
    selectEtatVelo() {
        this.numStep = 5;
        this.progressBar(5);
    }
  






  /* Requete HTTP */
    // Return la location en cours pour un client non abonné
    requeteClientNoAbo(): void {
        // Générer la requete / URL :
        let ConnectionUrl = 'http://localhost:9000/api/vpick/location/code/' + this.secretCode;

        // Faire une requete GET :
        this.httpClient.get(ConnectionUrl).subscribe(
            data => {
                // console.log(data);
                if (data !== null) {
                    this.locations = [data as Location];
                    this.numStep = 1;
                    this.progressBar(1);
                }
            }
        );

        this.clientAbo = false;
    }

    // Return la liste des locations en cours pour un client abonné
    requeteGetLocationAbo(): void {
        // Générer la requete / URL :
        let ConnectionUrl = 'http://localhost:9000/api/vpick/location/cb/' + this.carteBancaire + '/code/' + this.secretCode;

        // Faire une requete GET :
        this.httpClient.get(ConnectionUrl).subscribe(
            data => {
                if (data !== null) {
                    this.locations = data as Array<Location>;
                    this.numStep = 1;
                    this.progressBar(1);
                }
            }
        );

        this.clientAbo = true;
    }

    // Return la liste des stations disponibles pour déposer x vélo(s)
    requeteGetListStation(): void {
        // Générer la requete / URL :
        let ConnectionUrl = 'http://localhost:9000/api/vpick/station/nb/' + this.locationSelected.velos.length;

        // Requette GET : liste bornette
        this.httpClient.get(ConnectionUrl).subscribe(
            data => {
                this.stations = data as Station[]; console.log(this.stations);
            }
        );
    }

    requetePaiement() {
        let retourObj = { idlocation: this.locationSelected.id, listeveloHS: this.veloBroken, bornettes: this.bornettesSelected };
        // Générer la requete / URL :
        let ConnectionUrl = 'http://localhost:9000/api/vpick/location/retour';

        // Faire une requete POST :
        this.httpClient.post<any>(ConnectionUrl, retourObj).subscribe({
            next: data => {
                this.router.navigate(['/']);
            },
            error: error => { console.error('There was an error!', error); }
        });

        if (this.clientAbo) {
            let creditTempsObj;
            this.client = getClientLS();
            let dureeLocation = this.getDureeLocation(this.locationSelected.dateDebut);

            if (this.useCreditTemps) {
                let usedCredit = 0;
                let creditClient = this.client?.creditTemps ?? 0;
                let minCreditForDiscount = dureeLocation % 60;

                if (creditClient >= minCreditForDiscount) {
                    usedCredit = minCreditForDiscount;
                    creditClient -= usedCredit;
                    let restantDureeLocation = dureeLocation - usedCredit;
                    while (restantDureeLocation / 60 >= 1 && creditClient / 60 >= 1) {
                        restantDureeLocation -= 60
                        creditClient -= 60
                        usedCredit += 60
                    }
                }
                if (this.getCurrentPlage(this.stationSelected) === StatusCourrant.VPLUS) {
                    creditTempsObj = { creditsTemps: Math.ceil((-1 * usedCredit) + 15), cb: this.client?.carteBancaire, code: this.client?.codeSecret };

                    if (this.client != null) {
                        this.client.creditTemps = 15;
                        setClientLS(this.client);
                    }
                } else {
                    creditTempsObj = { creditsTemps: Math.ceil(-1 * usedCredit), cb: this.client?.carteBancaire, code: this.client?.codeSecret };
                    if (this.client != null) {
                        this.client.creditTemps = Math.ceil(creditClient - usedCredit);
                        setClientLS(this.client);
                    }
                }
            } else {
                if (this.getCurrentPlage(this.stationSelected) === StatusCourrant.VPLUS) {
                    creditTempsObj = { creditsTemps: 15, cb: this.client?.carteBancaire, code: this.client?.codeSecret };

                    if (this.client != null) {
                        this.client.creditTemps += 15;
                        setClientLS(this.client);
                    }
                }
            }

            if (creditTempsObj?.creditsTemps !== 0) {
                // Générer la requete / URL :
                let ConnectionUrl = 'http://localhost:9000/api/vpick/abo/credit';

                // Faire une requete POST :
                this.httpClient.post<any>(ConnectionUrl, creditTempsObj).subscribe({
                    next: data => {
                        this.router.navigate(['/']);
                    },
                    error: error => { console.error('There was an error!', error); }
                });
            }
        }
    }
  






  /* GETTER */
    // Renvoie la liste des bornettes pour une station choisit
    getBornettesFromStation(): Array<Bornette> {
        return this.stationSelected.bornettes;
    }

    // Renvoie l'état de la station pour l'heure actuel : VPlus / VMoins / Vnul 
    getCurrentPlage(station: Station): StatusCourrant {
        // console.log(station.plagesHoraires[0].statusCourant);

        let currentPlageHorraire!: PlagesHorraires;
        let currentHours = new Date().getHours();
        let currentMin = new Date().getMinutes();

        station.plagesHoraires.forEach(plage => {
            if ((new Date(plage.heureDebut).getHours() <= currentHours && new Date(plage.heureDebut).getMinutes() <= currentMin) &&
                (new Date(plage.heureFin).getHours() >= currentHours && new Date(plage.heureFin).getMinutes() >= currentMin)) {
                currentPlageHorraire = plage;
            }
        });

        return (currentPlageHorraire.statusCourant != null && currentPlageHorraire.statusCourant != undefined) ? currentPlageHorraire.statusCourant : StatusCourrant.VNUL;
    }
    
    // Return le prix de la location lors du rendu des vélos
    getPrixLocation(dateD: string): number {
        let difDate = new Date().getTime() - new Date(dateD).getTime();
        let minDif = Math.round((difDate / (1000 * 3600)) * 100) / 100;
        let roundHeure = 0;
        let prix = 0;

        if (this.veloBroken.length > 0 && minDif <= 0.05) {
            prix = 0.00;
        } else {
            if (this.useCreditTemps) {
                roundHeure = Math.ceil(minDif - (this.getNbCredit() * 100 / 60) / 100);
            } else {
                roundHeure = Math.ceil(minDif);
            }

            this.locationSelected.velos.forEach((v: Velo) => prix += v.modele.coutHoraire * roundHeure)

            if (this.clientAbo) {
                prix = prix * 70 / 100; // 70% du prix pour un abo
            }
        }

        return Math.round(prix * 100) / 100;
    }

    // Return vrai si l'id du vélo est déjà dans la liste des vélo HS 
    getVeloHs(id: number): boolean {
        return this.veloBroken.indexOf(id) === -1 ? false : true;
    }

    // Return une liste des bornettes ou le client doit déposer ces vélo de la forme '[ ... ]'
    getBornetteSelected(): string {
        let bornettes: string = "[ ";

        this.bornettesNumeoSelected.forEach((b: number, i: number) => {
            bornettes += b;
            if (i + 1 !== this.bornettesNumeoSelected.length) {
                bornettes += ", ";
            }
        });

        bornettes += " ]";

        return bornettes;
    }

    // Return le nombre de crédit du client connecté
    getNbCredit(): number {
        return this.client?.creditTemps != undefined ? this.client?.creditTemps : 0;
    }

    // Durée sous forme:  ..h..min - Facturé ..h
    getDureeLocationString(dateD: string): string {
        let nbMinutes = this.getDureeLocation(dateD);
        return Math.floor(nbMinutes / 60) + "h" + Math.floor(nbMinutes % 60) + "min - Facturé " + Math.ceil(nbMinutes / 60) + "h";
    }   
    
    // Calcul de la durée de la location en minute 
    getDureeLocation(dateD: string): number {
        let duree = new Date().getTime() - new Date(dateD).getTime();
        return (duree / (1000 * 60));
    }







  /* UPDATE FUNCTION */
    // update du code secret
    updateSecretCode(codeS: string) {
        this.secretCode = codeS;
    }

    // update de la checkbox "utilisé les crédits temps"
    updateCreditTemps(checkBox: MatCheckboxChange) {
        if (checkBox.checked === true) {
            this.useCreditTemps = true;
        } else {
            this.useCreditTemps = false;
        }
    }

    // Ajoute ou Enleve un velo dans la liste des vélo HS pour une location
    updateVeloHS(checkBox: MatCheckboxChange) {
        let index: number = this.veloBroken.indexOf(parseInt(checkBox.source.value));

        if (index !== -1 && checkBox.checked === false) {
            this.veloBroken.splice(index, 1);
        }

        if (index === -1 && checkBox.checked === true) {
            this.veloBroken.push(parseInt(checkBox.source.value))
        }
    }







  /* AUTRE FONCTION */
    openLoginAbo(): void {
        this.clientAbo = true;
        document.getElementById("Abo")?.setAttribute('style', "display:block");
        document.getElementById("noAbo")?.setAttribute('style', "display:none");
    }

    openLoginNoAbo(): void {
        this.clientAbo = false;
        document.getElementById("Abo")?.setAttribute('style', "display:none");
        document.getElementById("noAbo")?.setAttribute('style', "display:block");
    }

    // Est ce que la carte bancaire est mal formé
    isCreditCardInvalid(): boolean {
        return this.carteBancaire.length === 19 && !this.regex.test(this.carteBancaire);
    }

    // Est ce que le code secret est bien formé -> 5 de longueur
    isFormValidNoAbo(): boolean {
        return this.secretCode.replace(/\s+/g, '').length === 5;
    }

    // Est ce que la carte bancaire est bien formé et le code secret est bien formé -> 5 de longueur
    isFormValidAbo(): boolean {
        return this.regex.test(this.carteBancaire) && this.secretCode.replace(/\s+/g, '').length === 5;
    }

    // Est ce que la carte bancaire est bien formé pour payer la location d'un non abonné
    isFormPayerValid(): boolean {
        return (this.clientAbo === true) || (this.clientAbo === false && this.carteBancaire.length === 19 && this.regex.test(this.carteBancaire));
    }

    // Est ce que le client est déjà connecté : on va voir dans le local storage
    isAlreadyConnected(): boolean {
        return getClientLS() !== null ? true : false;
    }

    // Ajouter des espaces tous les 4 chiffres du carte bancaire
    CB_format(CB: HTMLInputElement): void {
        this.carteBancaire = CB.value.replace(/\s+/g, '');
        if (this.carteBancaire !== null) {
            let cpt = 4;
            while (cpt < this.carteBancaire.length) {
                this.carteBancaire = this.carteBancaire.slice(0, cpt) + " " + this.carteBancaire.slice(cpt);
                cpt += 5;
            }
        }
    }

    // Change les div à afficher en fonction de l'état d'avancer
    displayContent(stepNum: number): void {
        document.getElementById("connexionContent")?.setAttribute('style', (stepNum == 0 ? "display:block" : "display:none"));
        document.getElementById("locationContent")?.setAttribute('style', (stepNum == 1 ? "display:block" : "display:none"));
        document.getElementById("stationContent")?.setAttribute('style', (stepNum == 2 ? "display:block" : "display:none"));
        document.getElementById("bornetteContent")?.setAttribute('style', (stepNum == 3 ? "display:block" : "display:none"));
        document.getElementById("paiementContent")?.setAttribute('style', (stepNum == 4 ? "display:block" : "display:none"));
    }

    // Ajoute une classe "selectedBornette" -> Cela rajoute de la couleur sur chaque bornette ou l'on doit rendre un vélo 
    colorStationSeleted(): void {
        setTimeout(() => {
            let nbVeloARendre: number = this.locationSelected.velos.length;
            let nbVeloDepose: number = 0;
            let i: number = 0;
            let listBornette = this.stationSelected.bornettes;

            while (nbVeloDepose < nbVeloARendre) {
                if (listBornette[i].etat === "OK" && listBornette[i].velo === null) {
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

    progressBar(stepNum: number): void {
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

    openDialogLogin(): void {
        this.dialog.open(SignInComponent, {
            height: '400px',
            width: '600px',
        })
    }

    returnToHome(): void {
        this.router.navigate(['/']);
    }

    returnToLocation(): void {
        this.router.navigate(['/rent']);
    }
}

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SignInComponent } from '../sign-in/sign-in.component';
import { Bornette, getClientLS, Personne, PlagesHorraires, setClientLS, Station, StatusCourrant } from '../vepickDefinitions';


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
    public stationSelected!: Station;

    public carteBancaire:string = "";
    public secretCode: string = "";
    private regex = new RegExp("\\d{4} \\d{4} \\d{4} \\d{4}");

    private client: Personne|null = getClientLS();
    private connexionCorrect: boolean = true;


  /* Initialisation */
    constructor(private router: Router, private httpClient: HttpClient, public dialog: MatDialog) { }

    ngOnInit(): void {
        this.stepsElem = document.getElementsByClassName('step');
        let len = document.getElementsByClassName('step').length;
        console.log(len);

        for (let i = 0; i < len; i++) {
            let stepElem: Element = this.stepsElem[i];
            this.stepsArray.push(stepElem);
        }

        if (this.isAlreadyConnected()) {
            this.selectClientNoAbo();
        } else {
            this.numStep = 0;
            this.progressBar(0);
        }
    }







    selectClientNoAbo(): void {
        this.numStep = 1;
        this.progressBar(1);
        this.requeteListStation();
    }

    selectStation(station: Station) {
        this.stationSelected = station;
        this.numStep = 2;
        this.progressBar(2);
    }

    // Ajouter une class sur les bornettes choisit par le client
    selectBornette(bElem: HTMLLIElement, bObj: Bornette) {
        if(!bElem.getAttribute('class')?.includes("selectedBornette")) {
            bElem.setAttribute('class', 'bornette OK selectedBornette');
            this.listBornSelected.push(bObj);
        } else {
            bElem.setAttribute('class', 'bornette OK');
            
            this.listBornSelected.forEach( (item, index) => {
                if(item === bObj) this.listBornSelected.splice(index,1);
              });
        }        
    }

    selectValidBornette() {
        this.numStep = 3;
        this.progressBar(3);
    }







  /* Requete HTTP */
    // Return un objet client abonné
    requeteClientAbo(): void {
        // Générer la requete / URL :
        let ConnectionUrl = 'http://localhost:9000/api/vpick/abo/cb/' + this.carteBancaire + '/code/' + this.secretCode;

        // Faire une requete GET :
        this.httpClient.get(ConnectionUrl).subscribe(
            data  => {
                if(data !== null) {
                  this.connexionCorrect = true;
                  
                  let client:Personne = data as Personne;
                  client.carteBancaire = this.carteBancaire

                  setClientLS(client);
                  this.client = (client);

                  this.numStep = 1;
                  this.progressBar(1);
                  this.requeteListStation();
                } else {
                    this.connexionCorrect = false;
                }
            }
        );
    }

    // Return la liste des stations disponibles pour louer x vélo(s)
    requeteListStation(): void {
        // Générer la requete / URL :
        let ConnectionUrl = 'http://localhost:9000/api/vpick/station/';

        // Requette GET : liste bornette
        this.httpClient.get(ConnectionUrl).subscribe(
            data => { this.stations = data as Station[]; }
        );
    }

    createLocation() {
        // Générer la requete / URL :
        let ConnectionUrl = 'http://localhost:9000/api/vpick/location/';
        let objLocation;

        if(this.clientAbo) {
            objLocation = { cbClient: this.client?.carteBancaire, codeClient: this.client?.codeSecret, bornettes: this.listBornSelected.map(b => b.id) };
        } else {
            objLocation = { bornettes: this.listBornSelected.map(b => b.id) };
        }

        // Faire une requete POST :
        this.httpClient.post<any>(ConnectionUrl, objLocation).subscribe({
            next: data => {
                this.numStep = 4;
                this.progressBar(4);
                this.secretCode = data;
            },
            error: error => { console.error('There was an error!', error); }
        });


        if(this.clientAbo) {
            let creditTempsObj;

            if(this.getCurrentPlage(this.stationSelected) as StatusCourrant == StatusCourrant.VMOINS) {               
                creditTempsObj = { creditsTemps: 15, cb: this.client?.carteBancaire, code: this.client?.codeSecret };
                this.client = getClientLS();

                if(this.client != null) { 
                    this.client.creditTemps += 15;
                    setClientLS(this.client);
                }
            } else {
                creditTempsObj = { creditsTemps: 0, cb: null, code: null };
            }

            if( creditTempsObj?.creditsTemps !== 0) {
                // Générer la requete / URL :
                let ConnectionUrl = 'http://localhost:9000/api/vpick/abo/credit';

                // Faire une requete POST :
                this.httpClient.post<any>(ConnectionUrl, creditTempsObj).subscribe({
                    next: data => { this.router.navigate(['/']); },
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

    // Return le prix de la location lors du rendu des vélos
    getPrixLocationParHeure() {
        let prixParH:number = 0.0;
        this.listBornSelected.forEach((b:Bornette) => {
            let v = b.velo;
            if(v !== null) { prixParH += v.modele.coutHoraire; }
        });

        return Math.floor(prixParH);
    }

    // Return une liste des bornettes ou le client doit déposer ces vélo de la forme '[ ... ]'
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

    getCurrentPlage(station: Station) {
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







  /* UPDATE FUNCTION */
    // update du code secret
    updateSecretCode(codeS: string) {
        this.secretCode = codeS;
    }







  /* AUTRE FONCTION */
    isFormValidAbo() {
        return this.regex.test(this.carteBancaire) && this.secretCode.replace(/\s+/g, '').length === 5;
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
            let progressStyle = "width:" + String(stepNum * 25) + "%"
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

    // Change les div à afficher en fonction de l'état d'avancer
    displayContent(stepNum: number): void {
        document.getElementById("connexionContent")?.setAttribute('style', (stepNum == 0 ? "display:block" : "display:none"));
        document.getElementById("stationContent")?.setAttribute('style', (stepNum == 1 ? "display:block" : "display:none"));
        document.getElementById("bornetteContent")?.setAttribute('style', (stepNum == 2 ? "display:block" : "display:none"));
        document.getElementById("paiementContent")?.setAttribute('style', (stepNum == 3 ? "display:block" : "display:none"));
        document.getElementById("finalContent")?.setAttribute('style', (stepNum == 4 ? "display:block" : "display:none"));
    }

    // Est ce que le client est déjà connecté : on va voir dans le local storage
    isAlreadyConnected(): boolean {
        return getClientLS() !== null ? true : false;
    }

    // Est ce que la carte bancaire est mal formé
    isCreditCardInvalid() {
        return this.carteBancaire.length === 19 && !this.regex.test(this.carteBancaire);
    }

    isListOfBornetteValid(): boolean {
        return this.listBornSelected.length > 0 ? true : false;
    }

    isConnexionInvalid(): boolean {
        return !this.connexionCorrect;
    }

    // Ajouter des espaces tous les 4 chiffres du carte bancaire
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

    backToStation() {
        this.listBornSelected = [];
        this.selectClientNoAbo();
    }

    returnToHome() {
        this.router.navigate(['/']);
    }
}

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { fromEvent } from 'rxjs';
import { Personne, Sexe, setClientLS, getClientLS } from '../vepickDefinitions'
import { Bornette, Station, Location } from "../vepickDefinitions";

@Component({
    selector: 'app-bring-back',
    templateUrl: './bring-back.component.html',
    styleUrls: ['./bring-back.component.scss']
})
export class BringBackComponent implements OnInit {
    public stepsArray: Array<Element> = [];
    public stepsElem!: HTMLCollectionOf<Element>;
    private ConnectionUrl: string = 'http://localhost:9000/api/vpick';

    public numPrecedent: number = 0;

    public stations: Array<Station> = [];
    public bornettes: Array<Bornette> = [];
    public locations: Array<Location> = [];

    private locationSelected!: Location;
    public stationsSelected!: Station;

    public creditCard: string = "";
    private secretCode: string = "";
    private regex = new RegExp("\\d{4} \\d{4} \\d{4} \\d{4}");

    constructor(private httpClient: HttpClient) { }

    ngOnInit(): void {
        this.stepsElem = document.getElementsByClassName('step');
        let len = document.getElementsByClassName('step').length;
        console.log(len);

        for (let i = 0; i < len; i++) {
            let stepElem: Element = this.stepsElem[i];
            this.stepsArray.push(stepElem);

            fromEvent(stepElem, 'click').subscribe((event) => {
                let step: Element = event.target as Element;
                this.progressBar(parseInt(step.id));
            });
        }

        if (this.isAlreadyConnected()) {
            this.getLocation();
            this.numPrecedent = 1;
            this.progressBar(1);
        } else {
            this.numPrecedent = 0;
            this.progressBar(0);
        }
    }


    getClient(): void {
        // Générer la requete / URL :
        this.ConnectionUrl += '/connexion/cb/' + this.creditCard + '/code/' + this.secretCode;

        // Faire une requete GET :
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data => {
                setClientLS(data as Personne);
                this.numPrecedent = 1;
                this.progressBar(1);
            },
            error => { console.error('Connexion error!', error); }
        );

        // Delette apres avoir mis la requete
        this.numPrecedent = 1;
        this.progressBar(1);
    }

    getLocation(): void {
        // Générer la requete / URL :
        this.ConnectionUrl += "/location/list/";

        // Requette GET : liste bornette
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data => { this.locations = data as Location[] }
        );

        this.locations = [{
            id: 1,
            velos: [
                {
                    modele: "Decat",
                    coutHoraire: 4.76,
                    etat: "OK"
                }, {
                    modele: "betouin",
                    coutHoraire: 7.93,
                    etat: "OK"
                }, {
                    modele: "lalldldld",
                    coutHoraire: 3.6,
                    etat: "OK"
                }
            ],
            dateDebut: new Date("March 21, 2022 13:00:00"),
            dateFin: new Date("March 21, 2022 14:00:00"),
        }];

        console.log(this.locations);
    }

    getListBornette(id: number): void {
        // Générer la requete / URL :
        this.ConnectionUrl += "/bornette/id/" + id;

        // Requette GET : liste bornette
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data => { this.bornettes = data as Bornette[] }
        );

        console.log(this.bornettes);

        this.selectBornette(1);
    }

    getListStation(): void {
        // Générer la requete / URL :
        this.ConnectionUrl += '/station/nb/5';

        // Requette GET : liste bornette
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data => { this.stations = data as Station[]; },
            error => { console.error('Connexion error!', error); }
        );

        this.stations = [{ id: 1, adresse: 'Victor Hugo', bornettes: []}, { id: 1, adresse: 'Champ Elysée' , bornettes: []}, { id: 1, adresse: 'Concorde' , bornettes: []}];
        console.log(this.stations);
    }

    getBornettesFromStation(): Array<Bornette> {
        return this.stationsSelected.bornettes;
    }

    getPaiement(): void {

    }




    setLocation(loc: Location) {
        this.locationSelected = loc;

        this.numPrecedent = 2;
        this.progressBar(2);
        this.getListStation();
    }

    selectStation(station: Station) {
        this.stationsSelected = station;
        this.numPrecedent = 3;
        this.progressBar(3);
        this.getListBornette(station.id);

        console.log("Station ", station.id, " - Selectionné !");
    }

    async selectBornette(bornette: number) {
        console.log(bornette);

        // afficher plein de case en couleur pour faire genre on cherche une station dispo
        // pendant 5 secondes puis go
        //c onsole.log(1);
        await new Promise(resolve => { setTimeout(resolve, 5000), this.colorStation() }); // 3 sec
        // console.log(2);

        this.numPrecedent = 4;
        this.progressBar(4);

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
        console.log("num Prec:" + this.numPrecedent + " num Actu:" + stepNum);

        if (this.numPrecedent >= stepNum) {
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

    getCalculNbHeures(dateD: Date) {
        let difDate = new Date().getTime() - dateD.getTime();
        let heureDif = difDate / (1000 * 3600)
        return Math.round(heureDif*100)/100;
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

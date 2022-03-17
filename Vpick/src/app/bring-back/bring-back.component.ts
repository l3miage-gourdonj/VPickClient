import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { waitForAsync } from '@angular/core/testing';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-bring-back',
  templateUrl: './bring-back.component.html',
  styleUrls: ['./bring-back.component.scss']
})
export class BringBackComponent implements OnInit {
    public stepsArray:Array<Element> = [];
    public stepsElem!:HTMLCollectionOf<Element>;
    private ConnectionUrl:string = 'http://localhost:9000/api/vpick';
    public stations:Array<string> = [];
    private numPrecedent: number = 0;

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

      // TEMPO / DELETE PLS
      this.numPrecedent = 1;
      this.progressBar(0);
    }




    getListBornette(): Array<string> {
        /*
        // Générer la requete / URL :
        this.ConnectionUrl += '/bornette/list/';

        // Requette GET : liste bornette
        this.httpClient.get(this.ConnectionUrl).subscribe(
            data  => { ICI REMPLIR UN TABLEAU DES STRING },
            error => { console.error('Connexion error!', error); }
        );
        */
        return ["Victor Hugo", "Place de la concorde", "Champ Elysée"];
    }
    
    getListStation() {
        return this.stations;
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
        */
        
        this.numPrecedent = 2;
        this.progressBar(2);
        this.stations = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
        this.selectStation();
    }

    async selectStation() {
        // afficher plein de case en couleur pour faire genre on cherche une station dispo
        // pendant 5 secondes puis go
        console.log(1);
        await new Promise(resolve => {setTimeout(resolve, 5000),this.colorStation()} ); // 3 sec
        console.log(2);

        this.numPrecedent = 3;
        this.progressBar(3);
        this.selectPaiement();
        console.log("Station 01 - Selectionné !");
    }

    selectPaiement() {

    }

    

    displayContent(stepNum:number) {
        if(stepNum == 0) {
            document.getElementById("connexionContent")?.setAttribute('style',"display:block");
            document.getElementById("stationContent")?.setAttribute('style',"display:none");
            document.getElementById("bornetteContent")?.setAttribute('style',"display:none");
            document.getElementById("paiementContent")?.setAttribute('style',"display:none");
        } else if(stepNum == 1) {
            document.getElementById("connexionContent")?.setAttribute('style',"display:none");
            document.getElementById("stationContent")?.setAttribute('style',"display:none");
            document.getElementById("bornetteContent")?.setAttribute('style',"display:block");
            document.getElementById("paiementContent")?.setAttribute('style',"display:none");
        } else if(stepNum == 2) {
            document.getElementById("connexionContent")?.setAttribute('style',"display:none");
            document.getElementById("bornetteContent")?.setAttribute('style',"display:none");
            document.getElementById("stationContent")?.setAttribute('style',"display:block");
            document.getElementById("paiementContent")?.setAttribute('style',"display:none");
        } else if(stepNum == 3) {
            document.getElementById("connexionContent")?.setAttribute('style',"display:none");
            document.getElementById("bornetteContent")?.setAttribute('style',"display:none");
            document.getElementById("stationContent")?.setAttribute('style',"display:none");
            document.getElementById("paiementContent")?.setAttribute('style',"display:block");
        }
    }

    colorStation() {
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
}

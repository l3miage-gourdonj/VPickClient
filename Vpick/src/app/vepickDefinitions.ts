export interface Personne {
    nom: string, 
    prenom: string, 
    dateNaissance: Date, 
    adresse: string, 
    sexe: Sexe, 
    codeSecret: string,
    carteBanquaire: string,
    dateDebut: Date,
    dateFin: Date,
    creditTemps: number
}

export enum Sexe {
    HOMME = "HOMME", 
    FEMME = "FEMME"
}

export function toStringPersonne(p:Personne): string {    
    return '{}';
}

export function setClientLS(client: Personne) {
    console.log("sav");
    
    localStorage.setItem("client",JSON.stringify(client));
}

export function getClientLS() : Personne|null {
    let contentLS = localStorage.getItem('client');
    return contentLS != null ? JSON.parse( contentLS ) : null;
}
  


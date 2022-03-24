export interface Personne {
    nom: string,
    prenom: string,
    dateNaissance: Date,
    adresse: string,
    sexe: Sexe,
    codeSecret: string,
    carteBancaire: string,
    dateDebut: Date,
    dateFin: Date,
    creditTemps: number
}

export interface Bornette {
    id: number,
    numero: number,
    velo: Velo | null,
    etat: Etat
}

export interface Station {
    id: number,
    adresse: string,
    bornettes: Array<Bornette>,
    plagesHoraires: Array<PlagesHorraires>
}

export interface Location {
    id: number,
    codeSecret: string,
    velos: Array<Velo>,
    dateDebut: string,
}

export type Etat = "OK" | "HS";

export interface Velo {
    id: number,
    modele: Modele,
    etat: Etat
}

export interface Modele {
    id: number,
    modele: string,
    coutHoraire: number
}

export interface PlagesHorraires {
    heureDebut: string,
    heureFin: string,
    statusCourant: StatusCourrant
}

export enum StatusCourrant {
    VPLUS = "VPlus",
    VMOINS = "VMoins",
    VNUL = "VNul"
}

export enum Sexe {
    HOMME = "HOMME",
    FEMME = "FEMME"
}

export function toStringPersonne(p: Personne): string {
    return '{}';
}

export function setClientLS(client: Personne) {
    console.log("sav");

    localStorage.setItem("client", JSON.stringify(client));
}

export function getClientLS(): Personne | null {
    let contentLS = localStorage.getItem('client');
    return contentLS != null ? JSON.parse(contentLS) : null;
}


export function getCurrentPlage():number {
    return 0;
}
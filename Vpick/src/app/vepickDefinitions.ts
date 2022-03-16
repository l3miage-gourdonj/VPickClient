export interface Personne {
    nom: string, 
    prenom: string, 
    dateNaissance: Date, 
    adresse: string, 
    sexe: Sexe, 
    codeSecret: string,
    carteBanquaire: string,
    dateDebut: Date,
    dateFin: Date
}

export enum Sexe {
    HOMME = "HOMME", 
    FEMME = "FEMME"
}
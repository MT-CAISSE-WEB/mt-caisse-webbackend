class ecrituremodel {
    constructor(idecriture, numligne, journal, date_ecriture, type_operation, compte, sens, libelle, montant, tiers, devise, etat, createdat, createdby, updatedat, updatedby) {
        this.idecriture = idecriture;
        this.numligne = numligne;
        this.journal = journal;
        this.date_ecriture = date_ecriture;
        this.type_operation = type_operation;
        this.compte = compte;
        this.sens = sens;
        this.libelle = libelle;
        this.montant = montant;
        this.tiers = tiers ; 
        this.devise = devise;
        this.etat = etat;
        this.createdat = createdat;
        this.createdby = createdby;
        this.updatedat = updatedat;
        this.updatedby = updatedby;

      
    }
}

module.exports = ecrituremodel;
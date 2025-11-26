class societemodel {
    constructor(idsociete, code, raisonsociale, rccm, numnui, email, telephone, logo, adresse, suivibudgetaire, 
        createdat, updatedat, createdby, updatedby)
    {
        this.idsociete = idsociete;
        this.code = code;
        this.raisonsociale = raisonsociale;
        this.rccm = rccm;
        this.numnui = numnui;
        this.email = email;
        this.telephone = telephone;
        this.logo = logo;
        this.adresse = adresse;
        this.suivibudgetaire = suivibudgetaire;
        this.createdat = createdat;
        this.updatedat = updatedat;
        this.createdby = createdby;
        this.updatedby = updatedby;
    }   
}



module.exports = societemodel;
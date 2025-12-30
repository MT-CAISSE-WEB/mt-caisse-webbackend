class sitemodel {
    constructor(idsite,idsociete,codesite,idcentreanalytique,libelle ,email,telephone,adresse,estcentreanalytique,createdat, updatedat, createdby, updatedby)
    { 
        this.idsite = idsite;
        this.idsociete = idsociete;
        this.codesite = codesite;
        this.idcentreanalytique = idcentreanalytique;
        this.libelle = libelle ;
        this.email = email;
        this.telephone = telephone;
        this.adresse = adresse;
        this.estcentreanalytique = estcentreanalytique;
        this.createdat = createdat;
        this.createdby = createdby;
        this.updatedat = updatedat;
        this.updatedby = updatedby
    }   
}

module.exports = sitemodel;

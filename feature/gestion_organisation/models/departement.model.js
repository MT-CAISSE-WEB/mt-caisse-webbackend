 class departementmodel {
    constructor(iddepartement,idsociete,idsite,responsable,codedept,libelle,email,telephone,adresse,createdat,createdby,updatedat,updatedby){
           this.iddepartement = iddepartement;
           this.idsociete = idsociete;
           this.idsite = idsite;
           this.responsable = responsable;
           this.codedept = codedept;
           this.libelle = libelle;
           this.email = email;
           this.telephone = telephone;
           this.adresse = adresse;
           this.createdat = createdat;
           this.createdby = createdby;
           this.updatedat = updatedat;
           this.updatedby = updatedby;
    }
 }

 
module.exports = departementmodel;

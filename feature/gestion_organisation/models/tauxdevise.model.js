class tauxdevisemodel {
    constructor(idtauxdevise,iddeviseorigine,iddevisedestination, codetauxdevise,intitule,typecours,datecours,coefficient,coefficientinverse,createdat,createdby,updatedat,updatedby){
      this.idtauxdevise = idtauxdevise;
      this.iddeviseorigine = iddeviseorigine;
      this.iddevisedestination = iddevisedestination;
      this.codetauxdevise = codetauxdevise;
      this.intitule = intitule ;
      this.typecours = typecours;
      this.datecours = datecours;
      this.coefficient = coefficient;
      this.coefficientinverse = coefficientinverse;
      this.createdat = createdat;
      this.createdby = createdby;
      this.updatedat = updatedat;
      this.updatedby = updatedby; 
    }
}

module.exports = tauxdevisemodel;
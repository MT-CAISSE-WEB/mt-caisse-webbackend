class devisemodel {
<<<<<<< HEAD
    constructor(codedevise, intitule, codeiso, actif, createdby, updatedby) {
=======
    constructor(iddevise, codedevise, intitule, codeiso, actif, createdat, createdby, updatedat, updatedby) {
        this.iddevise = iddevise;
>>>>>>> origin/richard
        this.codedevise = codedevise;
        this.intitule = intitule;
        this.codeiso = codeiso;
        this.actif = actif;
        this.createdat =createdat
        this.updatedat = updatedat
        this.createdby = createdby;
        this.updatedby = updatedby;
    }
}

module.exports = devisemodel;
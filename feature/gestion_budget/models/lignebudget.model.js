class BudgetDepartementNature {
  constructor(
    idbudget,
    codebudget,
    iddepartement,
    codedept,
    idnature,
    codenature,
    montantprevisiondept,
    montantprevisionsite,
    montantprevisionsociete,
    totalconsocloture,
    soldecloture,
    createdat,
    createdby,
    updatedat,
    updatedby
  ) {
    this.idbudget = idbudget
    this.codebudget = codebudget
    this.iddepartement = iddepartement
    this.codedept = codedept
    this.idnature = idnature
    this.codenature = codenature
    this.montantprevisiondept = montantprevisiondept
    this.montantprevisionsite = montantprevisionsite
    this.montantprevisionsite = montantprevisiondept
    this.montantprevisionsociete = montantprevisionsociete
    this.totalconsocloture = totalconsocloture
    this.soldecloture = soldecloture
    this.createdat = createdat
    this.createdby = createdby
    this.updatedat = updatedat
    this.updatedby = updatedby
  }
}

module.exports = BudgetDepartementNature

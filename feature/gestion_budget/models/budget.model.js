class Budget {
  constructor(
    idbudget,
    code,
    idbudgetparent,
    typebudget,
    datedebut,
    datefin,
    actif,
    cloture,
    valide,
    codecircuit,
    dernierniveau,
    niveauactuel,
    validedept,
    datevalidedept,
    validesite,
    datevalidesite,
    validesociete,
    datevalidesociete,
    idsite,
    idsociete,
    codesociete,
    codesite,
    createdat,
    createdby,
    updatedat,
    updatedby
  ) {
    this.idbudget = idbudget
    this.code = code
    this.idbudgetparent = idbudgetparent
    this.typebudget = typebudget
    this.datedebut = datedebut
    this.datefin = datefin
    this.actif = actif
    this.cloture = cloture
    this.valide = valide
    this.codecircuit = codecircuit
    this.dernierniveau = dernierniveau
    this.niveauactuel = niveauactuel
    this.validedept = validedept
    this.datevalidedept = datevalidedept
    this.validesite = validesite
    this.datevalidesite = datevalidesite
    this.validesociete = validesociete
    this.datevalidesociete = datevalidesociete
    this.idsite = idsite
    this.idsociete = idsociete
    this.codesociete = codesociete
    this.codesite = codesite
    this.createdat = createdat
    this.createdby = createdby
    this.updatedat = updatedat
    this.updatedby = updatedby
  }
}

module.exports = Budget

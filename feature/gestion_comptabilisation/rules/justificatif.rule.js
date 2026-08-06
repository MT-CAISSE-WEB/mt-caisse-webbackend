module.exports = function  justificatifRule(
  paramcomptable,
  natureoperationdecaj,
  justificatif,
  justificatifdetails,
  typeoperation,
  ecriturecomptable,
) {
  let result = [];
  let num = 1;

  //compte d'attente pour le justificatif
  result.push({
    idtypeoperation: typeoperation[0].idtypeoperation,
    typeoperation: typeoperation[0].codtypeoperation,

    idcompte: natureoperationdecaj[0].idcompte,
    compte: natureoperationdecaj[0].numcompte,

    idjournal: paramcomptable[0].idjournal,
    journal: paramcomptable[0].codejournal,

    idnature: natureoperationdecaj[0].idnature,
    codenature: natureoperationdecaj[0].codenature,
    libellenature: natureoperationdecaj[0].libelle,

    idcentreanalytique: natureoperationdecaj[0].idcentreanalytique || null,
    centreanalytique: natureoperationdecaj[0].codecentreanalytique || null,

    idtiers: natureoperationdecaj[0].idtiers || null,
    tiers: natureoperationdecaj[0].codetiers || null,

    credit: justificatif.data[0].montantjustificatif,
    debit: 0,
    etat: "en attente",
    libelle: justificatif.data[0].commentaire,
    iddevise: justificatif.data[0].iddevise,
    devise: justificatif.data[0].codedevise,
    montantdevise: justificatif.data[0].montantjustificatif,
    taux: justificatif.data[0].taux,
    montantref: justificatif.data[0].montantjustificatif,
    numligne: 1,
    typeecriture: "OD justificatif",
    date: justificatif.data[0].datejustificatif,
  });

  //compte de charges pour le justificatif
  for (const d of justificatifdetails.data[0]) {
    result.push({
      idtypeoperation: typeoperation[0].idtypeoperation,
      typeoperation: typeoperation[0].codtypeoperation,

      idcompte: d.compte_id,
      compte: d.numcompte,

      idjournal: paramcomptable[0].idjournal,
      journal: paramcomptable[0].codejournal,

      idnature: d.idnature,
      codenature: d.nature_code,
      libellenature: d.nature_libelle,

      idcentreanalytique: d.idcentreanalytique,
      centreanalytique: d.codecentreanalytique,

      idtiers: d.idtiers,
      tiers: d.tiers_libelle,

      credit: 0,
      debit: d.montantdetail,
      etat: "en attente",
      libelle: justificatif.data[0].commentaire,
      iddevise: justificatif.data[0].iddevise,
      devise: justificatif.data[0].codedevise,
      montantdevise: d.montantdetail,
      taux: justificatif.data[0].taux,
      montantref: d.montantref,
      numligne: 1,
      typeecriture: "OD justificatif",
      date: justificatif.data[0].datejustificatif,
    });
  }

  return result;
};

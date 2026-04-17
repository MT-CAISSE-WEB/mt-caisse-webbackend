const { v4: uuidv4 } = require('uuid');
const PaginationModel = require("../../../shared/utils/model");
const transfertfondModel = require('../models/transfert.model');

async function create_transfertfond(data) {
  try {

    //VALIDATION
    if (!data.codetransfert) {
      throw new Error("Le code transfert est obligatoire");
    }

    if (!data.typesource || !['Banque', 'Caisse'].includes(data.typesource)) {
      throw new Error("Type source invalide");
    }

    if (!data.iddestination) {
      throw new Error("La caisse destination est obligatoire");
    }

    if (!data.montant || data.montant <= 0) {
      throw new Error("Montant invalide");
    }

    if (!data.datetransfert) {
      throw new Error("Date transfert obligatoire");
    }

    //cohérence source
    if (data.typesource === 'Banque' && !data.idsourcebanque) {
      throw new Error("Source banque obligatoire");
    }

    if (data.typesource === 'Caisse' && !data.idsourcecaisse) {
      throw new Error("Source caisse obligatoire");
    }

    const transfert = new transfertfondModel(
      uuidv4(),
      data.codetransfert,
      data.typesource,
      data.idsourcebanque,
      data.idsourcecaisse,
      data.typesource,
      data.iddestination,
      data.taux,
      data.montant,
      data.montantref,
      data.datetransfert,
      data.description,
      data.statut,
      new Date(),
      data.createdby,
      null,
      null
    );

    const result = await transfert.create_transfertfond();

    if (!result.success) {
      throw new Error(result.message);
    }

    return result;

  } catch (err) {
    throw err;
  }
}

async function getAll_transfertfond() {
  try {
    const transfert = new transfertfondModel();
    const result = await transfert.getAll_transfertfond();

    if (!result.success) {
      throw new Error(result.message);
    }

    return result;

  } catch (err) {
    throw err;
  }
}

async function getById_transfertfond(idtransfert) {
  try {

    if (!idtransfert) {
      throw new Error("ID transfert requis");
    }

    const transfert = new transfertfondModel(idtransfert);
    const result = await transfert.getById_transfertfond();

    if (!result.success) {
      throw new Error(result.message);
    }

    return result;

  } catch (err) {
    throw err;
  }
}

async function delete_transfertfond(idtransfert) {
  try {

    if (!idtransfert) {
      throw new Error("ID transfert requis");
    }

    const transfert = new transfertfondModel(idtransfert);
    const result = await transfert.delete_transfertfond();

    if (!result.success) {
      throw new Error(result.message);
    }

    return result;

  } catch (err) {
    throw err;
  }
}

async function update_transfertfond(idtransfert, data) {
  try {

    if (!idtransfert) {
      throw new Error("ID transfert requis");
    }

    if (!data.montant || data.montant <= 0) {
      throw new Error("Montant invalide");
    }

    if (!data.typesource || !['Banque', 'Caisse'].includes(data.typesource)) {
      throw new Error("Type source invalide");
    }

    //cohérence source
    if (data.typesource === 'Banque' && !data.idsourcebanque) {
      throw new Error("Source banque obligatoire");
    }

    if (data.typesource === 'Caisse' && !data.idsourcecaisse) {
      throw new Error("Source caisse obligatoire");
    }

    const transfert = new transfertfondModel(
      idtransfert,
      data.codetransfert,
      data.typesource,
      data.idsourcebanque,
      data.idsourcecaisse,
      'CAISSE',
      data.iddestination,
      data.taux,
      data.montant,
      data.montantref,
      data.datetransfert,
      data.description,
      null,
      null,
      null,
      new Date(),
      data.updatedby
    );

    const result = await transfert.update_transfertfond();

    if (!result.success) {
      throw new Error(result.message);
    }

    return result;

  } catch (err) {
    throw err;
  }
}

module.exports = {
  create_transfertfond,
  getAll_transfertfond,
  delete_transfertfond,
  update_transfertfond
};

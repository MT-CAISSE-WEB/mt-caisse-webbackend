const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const detaildemandeQuery = require('../queries/detaildemande.query');

class detailsDemandeModel {
  constructor(iddetailsdemande, iddemande, idlignedemande, idsociete, description, quantite, montant, createdat, createdby, updatedat, 
    updatedby, demande = null, lignedemande = null) {
    this.iddetailsdemande = iddetailsdemande
    this.iddemande = iddemande
    this.idlignedemande = idlignedemande
    this.idsociete = idsociete
    this.description = description
    this.quantite = quantite
    this.montant = montant
    this.createdat = createdat
    this.createdby = createdby
    this.updatedat = updatedat
    this.updatedby = updatedby
  }

  async create_detailsDemande() {
    const pool = await connectDB()
    try {
      const result = await pool.request()
        .input('iddetailsdemande', sql.UniqueIdentifier, this.iddetailsdemande || uuidv4())
        .input('iddemande', sql.UniqueIdentifier, this.iddemande)
        .input('idlignedemande', sql.UniqueIdentifier, this.idlignedemande)
        .input('idsociete', sql.UniqueIdentifier, this.idsociete)
        .input('description', sql.NVarChar(255), this.description)
        .input('quantite', sql.Decimal(22, 9), this.quantite)
        .input('montant', sql.Decimal(22, 9), this.montant)
        .input('createdat', sql.DateTime, new Date())
        .input('createdby', sql.NVarChar(50), this.createdby)
        .query(detaildemandeQuery.insert)

      return { success: true, data: result.recordset[0] }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async get_detailsByLigne(idlignedemande) {
    const pool = await connectDB()
    const result = await pool.request()
      .input('idlignedemande', sql.UniqueIdentifier, idlignedemande)
      .query(detaildemandeQuery.getDetailByLigne)

    return result.recordset
  }

  async get_detailsByDemande(iddemande) {
    const pool = await connectDB()
    const result = await pool.request()
      .input('iddemande', sql.UniqueIdentifier, iddemande)
      .query(detaildemandeQuery.getDetailByDemande)

    return result.recordset
  }

  async get_oneDetail(iddetailsdemande) {
    const pool = await connectDB()
    const result = await pool.request()
      .input('iddetailsdemande', sql.UniqueIdentifier, iddetailsdemande)
      .query(detaildemandeQuery.getOne)

    return result.recordset[0]
  }

  async update_detailsDemande(iddetailsdemande, data) {
    const pool = await connectDB()
    const result = await pool.request()
      .input('iddetailsdemande', sql.UniqueIdentifier, iddetailsdemande)
      .input('description', sql.NVarChar(255), data.description)
      .input('quantite', sql.Decimal(22, 9), data.quantite)
      .input('montant', sql.Decimal(22, 9), data.montant)
      .input('updatedat', sql.DateTime, new Date())
      .input('updatedby', sql.NVarChar(50), data.updatedby)
      .query(detaildemandeQuery.update)

    return result
  }

  async delete_detailsDemande(iddetailsdemande) {
    const pool = await connectDB()
    const result = await pool.request()
      .input('iddetailsdemande', sql.UniqueIdentifier, iddetailsdemande)
      .query(detaildemandeQuery.delete)

      console.log(result);
    return { success: true, data: result }
  }

}

module.exports = detailsDemandeModel
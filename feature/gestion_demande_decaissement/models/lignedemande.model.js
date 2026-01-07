const {sql, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const ligneDemandeQuery = require('../queries/ligneDemande.query');

class ligneDemandeModel {
  constructor(
    idlignedemande, iddemande, numligne, libellelignedemande, montantdemande, budgetconso, preengage, engage, realise, idnature, idbudget, idcentre, idtiers, idsociete, idsite, 
    createdat, createdby, updatedat, updatedby, demande = null, nature = null, budget = null, centre = null, tiers = null, societe = null, site = null) {
    this.idlignedemande = idlignedemande
    this.iddemande = iddemande
    this.numligne = numligne
    this.libellelignedemande = libellelignedemande
    this.montantdemande = montantdemande
    this.budgetconso = budgetconso
    this.preengage = preengage
    this.engage = engage
    this.realise = realise
    this.idnature = idnature
    this.idbudget = idbudget
    this.idcentre = idcentre
    this.idtiers = idtiers
    this.idsociete = idsociete
    this.idsite = idsite

    this.nature = nature
    this.centre = centre 
    this.tiers = tiers
    this.budget = budget
    this.demande = demande 
    this.societe = societe 
    this.site = site

    this.createdat = createdat
    this.createdby = createdby
    this.updatedat = updatedat
    this.updatedby = updatedby
  }

  async create_ligneDemande() {
    const pool = await connectDB()
    try {
      const result = await pool.request()
        .input('idlignedemande', sql.UniqueIdentifier, this.idlignedemande || uuidv4())
        .input('iddemande', sql.UniqueIdentifier, this.iddemande)
        .input('numligne', sql.Int, this.numligne)
        .input('libellelignedemande', sql.NVarChar(255), this.libellelignedemande)
        .input('montantdemande', sql.Decimal(22, 9), this.montantdemande)
        .input('budgetconso', sql.Decimal(22, 9), this.budgetconso)
        .input('preengage', sql.Decimal(22, 9), this.preengage)
        .input('engage', sql.Decimal(22, 9), this.engage)
        .input('realise', sql.Decimal(22, 9), this.realise)
        .input('idnature', sql.UniqueIdentifier, this.idnature)
        .input('idbudget', sql.UniqueIdentifier, this.idbudget)
        .input('idcentre', sql.UniqueIdentifier, this.idcentre)
        .input('idtiers', sql.UniqueIdentifier, this.idtiers)
        .input('idsociete', sql.UniqueIdentifier, this.idsociete)
        .input('idsite', sql.UniqueIdentifier, this.idsite)
        .input('createdat', sql.DateTime, new Date())
        .input('createdby', sql.NVarChar(50), this.createdby)
        .query(ligneDemandeQuery.insert)

      return { success: true, data: result.recordset[0] }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  async get_lignesByDemande(iddemande) {
    const pool = await connectDB()
    const result = await pool.request()
      .input('iddemande', sql.UniqueIdentifier, iddemande)
      .query(ligneDemandeQuery.getBydemande)

    return result.recordset
  }

  async get_allLignes({ page = 1, limit = 10, search = null }) {
    page = parseInt(page)
    limit = parseInt(limit)
    const offset = (page - 1) * limit

    const pool = await connectDB()
    const result = await pool.request()
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit)
      .input('search', sql.NVarChar, search ? `%${search}%` : null)
      .query(ligneDemandeQuery.getAll)

    return { page, limit, total: result.recordsets[1][0].total, data: result.recordsets[0]}
  }

  async get_oneLigne(idlignedemande) {
    const pool = await connectDB()
    const result = await pool.request()
      .input('idlignedemande', sql.UniqueIdentifier, idlignedemande)
      .query(ligneDemandeQuery.getOne)

    return result.recordset[0]
  }

  async update_ligneDemande(idlignedemande, data) {
    const pool = await connectDB()
    const result = await pool.request()
      .input('idlignedemande', sql.UniqueIdentifier, idlignedemande)
      .input('idtiers', sql.UniqueIdentifier, data.idtiers)
      .input('idnature', sql.UniqueIdentifier, data.idnature)
      .input('idcentre', sql.UniqueIdentifier, data.idcentre)
      .input('libellelignedemande', sql.NVarChar(255), data.libellelignedemande)
      .input('montantdemande', sql.Decimal(22, 9), data.montantdemande)
      .input('updatedat', sql.DateTime, new Date())
      .input('updatedby', sql.NVarChar(50), data.updatedby)
      .query(ligneDemandeQuery.update)

    return result.recordset[0]
  }

  async delete_ligneDemande(idlignedemande) {
    const pool = await connectDB()
    const result = await pool.request()
      .input('idlignedemande', sql.UniqueIdentifier, idlignedemande)
      .query(ligneDemandeQuery.delete)

    return { success: true, data: result }
  }

  async resolveBudget({idsociete, idsite, iddepartement, idnature, datedemande}){
    const pool = await connectDB()
    const result = await pool.request()
      .input('idnature', sql.UniqueIdentifier, idnature)
      .input('idsociete', sql.UniqueIdentifier, idsociete)
      .input('idsite', sql.UniqueIdentifier, idsite)
      .input('iddepartement', sql.UniqueIdentifier, iddepartement)
      .input('datedemande', sql.DateTime, datedemande)
      .query(ligneDemandeQuery.resoleveBudget);

      return result.recordset;
  }

  async checkBudgetSolde({ idbudget, idnature, montant, iddepartement }){
    const pool = await connectDB()
    const result = await pool.request()
      .input('idnature', sql.UniqueIdentifier, idnature)
      .input('idbudget', sql.UniqueIdentifier, idbudget)
      .input('iddepartement', sql.UniqueIdentifier, iddepartement)
      .input('montant', sql.Decimal(22,9), montant)
      .query(ligneDemandeQuery.checkBudgetSolde);

      if (!result.recordset.length || result.recordset[0].solde < montant) {
        throw new Error('Budget insuffisant');
      }

      return result.recordset;
  }

  async get_suiviBudget() {
    const pool = await connectDB()
    const result = await pool.request().query(ligneDemandeQuery.suivibudget)

    return result.recordset
  }

  async get_suiviBudgetBydemande(idbudget) {
    const pool = await connectDB()
    const result = await pool.request()
    .input('idbudget', sql.UniqueIdentifier, idbudget)
    .query(ligneDemandeQuery.suiviBydemande)

    return result.recordset
  }

  async get_preengageBynature(idnature){
    const pool = await connectDB()
    const result = await pool.request()
    .input('idnature', sql.UniqueIdentifier, idnature)
    .query(ligneDemandeQuery.preengage)

    return result.recordset
  }

  async get_engageBynature(idnature){
    const pool = await connectDB()
    const result = await pool.request()
    .input('idnature', sql.UniqueIdentifier, idnature)
    .query(ligneDemandeQuery.engage)

    return result.recordset
  }

  async get_realiseBynature(idnature){
    const pool = await connectDB()
    const result = await pool.request()
    .input('idnature', sql.UniqueIdentifier, idnature)
    .query(ligneDemandeQuery.reel)

    return result.recordset
  }
  
}


module.exports = ligneDemandeModel
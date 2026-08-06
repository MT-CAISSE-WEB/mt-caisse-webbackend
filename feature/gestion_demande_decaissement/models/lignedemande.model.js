const { sql, connectInstance, connectDB } = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const ligneDemandeQuery = require('../queries/ligneDemande.query');

class ligneDemandeModel {
  constructor(
    idlignedemande, iddemande, numligne, libellelignedemande, montantref, montantdemande, budgetconso, preengage, engage, realise, idnature, idbudget, codebudgetaire, idlignebudget, idcentre, idtiers, idsociete, idsite,
    createdat, createdby, updatedat, updatedby, demande = null, nature = null, budget = null, centre = null, tiers = null, societe = null, site = null) {
    this.idlignedemande = idlignedemande
    this.iddemande = iddemande
    this.numligne = numligne
    this.libellelignedemande = libellelignedemande
    this.montantdemande = montantdemande
    this.montantref = montantref
    this.budgetconso = budgetconso
    this.preengage = preengage
    this.engage = engage
    this.realise = realise
    this.idnature = idnature
    this.idbudget = idbudget
    this.idcentre = idcentre
    this.codebudgetaire = codebudgetaire
    this.idlignebudget = idlignebudget
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
        .input('montantref', sql.Decimal(22, 9), this.montantref)
        .input('budgetconso', sql.Decimal(22, 9), this.budgetconso)
        .input('preengage', sql.Decimal(22, 9), this.preengage)
        .input('engage', sql.Decimal(22, 9), this.engage)
        .input('realise', sql.Decimal(22, 9), this.realise)
        .input('idnature', sql.UniqueIdentifier, this.idnature)
        .input('idbudget', sql.UniqueIdentifier, this.idbudget)
        .input('idlignebudget', sql.UniqueIdentifier, this.idlignebudget)
        .input('codebudget', sql.NVarChar(255), this.codebudgetaire)
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

    return { page, limit, total: result.recordsets[1][0].total, data: result.recordsets[0] }
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
      .input('montantref', sql.Decimal(22, 9), data.montantref)
      .input('codebudget', sql.NVarChar(20), data.codebudgetaire)
      .input('idlignebudget', sql.UniqueIdentifier, data.idlignebudget)
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

  async checktypebudget(data) {
    const pool = await connectDB()
    const result = await pool.request()
      .input('idsociete', sql.UniqueIdentifier, data.idsociete)
      .input('idsite', sql.UniqueIdentifier, data.idsite)
      .input('datedemande', sql.DateTime, new Date(data.datedemande))
      .query(ligneDemandeQuery.checktypebudget);

    return result.recordset;
  }

  async resoleveBudgetnature(data) {
    const pool = await connectDB()
    const result = await pool.request()
      .input('idnature', sql.UniqueIdentifier, data.idnature)
      .input('idsociete', sql.UniqueIdentifier, data.idsociete)
      .input('idsite', sql.UniqueIdentifier, data.idsite)
      .input('iddepartement', sql.UniqueIdentifier, data.iddepartement)
      .input('datedemande', sql.DateTime, data.datedemande)
      .input('idlignebudget', sql.UniqueIdentifier, data.idlignebudget)
      .query(ligneDemandeQuery.resoleveBudgetnature);

    return result.recordset;
  }

  async resoleveBudgetcentre(data) {
    const pool = await connectDB()
    const result = await pool.request()
      .input('idcentre', sql.UniqueIdentifier, data.idcentre)
      .input('idsociete', sql.UniqueIdentifier, data.idsociete)
      .input('idsite', sql.UniqueIdentifier, data.idsite)
      .input('datedemande', sql.DateTime, data.datedemande)
      .input('idlignebudget', sql.UniqueIdentifier, data.idlignebudget)
      .query(ligneDemandeQuery.resoleveBudgetcentre);

    return result.recordset;
  }

  async checkBudgetnatureSolde(data) {
    const pool = await connectDB()
    const result = await pool.request()
      .input('idnature', sql.UniqueIdentifier, data.idnature)
      .input('idbudget', sql.UniqueIdentifier, data.idbudget)
      .input('iddepartement', sql.UniqueIdentifier, data.iddepartement)
      .input('montant', sql.Decimal(22, 9), data.montant)
      .input('idlignebudget', sql.UniqueIdentifier, data.idlignebudget)
      .query(ligneDemandeQuery.checkBudgetnatureSolde);

    if (!result.recordset.length || result.recordset[0].solde < data.montant) {
      throw new Error('Budget insuffisant');
    }

    return result.recordset;
  }

  async checkBudgetcentreSolde(data) {
    const pool = await connectDB()
    const result = await pool.request()
      .input('idcentre', sql.UniqueIdentifier, data.idcentre)
      .input('idbudget', sql.UniqueIdentifier, data.idbudget)
      .input('montant', sql.Decimal(22, 9), data.montant)
      .input('idlignebudget', sql.UniqueIdentifier, data.idlignebudget)
      .query(ligneDemandeQuery.checkBudgetcentreSolde);

    if (!result.recordset.length || result.recordset[0].solde < data.montant) {
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

  async get_preengageBynature(idnature, iddepartement, idlignebudget) {
    const pool = await connectDB()
    const result = await pool.request()
      .input('idnature', sql.UniqueIdentifier, idnature)
      .input('iddepartement', sql.UniqueIdentifier, iddepartement)
      .input('idlignebudget', sql.UniqueIdentifier, idlignebudget)
      .query(ligneDemandeQuery.preengagebynature)

    return result.recordset
  }

  async get_engageBynature(idnature, iddepartement, idlignebudget) {
    const pool = await connectDB()
    const result = await pool.request()
      .input('idnature', sql.UniqueIdentifier, idnature)
      .input('iddepartement', sql.UniqueIdentifier, iddepartement)
      .input('idlignebudget', sql.UniqueIdentifier, idlignebudget)
      .query(ligneDemandeQuery.engagebynature)

    return result.recordset
  }

  async get_realiseBynature(idnature, iddepartement, idlignebudget) {
    const pool = await connectDB()
    const result = await pool.request()
      .input('idnature', sql.UniqueIdentifier, idnature)
      .input('iddepartement', sql.UniqueIdentifier, iddepartement)
      .input('idlignebudget', sql.UniqueIdentifier, idlignebudget)
      .query(ligneDemandeQuery.reelbynature)

    return result.recordset
  }

  async get_preengageBycentre(idcentre, idsite, idlignebudget) {
    const pool = await connectDB()
    const result = await pool.request()
      .input('idcentre', sql.UniqueIdentifier, idcentre)
      .input('idsite', sql.UniqueIdentifier, idsite)
      .input('idlignebudget', sql.UniqueIdentifier, idlignebudget)
      .query(ligneDemandeQuery.preengagebycentre)

    return result.recordset
  }

  async get_engageBycentre(idcentre, idsite, idlignebudget) {
    const pool = await connectDB()
    const result = await pool.request()
      .input('idcentre', sql.UniqueIdentifier, idcentre)
      .input('idsite', sql.UniqueIdentifier, idsite)
      .input('idlignebudget', sql.UniqueIdentifier, idlignebudget)
      .query(ligneDemandeQuery.engagebycentre)

    return result.recordset
  }

  async get_realiseBycentre(idcentre, idsite, idlignebudget) {
    const pool = await connectDB()
    const result = await pool.request()
      .input('idcentre', sql.UniqueIdentifier, idcentre)
      .input('idsite', sql.UniqueIdentifier, idsite)
      .input('idlignebudget', sql.UniqueIdentifier, idlignebudget)
      .query(ligneDemandeQuery.reelbycentre)

    return result.recordset
  }

}


module.exports = ligneDemandeModel
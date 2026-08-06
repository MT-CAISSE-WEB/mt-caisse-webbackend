const { sql, connectInstance, connectDB } = require("../../../config/db");
const { v4: uuidv4 } = require("uuid");
const entetedemandeQuery = require("../queries/entetedemande.query");

class enteteDemandeModel {
  constructor(
    iddemande,
    codedemande,
    iddemandeur,
    typedemande,
    libelledemande,
    taux,
    datedemande,
    decaisse,
    solde,
    statut,
    idcircuit,
    idsociete,
    idsite,
    iddepartement,
    iddevise,
    niveauactuel,
    createdat,
    createdby,
    updatedat,
    updatedby,
    circuit = null,
    societe = null,
    site = null,
    departement = null,
    devise = null,
  ) {
    this.iddemande = iddemande;
    this.codedemande = codedemande;
    this.iddemandeur = iddemandeur;
    this.typedemande = typedemande;
    this.libelledemande = libelledemande;
    this.taux = taux;
    this.datedemande = datedemande;
    this.decaisse = decaisse;
    this.solde = solde;
    this.statut = statut;
    this.niveauactuel = niveauactuel;
    this.idcircuit = idcircuit;
    this.idsociete = idsociete;
    this.idsite = idsite;
    this.iddepartement = iddepartement;
    this.iddevise = iddevise;

    this.circuit = circuit;
    this.societe = societe;
    this.site = site;
    this.departement = departement;
    this.devise = devise;

    this.createdat = createdat;
    this.createdby = createdby;
    this.updatedat = updatedat;
    this.updatedby = updatedby;
  }

  async create_enteteDemande() {
    const pool = await connectDB();
    try {
      const result = await pool
        .request()
        .input("iddemande", sql.UniqueIdentifier, this.iddemande || uuidv4())
        .input("codedemande", sql.NVarChar(50), this.codedemande)
        .input("iddemandeur", sql.UniqueIdentifier, this.iddemandeur)
        .input("typedemande", sql.NVarChar(50), this.typedemande)
        .input("libelledemande", sql.NVarChar(200), this.libelledemande)
        .input("datedemande", sql.DateTime, this.datedemande)
        .input("taux", sql.Decimal(22, 9), this.taux || 1)
        .input("decaisse", sql.Int, this.decaisse || 0)
        .input("solde", sql.Int, this.solde || 0)
        .input("statut", sql.Int, this.statut)
        .input("niveauactuel", sql.Int, this.niveauactuel)
        .input("idcircuit", sql.UniqueIdentifier, this.idcircuit)
        .input("idsociete", sql.UniqueIdentifier, this.idsociete)
        .input("idsite", sql.UniqueIdentifier, this.idsite)
        .input("iddepartement", sql.UniqueIdentifier, this.iddepartement)
        .input("iddevise", sql.UniqueIdentifier, this.iddevise)
        .input("createdat", sql.DateTime, new Date())
        .input("createdby", sql.NVarChar(50), this.createdby)
        .query(entetedemandeQuery.insert);

      return { success: true, data: result.recordset[0] };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async get_allDemandes(
    { page = 1, limit = 10, search = null, statut = null },
    user,
  ) {
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const pool = await connectDB();
    try {
      const result = await pool
        .request()
        .input("offset", sql.Int, offset)
        .input("idsite", sql.UniqueIdentifier, user.idsite)
        .input("typeentitesociete", sql.Int, user.typeentitesociete)
        .input("limit", sql.Int, limit)
        .input("search", sql.NVarChar, search ? `%${search}%` : null)
        .query(entetedemandeQuery.demandes);

      const data = result.recordsets[0];
      const total = result.recordsets[1][0].total;
      const totalPages = Math.ceil(total / limit);

      return { page, limit, total, totalPages, data };
    } catch (error) {
      throw error;
    }
  }

  async get_demande_by_id(iddemande) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("iddemande", sql.UniqueIdentifier, iddemande)
      .query(entetedemandeQuery.getOne);

    return result.recordset;
  }

  async update_enteteDemande(iddemande, data) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("iddemande", sql.UniqueIdentifier, iddemande)
      .input("devise", sql.UniqueIdentifier, data.devise)
      .input("taux", sql.Decimal(22, 9), data.taux || 1)
      .input("departement", sql.UniqueIdentifier, data.departement)
      .input("datedemande", sql.DateTime, data.datedemande)
      .input("libelledemande", sql.NVarChar(200), data.libelledemande)
      .input("typedemande", sql.NVarChar(50), data.typedemande)
      .input("niveauactuel", sql.Int, 1)
      .input("updatedat", sql.DateTime, new Date())
      .input("updatedby", sql.NVarChar(50), data.updatedby)
      .query(entetedemandeQuery.update);

    return result;
  }

  async decaisse_enteteDemande(iddemande, decaisse) {
    console.log(decaisse);
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("decaisse", sql.Int, decaisse)
      .input("iddemande", sql.UniqueIdentifier, iddemande)
      .query(entetedemandeQuery.decaisse);

    return { success: true, data: result };
  }

  async delete_enteteDemande(iddemande) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("iddemande", sql.UniqueIdentifier, iddemande)
      .query(entetedemandeQuery.delete);

    return { success: true, data: result };
  }

  async resetCircuitByDemande(iddemande) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("iddemande", sql.UniqueIdentifier, iddemande)
      .query(entetedemandeQuery.resetCircuit);

    return { success: true, data: result };
  }

  async get_circuitValidation(idsite) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("idsite", sql.UniqueIdentifier, idsite)
      .query(entetedemandeQuery.circuitDemande);

    return result.recordset;
  }

  async prepareValidateurCircuit(idcircuitvalidation) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("idcircuitvalidation", sql.UniqueIdentifier, idcircuitvalidation)
      .query(entetedemandeQuery.validateurCircuit);

    return result.recordset;
  }

  async initValidationDemande(data) {
    const pool = await connectDB();
    try {
      const result = await pool
        .request()
        .input("iddemande", sql.UniqueIdentifier, data.iddemande)
        .input(
          "idcircuitvalidation",
          sql.UniqueIdentifier,
          data.idcircuitvalidation,
        )
        .input("idcircuitetape", sql.UniqueIdentifier, data.idcircuitetape)
        .input("idutilisateur", sql.UniqueIdentifier, data.user)
        .input("rang", sql.Int, data.rang)
        .query(entetedemandeQuery.initvalidationDemande);

      return result.recordset;
    } catch (error) {
      return error;
    }
  }

  async getDemandeAvalider(idutilisateur) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("idutilisateur", sql.UniqueIdentifier, idutilisateur)
      .query(entetedemandeQuery.getDemandeAvalider);

    return result.recordset;
  }

  async get_validateurCircuit(iddemande) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("iddemande", sql.UniqueIdentifier, iddemande)
      .query(entetedemandeQuery.circuitValidateur);

    return result.recordset;
  }

  async get_detailBudgetnature(iddemande) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("iddemande", sql.UniqueIdentifier, iddemande)
      .query(entetedemandeQuery.bydetailLigneBudgetnature);

    return result.recordset;
  }

  async get_detailBudgetcentre(iddemande) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("iddemande", sql.UniqueIdentifier, iddemande)
      .query(entetedemandeQuery.bydetailLigneBudgetcentre);

    return result.recordset;
  }

  async check_doit_user(data) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("iddemande", sql.UniqueIdentifier, data.iddemande)
      .input("iduser", sql.UniqueIdentifier, data.iduser)
      .input("niveauactuel", sql.Int, data.niveauactuel)
      .query(entetedemandeQuery.checkDroit);

    return result.recordset;
  }

  async save_decision(data) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("iddemande", sql.UniqueIdentifier, data.iddemande)
      .input("iduser", sql.UniqueIdentifier, data.iduser)
      .input("idmotif", sql.UniqueIdentifier, data.motif)
      .input("commentaire", sql.NVarChar(255), data.commentaire)
      .input("decision", sql.NVarChar(20), data.decision)
      .query(entetedemandeQuery.saveDecision);

    return result.recordset;
  }

  async update_statut(data) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("iddemande", sql.UniqueIdentifier, data.iddemande)
      .input("statut", sql.Int, data.statut)
      .query(entetedemandeQuery.updateStatut);

    return result.recordset;
  }

  async get_dernierniveau(iddemande) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("iddemande", sql.UniqueIdentifier, iddemande)
      .query(entetedemandeQuery.dernierNiveau);

    return result.recordset;
  }

  async augNiveauactuel(iddemande) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("iddemande", sql.UniqueIdentifier, iddemande)
      .query(entetedemandeQuery.niveauActuel);

    return result.recordset;
  }

  async getDernierTaux(deviseorigine, devisedestination) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("iddeviseorigine", sql.UniqueIdentifier, deviseorigine)
      .input("iddevisedestination", sql.UniqueIdentifier, devisedestination)
      .query(entetedemandeQuery.niveauActuel);

    return result.recordset;
  }

  async getTauxRecent(deviseorigine, devisedestination, date) {
    const pool = await connectDB();
    try {
      const result = await pool
        .request()
        .input("idDeviseDemande", sql.UniqueIdentifier, deviseorigine)
        .input("idDeviseSociete", sql.UniqueIdentifier, devisedestination)
        .input("date", sql.DateTime, date)
        .query(entetedemandeQuery.dernierTaux);

      return result.recordset;
    } catch (error) {
      console.log(error);
    }
  }

  async get_demandeBudget(iddemande) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("iddemande", sql.UniqueIdentifier, iddemande)
      .query(entetedemandeQuery.getbudget);

    return result.recordset;
  }
}

module.exports = enteteDemandeModel;

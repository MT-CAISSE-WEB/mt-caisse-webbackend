const { transfertQueriesc } = require("../queries/queryIndex");
const {sql, connectInstance, connectDB} = require('../../../config/db');

class transfertfondModel {
  constructor(
    idtransfert,
    codetransfert,
    typesource,
    idsourcebanque,
    idsourcecaisse,
    typedestination,
    iddestination,
    taux,
    montant,
    montantref,
    datetransfert,
    description,
    statut,
    createdat,
    createdby,
    updatedat,
    updatedby,

    // objets liés (optionnels pour enrichissement)
    source_banque = null,
    source_caisse = null,
    destination_caisse = null
  ) {
    this.idtransfert = idtransfert;
    this.codetransfert = codetransfert;

    this.typesource = typesource;
    this.idsourcebanque = idsourcebanque;
    this.idsourcecaisse = idsourcecaisse;

    this.typedestination = typedestination;
    this.iddestination = iddestination;

    this.taux = taux;
    this.montant = montant;
    this.montantref = montantref;

    this.datetransfert = datetransfert;
    this.description = description;

    this.statut = statut;

    this.createdat = createdat;
    this.createdby = createdby;
    this.updatedat = updatedat;
    this.updatedby = updatedby;

    // relations
    this.source_banque = source_banque;
    this.source_caisse = source_caisse;
    this.destination_caisse = destination_caisse;
  }

  // GETALL
  async getAll_transfertfond() {
    const pool = await connectDB();
        try {
            const result = await pool.request()
            .query(transfertQueriesc.GETALL);

            return { success: true, data: result.recordset };

        } catch (error) {
            console.log(`Erreur récupération transferts: ${error}`.cyan.bold);
            return { success: false, message: error.message };
        }
    }

    async getById_transfertfond() {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idtransfert', sql.UniqueIdentifier, this.idtransfert)
            .query(transfertQueriesc.getbyid);

            return { success: true, data: result.recordset[0] };

        } catch (error) {
            console.log(`Erreur récupération transfert: ${error}`.cyan.bold);
            return { success: false, message: error.message };
        }
    }

  // CREATE
  async create_transfertfond() {
    const pool = await connectDB();
    try {

      // sécurisation logique métier
      if (this.typesource === 'Banque') {
        this.idsourcecaisse = null;
      }
      if (this.typesource === 'Caisse') {
        this.idsourcebanque = null;
      }

      const result = await pool.request()
        .input('idtransfert', sql.UniqueIdentifier, this.idtransfert)
        .input('codetransfert', sql.NVarChar(24), this.codetransfert)

        .input('typesource', sql.NVarChar(20), this.typesource)
        .input('idsourcebanque', sql.UniqueIdentifier, this.idsourcebanque)
        .input('idsourcecaisse', sql.UniqueIdentifier, this.idsourcecaisse)

        .input('typedestination', sql.NVarChar(20), this.typedestination)
        .input('iddestination', sql.UniqueIdentifier, this.iddestination)

        .input('taux', sql.Decimal(22, 9), this.taux)
        .input('montant', sql.Decimal(22, 9), this.montant)
        .input('montantref', sql.Decimal(22, 9), this.montantref)

        .input('datetransfert', sql.DateTime, this.datetransfert)
        .input('description', sql.NVarChar(100), this.description)

        .input('statut', sql.Int, this.statut)

        .input('createdat', sql.DateTime, this.createdat)
        .input('createdby', sql.NVarChar(50), this.createdby)
        .input('updatedat', sql.DateTime, this.updatedat)
        .input('updatedby', sql.NVarChar(50), this.updatedby)

        .query(transfertQueriesc.INSERT);

      return { success: true, data: result.recordset[0] };

    } catch (error) {
      console.log(`Erreur de creation transfert: ${error}`.cyan.bold);
      return { success: false, message: error.message };
    }
  }

  async validate_transfertfond(updatedby) {
    const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idtransfert', sql.UniqueIdentifier, this.idtransfert)
            .input('updatedby', sql.NVarChar(50), updatedby)
            .query(transfertQueriesc.validate);

            return { success: true, data: result };
        } catch (error) {
            console.log(`Erreur validation: ${error}`.cyan.bold);
            return { success: false, message: error.message };
        }
    }

    async delete_transfertfond() {
        const pool = await connectDB();
        try {
            const result = await pool.request()
            .input('idtransfert', sql.UniqueIdentifier, this.idtransfert)
            .query(transfertQueriesc.DELETE);

            return { success: true, data: result };

        } catch (error) {
            console.log(`Erreur suppression transfert: ${error}`.cyan.bold);
            return { success: false, message: error.message };
        }
    }

    async getByFilter_transfertfond(filters) {
        const pool = await connectDB();
        
        try {
            const result = await pool.request()
            .input('datedebut', sql.DateTime, filters.datedebut || null)
            .input('datefin', sql.DateTime, filters.datefin || null)
            .input('typesource', sql.NVarChar(20), filters.typesource || null)
            .query(transfertfondQueries.selectFilter);

            return { success: true, data: result.recordset };

        } catch (error) {
            console.log(`Erreur filtre transfert: ${error}`.cyan.bold);
            return { success: false, message: error.message };
        }
    }


    async update_transfertfond() {
        const pool = await connectDB();

        try {

            // sécurisation logique métier
            if (this.typesource === 'BANQUE') {
                this.idsourcecaisse = null;
            }
            if (this.typesource === 'CAISSE') {
                this.idsourcebanque = null;
            }

            const result = await pool.request()
                .input('idtransfert', sql.UniqueIdentifier, this.idtransfert)
                .input('codetransfert', sql.NVarChar(24), this.codetransfert)

                .input('typesource', sql.NVarChar(20), this.typesource)
                .input('idsourcebanque', sql.UniqueIdentifier, this.idsourcebanque)
                .input('idsourcecaisse', sql.UniqueIdentifier, this.idsourcecaisse)

                .input('typedestination', sql.NVarChar(20), this.typedestination)
                .input('iddestination', sql.UniqueIdentifier, this.iddestination)

                .input('taux', sql.Decimal(22, 9), this.taux)
                .input('montant', sql.Decimal(22, 9), this.montant)
                .input('montantref', sql.Decimal(22, 9), this.montantref)

                .input('datetransfert', sql.DateTime, this.datetransfert)
                .input('description', sql.NVarChar(100), this.description)

                .input('updatedat', sql.DateTime, this.updatedat)
                .input('updatedby', sql.NVarChar(50), this.updatedby)

                .query(transfertQueriesc.UPDATE);

            return { success: true, data: result };

        } catch (error) {
            console.log(`Erreur update transfert: ${error}`.cyan.bold);
            return { success: false, message: error.message };
        }
    }
}



module.exports = transfertfondModel;
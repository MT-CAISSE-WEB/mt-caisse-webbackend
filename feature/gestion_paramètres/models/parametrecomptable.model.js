const { sql, connectInstance, connectDB } = require("../../../config/db");
const { v4: uuidv4 } = require("uuid");
const { parametreComptableQueries } = require("../queries/queryIndex");
const fieldMap = {
  journal: {
    column: "idjournal",
    sqlType: sql.UniqueIdentifier,
  },
  compteintermediaire: {
    column: "idcompte",
    sqlType: sql.UniqueIdentifier,
  },
  url: {
    column: "urldossier",
    sqlType: sql.NVarChar(255),
  },
};

class ParametreComptableModel {
  constructor(
    idparametrecomptable,
    idsociete,
    idjournal,
    idcompte,
    urldossier,
    createdat,
    createdby,
    updatedat,
    updatedby,
  ) {
    this.idparametrecomptable = idparametrecomptable;
    this.idsociete = idsociete;
    this.idjournal = idjournal;
    this.idcompte = idcompte;
    this.urldossier = urldossier;
    this.createdat = createdat;
    this.createdby = createdby;
    this.updatedat = updatedat;
    this.updatedby = updatedby;
  }

  async create_parametrecomptable() {
    this.idparametrecomptable = idparametrecomptable;
    this.idsociete = idsociete;
    this.idjournal = idjournal;
    this.idcompte = idcompte;
    this.urldossier = urldossier;
    this.createdat = createdat;
    this.createdby = createdby;
    this.updatedat = updatedat;
    this.updatedby = updatedby;
  }

  async create_parametrecomptable() {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input(
        "idparametrecomptable",
        sql.UniqueIdentifier,
        this.idparametrecomptable,
      )
      .input("idsociete", sql.UniqueIdentifier, this.idsociete)
      .input("idjournal", sql.UniqueIdentifier, this.idjournal)
      .input("idcompte", sql.UniqueIdentifier, this.idcompte)
      .input("urldossier", sql.NVarChar(255), this.urldossier)
      .input("createdat", sql.DateTime, new Date())
      .input("createdby", sql.NVarChar(50), this.createdby)
      .input("updatedat", sql.DateTime, new Date())
      .input("updatedby", sql.NVarChar(50), this.updatedby)
      .query(parametreComptableQueries.insert);

    return result;
  }

  async get_allparametre() {
    const pool = await connectDB();
    const result = await pool.request().query(compteurQueries.getall);
    return result.recordset;
  }

  async get_parametrecomptable_bysociete(idsociete) {
    const pool = await connectDB();
    try {
      const result = await pool
        .request()
        .input("idsociete", sql.UniqueIdentifier, idsociete)
        .query(parametreComptableQueries.getBySociete);

      return result.recordset;
    } catch (error) {
      console.error(
        `Error fetching parametre for societe ${idsociete}:`,
        error,
      );
      throw error;
    }
  }

  async save(data) {
    const pool = await connectDB();

    try {
      const { societe, type, value, createdby, updatedby } = data;

      const field = fieldMap[type];
      if (!field) {
        throw new Error("Type de paramètre invalide");
      }

      const check = await pool
        .request()
        .input("idsociete", sql.UniqueIdentifier, societe).query(`
                    SELECT COUNT(*) AS count 
                    FROM ParametreComptable 
                    WHERE idsociete = @idsociete
                `);

      const exists = check.recordset[0].count > 0;
      let result;

      if (exists) {
        //UPDATE dynamique
        result = await pool
          .request()
          .input("idsociete", sql.UniqueIdentifier, societe)
          .input("value", field.sqlType, value)
          .input("updatedby", sql.NVarChar(50), updatedby || "SYSTEM").query(`
                        UPDATE ParametreComptable
                        SET ${field.column} = @value, updatedat = GETDATE(), updatedby = @updatedby
                        OUTPUT INSERTED.* 
                        WHERE idsociete = @idsociete
                    `);
      } else {
        //INSERT avec valeur initiale
        result = await pool
          .request()
          .input("idparametrecomptable", sql.UniqueIdentifier, uuidv4())
          .input("idsociete", sql.UniqueIdentifier, societe)
          .input("value", field.sqlType, value)
          .input("createdby", sql.NVarChar(50), createdby || "SYSTEM").query(`
                        INSERT INTO ParametreComptable (idparametrecomptable, idsociete, ${field.column}, createdat, createdby)
                        VALUES (@idparametrecomptable, @idsociete, @value, GETDATE(), @createdby)
                    `);
      }

      return { success: true, data: result.recordset[0] };
    } catch (error) {
      console.log(`Erreur save parametre: ${error}`);
      throw error;
    }
  }

  async delete_parametrecomptable(idparametrecomptable) {
    const pool = await connectDB();
    await pool
      .request()
      .input("idparametrecomptable", sql.UniqueIdentifier, idparametrecomptable)
      .query(parametreComptableQueries.delete);
    return { success: true };
  }

  // Récupérer toutes les correspondances actives (actif = 1)
  async findAllCorrespondance() {
    const pool = await connectDB();
    const result = await pool
      .request()
      .query(parametreComptableQueries.findAllcorrespondance);

    return result.recordset;
  }

  // Récupérer une correspondance par son ID (même inactive)
  async findById(id) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("idcorrespondance", sql.UniqueIdentifier, id)
      .query(parametreComptableQueries.findCorrespondanceById);

    return result.recordset[0] || null;
  }

  // Créer une nouvelle correspondance
  async createCorrespondance(data, userId = "system") {
    const pool = await connectDB();
    const {
      idcorrespondance,
      idcentreanalytique,
      correspondance,
      actif = 1,
    } = data;

    try {
      const result = await pool
        .request()
        .input(
          "idcorrespondance",
          sql.UniqueIdentifier,
          idcorrespondance || null,
        )
        .input(
          "idcentreanalytique",
          sql.UniqueIdentifier,
          idcentreanalytique || null,
        )
        .input("correspondance", sql.NVarChar(255), correspondance || null)
        .input("actif", sql.Int, actif)
        .input("createdby", sql.NVarChar(50), userId)
        .input("createdat", sql.DateTime, new Date())
        .query(parametreComptableQueries.insertCorrespondance);

      return result.recordset[0];
    } catch (error) {
      console.log("Error ", error);
    }
  }

  // Mettre à jour une correspondance
  async updateCorrespondance(id, data, userId = "system") {
    const pool = await connectDB();
    const { idcentreanalytique, correspondance } = data;

    let setClause = `
            updatedby = @updatedby,
            updatedat = GETDATE()
        `;

    const request = pool
      .request()
      .input("idcorrespondance", sql.UniqueIdentifier, id)
      .input("updatedby", sql.NVarChar(50), userId);

    if (idcentreanalytique !== undefined) {
      setClause += `,idcentreanalytique = @idcentreanalytique`;
      request.input(
        "idcentreanalytique",
        sql.UniqueIdentifier,
        idcentreanalytique,
      );
    }

    if (correspondance !== undefined) {
      setClause += `,correspondance = @correspondance`;
      request.input("correspondance", sql.NVarChar(255), correspondance);
    }

    const query = `
            UPDATE CorrespondanceAnalytique
            SET ${setClause}
            OUTPUT INSERTED.*
            WHERE idcorrespondance = @idcorrespondance
        `;

    const result = await request.query(query);
    return result.recordset[0] || null;
  }

  async hardDelete(id) {
    const pool = await connectDB();
    await pool.request().input("id", sql.UniqueIdentifier, id).query(`
            DELETE FROM CorrespondanceAnalytique
            WHERE idcorrespondance = @id
        `);
    return true;
  }

  async getCentreAnalytiqueById(idcentreanalytique) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("idcentreanalytique", sql.UniqueIdentifier, idcentreanalytique)
      .query(`
                SELECT idcentreanalytique
                FROM CentreAnalytique
                WHERE idcentreanalytique = @idcentreanalytique
            `);

    return result.recordset[0];
  }

  async getCorrespondanceByCode(correspondance) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("correspondance", sql.NVarChar(255), correspondance).query(`
                SELECT *
                FROM CorrespondanceAnalytique
                WHERE correspondance = @correspondance
            `);

    return result.recordset[0];
  }

  async getCorrespondanceByCentre(centre) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("idcentreanalytique", sql.UniqueIdentifier, centre).query(`
                SELECT *
                FROM CorrespondanceAnalytique
                WHERE idcentreanalytique = @idcentreanalytique
            `);

    return result.recordset[0];
  }

  async updateParametreComptable(idsociete, champ, valeur) {
    const champsAutorises = [
      "analytiquesite",
      "axesecond",
      "analytiquetable",
      "libelleaxe1",
      "libelleaxe2",
    ];

    if (!champsAutorises.includes(champ)) {
      throw new Error("Champ non autorisé");
    }

    const pool = await connectDB();
    const query = `
            UPDATE ParametreComptable
            SET ${champ} = @valeur,
                updatedat = GETDATE()
            OUTPUT INSERTED.*
            WHERE idsociete = @idsociete
        `;

    const result = await pool
      .request()
      .input("idsociete", sql.UniqueIdentifier, idsociete)
      .input("valeur", sql.Int, valeur)
      .query(query);

    if (result.recordset.length === 0) {
      throw new Error("Aucun paramètre comptable trouvé pour cette société.");
    }

    return result.recordset[0];
  }

  async updateParametreAxeComptable(idsociete, libelleaxe1, libelleaxe2) {
    const pool = await connectDB();
    const query = `
            UPDATE ParametreComptable
            SET libelleaxe1 = @valeur1, libelleaxe2 = @valeur2,
                updatedat = GETDATE()
            OUTPUT INSERTED.*
            WHERE idsociete = @idsociete
        `;

    const result = await pool
      .request()
      .input("idsociete", sql.UniqueIdentifier, idsociete)
      .input("valeur1", sql.NVarChar, libelleaxe1)
      .input("valeur2", sql.NVarChar, libelleaxe2)
      .query(query);

    if (result.recordset.length === 0) {
      throw new Error("Aucun paramètre comptable trouvé pour cette société.");
    }

    return result.recordset[0];
  }

  /**
   * Rechercher un centre analytique par son code
   * @param {string} codecentreanalytique - Code du centre
   * @param {string} idsociete - ID de la société (optionnel)
   * @returns {Object|null} Centre analytique trouvé ou null
   */
  async getCentreAnalytiqueByCode(codecentreanalytique, idsociete = null) {
    const pool = await connectDB();
    const request = pool.request();

    request.input(
      "codecentreanalytique",
      sql.NVarChar(50),
      codecentreanalytique,
    );
    request.input("idsociete", sql.UniqueIdentifier, idsociete);

    const result = await request.query(
      parametreComptableQueries.getCentreAnalytiqueByCode,
    );

    return result.recordset[0] || null;
  }

  /**
   * Vérifier si un centre analytique existe par son ID
   */
  async getCentreAnalytiqueById(idcentreanalytique) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("idcentreanalytique", sql.UniqueIdentifier, idcentreanalytique)
      .query(parametreComptableQueries.getCentreAnalytiqueById);

    return result.recordset[0] || null;
  }

  /**
   * Vérifier si une correspondance existe déjà pour un centre
   */
  async getCorrespondanceByCentre(idcentreanalytique) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("idcentreanalytique", sql.UniqueIdentifier, idcentreanalytique)
      .query(parametreComptableQueries.getCorrespondanceByCentre);

    return result.recordset[0] || null;
  }

  /**
   * Vérifier si une correspondance existe déjà par code
   */
  async getCorrespondanceByCode(correspondance) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("correspondance", sql.NVarChar(255), correspondance)
      .query(parametreComptableQueries.getCorrespondanceByCode);

    return result.recordset[0] || null;
  }

  /**
   * Vérifier si un couple (centre + correspondance) existe déjà
   * @param {string} idcentreanalytique - ID du centre analytique
   * @param {string} correspondance - Code de correspondance
   * @returns {Object|null} La correspondance trouvée ou null
   */
  async getCorrespondanceByCentreAndCode(idcentreanalytique, correspondance) {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("idcentreanalytique", sql.UniqueIdentifier, idcentreanalytique)
      .input("correspondance", sql.NVarChar(255), correspondance)
      .query(parametreComptableQueries.getCorrespondanceByCentreAndCode);

    return result.recordset[0] || null;
  }
}

module.exports = ParametreComptableModel;

const BudgetDepartementNature = require('../models/lignebudget.model')
const { v4: uuidv4 } = require('uuid')
const sql = require('mssql')
const db = require('../../../config/db')
const config = db.config

async function create_lignebudget(data) {
  if (
    !data.idbudget ||
    !data.iddepartement ||
    !data.idnature ||
    !data.montantprevisiondept ||
    !data.montantprevisionsite ||
    !data.montantprevisionsociete ||
    !data.totalconsocloture ||
    !data.soldecloture ||
    !data.createdby
  ) {
    throw new Error(
      'Tous les champs (idbudget, iddepartement, idnature, montantprevisiondept, montantprevisionsite, montantprevisionsociete, totalconsocloture, soldecloture, createdby) sont requis.'
    )
  }

  const db = await sql.connect({ ...config, database: 'MTCAISSEWEB' })

  try {
    const now = new Date()
    const id = uuidv4()

    // 🟦 1. Récupération automatique du budget
    const budgetResult = await db
      .request()
      .input('id', sql.UniqueIdentifier, data.idbudget)
      .query('SELECT * FROM Budget WHERE idbudget = @id')

    if (budgetResult.recordset.length === 0) {
      throw new Error("Le budget spécifié n'existe pas.")
    }

    const budget = budgetResult.recordset[0]

    // 🟦 2. Récupération automatique du département
    const departementResult = await db
      .request()
      .input('id', sql.UniqueIdentifier, data.iddepartement)
      .query('SELECT * FROM Departement WHERE iddepartement = @id')

    if (departementResult.recordset.length === 0) {
      throw new Error("Le département spécifié n'existe pas.")
    }

    const departement = departementResult.recordset[0]

    // 🟦 3. Récupération de la nature de l'opération
    let natureOpResult = await db
      .request()
      .input('id', sql.UniqueIdentifier, data.idnature)
      .query('SELECT * FROM NatureOperation WHERE idnature = @id')

    if (natureOpResult.recordset.length === 0) {
      throw new Error("Le budget parent fourni n'existe pas.")
    }

    const natureOperation = natureOpResult.recordset[0]

    // 🟦 4. Insertion de la ligne budgétaire
    const insertQuery = `
      INSERT INTO BudgetDepartementNature (id,
        idbudget, codebudget, iddepartement, codedept, idnature, codenature, montantprevisiondept, montantprevisionsite, montantprevisionsociete, totalconsocloture, soldecloture, createdat, createdby, updatedat, updatedby)
      OUTPUT inserted.*
      VALUES (
        @id, @idbudget, @codebudget, @iddepartement, @codedept, @idnature, @codenature, @montantprevisiondept, @montantprevisionsite, @montantprevisionsociete, @totalconsocloture, @soldecloture, @createdat, @createdby, @updatedat, @updatedby)
    `

    const insertResult = await db
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .input('idbudget', sql.UniqueIdentifier, data.idbudget)
      .input('code', sql.NVarChar, data.code)
      .input('iddepartement', sql.UniqueIdentifier, data.iddepartement)
      .input('idnature', sql.UniqueIdentifier, data.idnature)
      .input('montantprevisiondept', sql.Decimal, data.montantprevisiondept)
      .input('montantprevisionsite', sql.Decimal, data.montantprevisionsite)
      .input(
        'montantprevisionsociete',
        sql.Decimal,
        data.montantprevisionsociete
      )
      .input('totalconsocloture', sql.Decimal, data.totalconsocloture)
      .input('soldecloture', sql.Decimal, data.soldecloture)

      // Champs dérivés automatiques👇
      .input('codebudget', sql.NVarChar, budget.code)
      .input('codedept', sql.NVarChar, departement.codedept)
      .input('codenature', sql.NVarChar, natureOperation.codenature)

      .input('createdat', sql.DateTime, now)
      .input('createdby', sql.NVarChar, data.createdby)
      .input('updatedat', sql.DateTime, data.updatedat || null)
      .input('updatedby', sql.NVarChar, data.updatedby || null)
      .query(insertQuery)

    const insertedLigneBudgetaire = insertResult.recordset[0]

    // 🟦 5. Construction de l'objet complet retourné
    return {
      ...insertedLigneBudgetaire,
      budget,
      departement,
      natureOperation,
    }
  } catch (error) {
    console.error(
      '❌ Erreur lors de la création de la ligne budgetaire:',
      error
    )
    throw error
  } finally {
    await sql.close()
  }
}

// Obtenir toutes les lignes budgetaires
async function get_all_lignes_budgetaires(page, limit) {
  try {
    const pool = await db.poolPromise

    const offset = (page - 1) * limit

    // ➜ Récupération du total pour calculer totalPages
    const totalResult = await pool.request().query(`
        SELECT COUNT(*) AS total FROM BudgetDepartementNature
    `)
    const total = totalResult.recordset[0].total

    const SQL = `
      SELECT 
        bdn.*,

        b.idbudget          AS b_idbudget,
        b.code              AS b_code,
        b.typebudget        AS b_typebudget,
        b.datedebut         AS b_datedebut,
        b.datefin           AS b_datefin,
        b.actif             AS b_actif,
        b.cloture           AS b_cloture,
        b.valide            AS b_valide,
        b.codecircuit       AS b_codecircuit,
        b.dernierniveau     AS b_dernierniveau,
        b.niveauactuel      AS b_niveauactuel,
        b.validedept        AS b_validedept,
        b.datevalidedept    AS b_datevalidedept,
        b.validesite        AS b_validesite,
        b.datevalidesite    AS b_datevalidesite,
        b.validesociete     AS b_validesociete,
        b.datevalidesociete AS b_datevalidesociete,
        b.idsite            AS b_idsite,
        b.idsociete         AS b_idsociete,
        b.codesociete       AS b_codesociete,
        b.codesite          AS b_codesite,
        b.createdat         AS b_createdat,
        b.createdby         AS b_createdby,
        b.updatedat         AS b_updatedat,
        b.updatedby         AS b_updatedby,

        d.iddepartement     AS d_iddepartement,
        d.idsociete         AS d_idsociete,
        d.codesociete       AS d_codesociete,
        d.idsite            AS d_idsite,
        d.codesite          AS d_codesite,
        d.responsable       AS d_responsable,
        d.codedept          AS d_codedept,
        d.libelle           AS d_libelle,
        d.email             AS d_email,
        d.telephone         AS d_telephone,
        d.adresse           AS d_adresse,
        d.createdat         AS d_createdat,
        d.createdby         AS d_createdby,
        d.updatedat         AS d_updatedat,
        d.updatedby         AS d_updatedby,

        n.idnature          AS n_idnature,
        n.codenature        AS n_codenature,
        n.idsociete         AS n_idsociete,
        n.codesociete       AS n_codesociete,
        n.idcompte          AS n_idcompte,
        n.numcompte         AS n_numcompte,
        n.libelle           AS n_libelle,
        n.avanceAjustifier  AS n_avanceAjustifier,
        n.imputationTiers   AS n_imputationTiers,
        n.actif             AS n_actif,
        n.demandeDecaissement AS n_demandeDecaissement,
        n.createdat         AS n_createdat,
        n.createdby         AS n_createdby,
        n.updatedat         AS n_updatedat,
        n.updatedby         AS n_updatedby

      FROM BudgetDepartementNature bdn
      LEFT JOIN Budget b ON b.idbudget = bdn.idbudget
      LEFT JOIN Departement d ON d.iddepartement = bdn.iddepartement
      LEFT JOIN NatureOperation n ON n.idnature = bdn.idnature
      ORDER BY bdn.createdat DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY;
    `

    const result = await pool.request().query(SQL)

    const recordset = result.recordset.map((item) => ({
      id: item.id,
      idbudget: item.idbudget,
      codebudget: item.codebudget,
      iddepartement: item.iddepartement,
      codedept: item.codedept,
      idnature: item.idnature,
      codenature: item.codenature,
      montantprevisiondept: item.montantprevisiondept,
      montantprevisionsite: item.montantprevisionsite,
      montantprevisionsociete: item.montantprevisionsociete,
      totalconsocloture: item.totalconsocloture,
      soldecloture: item.soldecloture,
      createdat: item.createdat,
      createdby: item.createdby,
      updatedat: item.updatedat,
      updatedby: item.updatedby,

      budget: {
        idbudget: item.b_idbudget,
        code: item.b_code,
        typebudget: item.b_typebudget,
        datedebut: item.b_datedebut,
        datefin: item.b_datefin,
        actif: item.b_actif,
        cloture: item.b_cloture,
        valide: item.b_valide,
        codecircuit: item.b_codecircuit,
        dernierniveau: item.b_dernierniveau,
        niveauactuel: item.b_niveauactuel,
        validedept: item.b_validedept,
        datevalidedept: item.b_datevalidedept,
        validesite: item.b_validesite,
        datevalidesite: item.b_datevalidesite,
        validesociete: item.b_validesociete,
        datevalidesociete: item.b_datevalidesociete,
        idsite: item.b_idsite,
        idsociete: item.b_idsociete,
        codesociete: item.b_codesociete,
        codesite: item.b_codesite,
        createdat: item.b_createdat,
        createdby: item.b_createdby,
        updatedat: item.b_updatedat,
        updatedby: item.b_updatedby,
      },

      departement: {
        iddepartement: item.d_iddepartement,
        idsociete: item.d_idsociete,
        codesociete: item.d_codesociete,
        idsite: item.d_idsite,
        codesite: item.d_codesite,
        responsable: item.d_responsable,
        codedept: item.d_codedept,
        libelle: item.d_libelle,
        email: item.d_email,
        telephone: item.d_telephone,
        adresse: item.d_adresse,
        createdat: item.d_createdat,
        createdby: item.d_createdby,
        updatedat: item.d_updatedat,
        updatedby: item.d_updatedby,
      },

      nature: {
        idnature: item.n_idnature,
        codenature: item.n_codenature,
        idsociete: item.n_idsociete,
        codesociete: item.n_codesociete,
        idcompte: item.n_idcompte,
        numcompte: item.n_numcompte,
        libelle: item.n_libelle,
        avanceAjustifier: item.n_avanceAjustifier,
        imputationTiers: item.n_imputationTiers,
        actif: item.n_actif,
        demandeDecaissement: item.n_demandeDecaissement,
        createdat: item.n_createdat,
        createdby: item.n_createdby,
        updatedat: item.n_updatedat,
        updatedby: item.n_updatedby,
      },
    }))

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
      data: recordset,
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des lignes :', error)
    throw error
  }
}

// Obtenir une ligne budgetaire par son ID
async function get_ligne_budgetaire_by_id(id) {
  try {
    const pool = await db.poolPromise

    const SQL = `
      SELECT 
        bdn.*,

        b.idbudget          AS b_idbudget,
        b.code              AS b_code,
        b.typebudget        AS b_typebudget,
        b.datedebut         AS b_datedebut,
        b.datefin           AS b_datefin,
        b.actif             AS b_actif,
        b.cloture           AS b_cloture,
        b.valide            AS b_valide,
        b.codecircuit       AS b_codecircuit,
        b.dernierniveau     AS b_dernierniveau,
        b.niveauactuel      AS b_niveauactuel,
        b.validedept        AS b_validedept,
        b.datevalidedept    AS b_datevalidedept,
        b.validesite        AS b_validesite,
        b.datevalidesite    AS b_datevalidesite,
        b.validesociete     AS b_validesociete,
        b.datevalidesociete AS b_datevalidesociete,
        b.idsite            AS b_idsite,
        b.idsociete         AS b_idsociete,
        b.codesociete       AS b_codesociete,
        b.codesite          AS b_codesite,
        b.createdat         AS b_createdat,
        b.createdby         AS b_createdby,
        b.updatedat         AS b_updatedat,
        b.updatedby         AS b_updatedby,

        d.iddepartement     AS d_iddepartement,
        d.idsociete         AS d_idsociete,
        d.codesociete       AS d_codesociete,
        d.idsite            AS d_idsite,
        d.codesite          AS d_codesite,
        d.responsable       AS d_responsable,
        d.codedept          AS d_codedept,
        d.libelle           AS d_libelle,
        d.email             AS d_email,
        d.telephone         AS d_telephone,
        d.adresse           AS d_adresse,
        d.createdat         AS d_createdat,
        d.createdby         AS d_createdby,
        d.updatedat         AS d_updatedat,
        d.updatedby         AS d_updatedby,

        n.idnature          AS n_idnature,
        n.codenature        AS n_codenature,
        n.idsociete         AS n_idsociete,
        n.codesociete       AS n_codesociete,
        n.idcompte          AS n_idcompte,
        n.numcompte         AS n_numcompte,
        n.libelle           AS n_libelle,
        n.avanceAjustifier  AS n_avanceAjustifier,
        n.imputationTiers   AS n_imputationTiers,
        n.actif             AS n_actif,
        n.demandeDecaissement AS n_demandeDecaissement,
        n.createdat         AS n_createdat,
        n.createdby         AS n_createdby,
        n.updatedat         AS n_updatedat,
        n.updatedby         AS n_updatedby

      FROM BudgetDepartementNature bdn
      LEFT JOIN Budget b ON b.idbudget = bdn.idbudget
      LEFT JOIN Departement d ON d.iddepartement = bdn.iddepartement
      LEFT JOIN NatureOperation n ON n.idnature = bdn.idnature
      WHERE id = @id
      ORDER BY bdn.createdat DESC
    `

    const result = await pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .query(SQL)

    const recordset = result.recordset.map((item) => ({
      id: item.id,
      idbudget: item.idbudget,
      codebudget: item.codebudget,
      iddepartement: item.iddepartement,
      codedept: item.codedept,
      idnature: item.idnature,
      codenature: item.codenature,
      montantprevisiondept: item.montantprevisiondept,
      montantprevisionsite: item.montantprevisionsite,
      montantprevisionsociete: item.montantprevisionsociete,
      totalconsocloture: item.totalconsocloture,
      soldecloture: item.soldecloture,
      createdat: item.createdat,
      createdby: item.createdby,
      updatedat: item.updatedat,
      updatedby: item.updatedby,

      budget: {
        idbudget: item.b_idbudget,
        code: item.b_code,
        typebudget: item.b_typebudget,
        datedebut: item.b_datedebut,
        datefin: item.b_datefin,
        actif: item.b_actif,
        cloture: item.b_cloture,
        valide: item.b_valide,
        codecircuit: item.b_codecircuit,
        dernierniveau: item.b_dernierniveau,
        niveauactuel: item.b_niveauactuel,
        validedept: item.b_validedept,
        datevalidedept: item.b_datevalidedept,
        validesite: item.b_validesite,
        datevalidesite: item.b_datevalidesite,
        validesociete: item.b_validesociete,
        datevalidesociete: item.b_datevalidesociete,
        idsite: item.b_idsite,
        idsociete: item.b_idsociete,
        codesociete: item.b_codesociete,
        codesite: item.b_codesite,
        createdat: item.b_createdat,
        createdby: item.b_createdby,
        updatedat: item.b_updatedat,
        updatedby: item.b_updatedby,
      },

      departement: {
        iddepartement: item.d_iddepartement,
        idsociete: item.d_idsociete,
        codesociete: item.d_codesociete,
        idsite: item.d_idsite,
        codesite: item.d_codesite,
        responsable: item.d_responsable,
        codedept: item.d_codedept,
        libelle: item.d_libelle,
        email: item.d_email,
        telephone: item.d_telephone,
        adresse: item.d_adresse,
        createdat: item.d_createdat,
        createdby: item.d_createdby,
        updatedat: item.d_updatedat,
        updatedby: item.d_updatedby,
      },

      nature: {
        idnature: item.n_idnature,
        codenature: item.n_codenature,
        idsociete: item.n_idsociete,
        codesociete: item.n_codesociete,
        idcompte: item.n_idcompte,
        numcompte: item.n_numcompte,
        libelle: item.n_libelle,
        avanceAjustifier: item.n_avanceAjustifier,
        imputationTiers: item.n_imputationTiers,
        actif: item.n_actif,
        demandeDecaissement: item.n_demandeDecaissement,
        createdat: item.n_createdat,
        createdby: item.n_createdby,
        updatedat: item.n_updatedat,
        updatedby: item.n_updatedby,
      },
    }))

    return recordset
  } catch (error) {
    console.error('Erreur lors de la récupération des lignes :', error)
    throw error
  }
}

// Modification d'une ligne budgétaire
async function update_ligne_budgetaire(id, data) {
  const ligne_budgetaire = await get_ligne_budgetaire_by_id(id)
  if (ligne_budgetaire.length === 0) {
    throw new Error('Ligne budgetaire non trouvée.')
  }

  if (!data.updatedby) {
    throw new Error('Le champ updatedby est requis pour la mise à jour.')
  }

  try {
    const fields = []
    const request = (await db.poolPromise).request()

    // On ajoute les champs présents dans data à la requête
    if (data.idbudget !== undefined) {
      fields.push('idbudget = @idbudget')
      request.input('idbudget', db.sql.UniqueIdentifier, data.idbudget)
    }

    if (data.iddepartement !== undefined) {
      fields.push('iddepartement = @iddepartement')
      request.input(
        'iddepartement',
        db.sql.UniqueIdentifier,
        data.iddepartement
      )
    }

    if (data.idnature !== undefined) {
      fields.push('idnature = @idnature')
      request.input('idnature', db.sql.UniqueIdentifier, data.idnature)
    }

    if (data.montantprevisiondept !== undefined) {
      fields.push('montantprevisiondept = @montantprevisiondept')
      request.input(
        'montantprevisiondept',
        db.sql.Decimal,
        data.montantprevisiondept
      )
    }

    if (data.montantprevisionsite !== undefined) {
      fields.push('montantprevisionsite = @montantprevisionsite')
      request.input(
        'montantprevisionsite',
        db.sql.Decimal,
        data.montantprevisionsite
      )
    }

    if (data.montantprevisionsociete !== undefined) {
      fields.push('montantprevisionsociete = @montantprevisionsociete')
      request.input(
        'montantprevisionsociete',
        db.sql.Decimal,
        data.montantprevisionsociete
      )
    }

    if (data.totalconsocloture !== undefined) {
      fields.push('totalconsocloture = @totalconsocloture')
      request.input('totalconsocloture', db.sql.Decimal, data.totalconsocloture)
    }

    if (data.soldecloture !== undefined) {
      fields.push('soldecloture = @soldecloture')
      request.input('soldecloture', db.sql.Decimal, data.soldecloture)
    }

    if (data.updatedby !== undefined) {
      fields.push('updatedby = @updatedby')
      request.input('updatedby', db.sql.NVarChar, data.updatedby)
    }

    // Toujours mettre à jour la date
    fields.push('updatedat = @updatedat')
    request.input('updatedat', db.sql.DateTime, new Date())

    // Si aucun champ n'est transmis → on ne fait rien
    if (fields.length === 0) {
      throw new Error('Aucun champ à mettre à jour')
    }

    // Construction dynamique de la requête
    const query = `
      UPDATE BudgetDepartementNature
      SET ${fields.join(', ')}
      WHERE id = @id
    `

    request.input('id', db.sql.UniqueIdentifier, id)

    await request.query(query)
  } catch (error) {
    console.error(
      'Erreur lors de la mise à jour de la ligne budgétaire:',
      error
    )
    throw error
  }
}

// Suppression d'un budget
async function delete_ligne_budgetaire(id) {
  try {
    const deleteQuery = `
      DELETE FROM BudgetDepartementNature
      WHERE id=@id
    `
    const budget = await get_ligne_budgetaire_by_id(id)
    if (budget.length === 0) {
      throw new Error('Ligne budgétaire non trouvée.')
    }

    const pool = await db.poolPromise
    await pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .query(deleteQuery)
  } catch (error) {
    console.error(
      'Erreur lors de la suppression de la ligne budgétaire:',
      error
    )
    throw error
  }
}

// Dupliquer une ligne budgetaire
async function duplicate_ligne_budgetaire(id, createdby) {
  try {
    const ligne_budgetaire = await get_ligne_budgetaire_by_id(id)

    if (ligne_budgetaire.length === 0) {
      throw new Error('Ligne budgétaire non trouvée.')
    }

    if (createdby === undefined) {
      throw new Error('Le champ createdby est requis.')
    }

    const newLigneBudgetData = {
      idbudget: ligne_budgetaire[0].idbudget,
      codebudget: ligne_budgetaire[0].codebudget,
      iddepartement: ligne_budgetaire[0].iddepartement,
      codedept: ligne_budgetaire[0].codedept,
      idnature: ligne_budgetaire[0].idnature,
      codenature: ligne_budgetaire[0].codenature,
      montantprevisiondept: ligne_budgetaire[0].montantprevisiondept,
      montantprevisionsite: ligne_budgetaire[0].montantprevisionsite,
      montantprevisionsociete: ligne_budgetaire[0].montantprevisionsociete,
      totalconsocloture: ligne_budgetaire[0].totalconsocloture,
      soldecloture: ligne_budgetaire[0].soldecloture,
      createdat: new Date(),
      createdby: createdby,
      updatedat: null,
      updatedby: null,
    }

    const newLigneBudgetaire = await create_lignebudget(newLigneBudgetData)
    return newLigneBudgetaire
  } catch (error) {
    console.error(
      'Erreur lors de la duplication de la ligne budgétaire:',
      error
    )
    throw error
  }
}

module.exports = {
  create_lignebudget,
  get_all_lignes_budgetaires,
  get_ligne_budgetaire_by_id,
  update_ligne_budgetaire,
  delete_ligne_budgetaire,
  duplicate_ligne_budgetaire,
}

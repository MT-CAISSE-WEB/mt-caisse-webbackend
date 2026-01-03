const Budget = require('../models/budget.model')
const { v4: uuidv4 } = require('uuid')
const sql = require('mssql')
const db = require('../../../config/db')
const config = db.config

// let budgets = []

// Création de la banque
async function create_budget(data) {
  if (
    !data.code ||
    !data.typebudget ||
    !data.datedebut ||
    !data.datefin ||
    data.actif === undefined ||
    !data.codecircuit ||
    !data.dernierniveau ||
    !data.niveauactuel ||
    !data.idsite ||
    !data.idsociete ||
    !data.createdby
  ) {
    throw new Error(
      'Tous les champs (code, typebudget, datedebut, datefin, actif, codecircuit, dernierniveau, niveauactuel, idsite, idsociete, createdby) sont requis.'
    )
  }

  if (data.typebudget === 'Mensuel' && !data.idbudgetparent) {
    throw new Error('Le budget parent est obligatoire')
  }

  const db = await sql.connect({ ...config, database: 'MTCAISSEWEB' })

  try {
    const now = new Date()
    const id = uuidv4()

    // 🟦 1. Récupération automatique de la société
    const societeResult = await db
      .request()
      .input('id', sql.UniqueIdentifier, data.idsociete)
      .query('SELECT * FROM Societe WHERE idsociete = @id')

    if (societeResult.recordset.length === 0) {
      throw new Error("La société spécifiée n'existe pas.")
    }

    const societe = societeResult.recordset[0]

    // 🟦 2. Récupération automatique du site
    const siteResult = await db
      .request()
      .input('id', sql.UniqueIdentifier, data.idsite)
      .query('SELECT * FROM Sites WHERE idsite = @id')

    if (siteResult.recordset.length === 0) {
      throw new Error("Le site spécifié n'existe pas.")
    }

    const site = siteResult.recordset[0]

    // 🟦 3. Récupération du budget parent (si fourni)
    let budgetParent = null

    if (data.idbudgetparent) {
      const parentResult = await db
        .request()
        .input('id', sql.UniqueIdentifier, data.idbudgetparent)
        .query('SELECT * FROM Budget WHERE idbudget = @id')

      if (parentResult.recordset.length === 0) {
        throw new Error("Le budget parent fourni n'existe pas.")
      }

      budgetParent = parentResult.recordset[0]
    }

    // 🟦 4. Insertion du budget
    const insertQuery = `
      INSERT INTO Budget (
        idbudget, code, idbudgetparent, typebudget, datedebut, datefin, actif,
        cloture, valide, codecircuit, dernierniveau, niveauactuel, validedept,
        datevalidedept, validesite, datevalidesite, validesociete, datevalidesociete,
        idsite, idsociete, codesociete, codesite, createdat, createdby, updatedat, updatedby
      )
      OUTPUT inserted.*
      VALUES (
        @idbudget, @code, @idbudgetparent, @typebudget, @datedebut, @datefin, @actif,
        @cloture, @valide, @codecircuit, @dernierniveau, @niveauactuel, @validedept,
        @datevalidedept, @validesite, @datevalidesite, @validesociete, @datevalidesociete,
        @idsite, @idsociete, @codesociete, @codesite, @createdat, @createdby, @updatedat, @updatedby
      )
    `

    const insertResult = await db
      .request()
      .input('idbudget', sql.UniqueIdentifier, id)
      .input('code', sql.NVarChar, data.code)
      .input(
        'idbudgetparent',
        sql.UniqueIdentifier,
        data.idbudgetparent || null
      )
      .input('typebudget', sql.NVarChar, data.typebudget)
      .input('datedebut', sql.DateTime, data.datedebut)
      .input('datefin', sql.DateTime, data.datefin)
      .input('actif', sql.Int, data.actif)
      .input('cloture', sql.Int, data.cloture || null)
      .input('valide', sql.Int, data.valide || null)
      .input('codecircuit', sql.UniqueIdentifier, data.codecircuit)
      .input('dernierniveau', sql.NVarChar, data.dernierniveau)
      .input('niveauactuel', sql.NVarChar, data.niveauactuel)
      .input('validedept', sql.NVarChar, data.validedept || null)
      .input('datevalidedept', sql.DateTime, data.datevalidedept || null)
      .input('validesite', sql.NVarChar, data.validesite || null)
      .input('datevalidesite', sql.DateTime, data.datevalidesite || null)
      .input('validesociete', sql.NVarChar, data.validesociete || null)
      .input('datevalidesociete', sql.DateTime, data.datevalidesociete || null)
      .input('idsite', sql.UniqueIdentifier, data.idsite)
      .input('idsociete', sql.UniqueIdentifier, data.idsociete)

      // Champs dérivés automatiques👇
      .input('codesociete', sql.NVarChar, societe.codesociete)
      .input('codesite', sql.NVarChar, site.codesite)

      .input('createdat', sql.DateTime, now)
      .input('createdby', sql.NVarChar, data.createdby)
      .input('updatedat', sql.DateTime, data.updatedat || null)
      .input('updatedby', sql.NVarChar, data.updatedby || null)
      .query(insertQuery)

    const insertedBudget = insertResult.recordset[0]

    // 🟦 5. Construction de l'objet complet retourné
    return {
      ...insertedBudget,
      societe,
      site,
      budgetParent,
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création du budget:', error)
    throw error
  } finally {
    await sql.close()
  }
}

// Obtenir tous les budgets
async function get_all_budgets() {
  try {
    const pool = await db.poolPromise

    const SQL_QUERY_COMPLETE = `
    SELECT b.*,

    s.idsociete         AS soc_idsociete,
    s.codesociete       AS soc_codesociete,
    s.iddevisereference AS soc_iddevisereference,
    s.codedevisereference AS soc_codedevisereference,
    s.iddevisereporting AS soc_iddevisereporting,
    s.codedevisereporting AS soc_codedevisereporting,
    s.raisonsociale     AS soc_raisonsociale,
    s.sigle             AS soc_sigle,
    s.rccm              AS soc_rccm,
    s.numNUI            AS soc_numNUI,
    s.email             AS soc_email,
    s.telephone         AS soc_telephone,
    s.logo              AS soc_logo,
    s.adresse           AS soc_adresse,
    s.suivibudgetaire   AS soc_suivibudgetaire,
    s.createdat         AS soc_createdat,
    s.createdby         AS soc_createdby,
    s.updatedat         AS soc_updatedat,
    s.updatedby         AS soc_updatedby,

    si.idsite             AS site_idsite,
    si.idsociete          AS site_idsociete,
    si.codesociete        AS site_codesociete,
    si.idcentreanalytique AS site_idcentreanalytique,
    si.codeanalytique     AS site_codeanalytique,
    si.codesite           AS site_codesite,
    si.libelle            AS site_libelle,
    si.email              AS site_email,
    si.telephone          AS site_telephone,
    si.adresse            AS site_adresse,
    si.estcentreanalytique AS site_estcentreanalytique,
    si.createdat          AS site_createdat,
    si.createdby          AS site_createdby,
    si.updatedat          AS site_updatedat,
    si.updatedby          AS site_updatedby,

    bp.idbudget        AS bp_idbudget,
    bp.code            AS bp_code,
    bp.typebudget      AS bp_typebudget,
    bp.datedebut       AS bp_datedebut,
    bp.datefin         AS bp_datefin,
    bp.actif           AS bp_actif,
    bp.cloture         AS bp_cloture,
    bp.valide          AS bp_valide,
    bp.codecircuit     AS bp_codecircuit,
    bp.dernierniveau   AS bp_dernierniveau,
    bp.niveauactuel    AS bp_niveauactuel,
    bp.validedept      AS bp_validedept,
    bp.datevalidedept  AS bp_datevalidedept,
    bp.validesite      AS bp_validesite,
    bp.datevalidesite  AS bp_datevalidesite,
    bp.validesociete   AS bp_validesociete,
    bp.datevalidesociete AS bp_datevalidesociete,
    bp.idsite          AS bp_idsite,
    bp.idsociete       AS bp_idsociete,
    bp.codesociete     AS bp_codesociete,
    bp.codesite        AS bp_codesite,
    bp.createdat       AS bp_createdat,
    bp.createdby       AS bp_createdby,
    bp.updatedat       AS bp_updatedat,
    bp.updatedby       AS bp_updatedby

FROM Budget b
LEFT JOIN Societe s ON s.idsociete = b.idsociete
LEFT JOIN Sites si ON si.idsite = b.idsite
LEFT JOIN Budget bp ON bp.idbudget = b.idbudgetparent
ORDER BY b.createdat DESC;

    `

    const result = await pool.request().query(SQL_QUERY_COMPLETE) // requête ci-dessus

    return result.recordset.map((item) => ({
      // =====================
      // BUDGET
      // =====================
      idbudget: item.idbudget,
      code: item.code,
      idbudgetparent: item.idbudgetparent,
      typebudget: item.typebudget,
      datedebut: item.datedebut,
      datefin: item.datefin,
      actif: item.actif,
      cloture: item.cloture,
      valide: item.valide,
      codecircuit: item.codecircuit,
      dernierniveau: item.dernierniveau,
      niveauactuel: item.niveauactuel,
      validedept: item.validedept,
      datevalidedept: item.datevalidedept,
      validesite: item.validesite,
      datevalidesite: item.datevalidesite,
      validesociete: item.validesociete,
      datevalidesociete: item.datevalidesociete,
      idsite: item.idsite,
      idsociete: item.idsociete,
      codesociete: item.codesociete,
      codesite: item.codesite,
      createdat: item.createdat,
      createdby: item.createdby,
      updatedat: item.updatedat,
      updatedby: item.updatedby,

      // =====================
      // SOCIETE (OBJET COMPLET)
      // =====================
      societe: {
        idsociete: item.soc_idsociete,
        codesociete: item.soc_codesociete,
        iddevisereference: item.soc_iddevisereference,
        codedevisereference: item.soc_codedevisereference,
        iddevisereporting: item.soc_iddevisereporting,
        codedevisereporting: item.soc_codedevisereporting,
        raisonsociale: item.soc_raisonsociale,
        sigle: item.soc_sigle,
        rccm: item.soc_rccm,
        numNUI: item.soc_numNUI,
        email: item.soc_email,
        telephone: item.soc_telephone,
        logo: item.soc_logo,
        adresse: item.soc_adresse,
        suivibudgetaire: item.soc_suivibudgetaire,
        createdat: item.soc_createdat,
        createdby: item.soc_createdby,
        updatedat: item.soc_updatedat,
        updatedby: item.soc_updatedby,
      },

      // =====================
      // SITE (OBJET COMPLET)
      // =====================
      site: {
        idsite: item.site_idsite,
        idsociete: item.site_idsociete,
        codesociete: item.site_codesociete,
        idcentreanalytique: item.site_idcentreanalytique,
        codeanalytique: item.site_codeanalytique,
        codesite: item.site_codesite,
        libelle: item.site_libelle,
        email: item.site_email,
        telephone: item.site_telephone,
        adresse: item.site_adresse,
        estcentreanalytique: item.site_estcentreanalytique,
        createdat: item.site_createdat,
        createdby: item.site_createdby,
        updatedat: item.site_updatedat,
        updatedby: item.site_updatedby,
      },

      // =====================
      // BUDGET PARENT COMPLET
      // =====================
      budget_parent: item.bp_idbudget
        ? {
            idbudget: item.bp_idbudget,
            code: item.bp_code,
            typebudget: item.bp_typebudget,
            datedebut: item.bp_datedebut,
            datefin: item.bp_datefin,
            actif: item.bp_actif,
            cloture: item.bp_cloture,
            valide: item.bp_valide,
            codecircuit: item.bp_codecircuit,
            dernierniveau: item.bp_dernierniveau,
            niveauactuel: item.bp_niveauactuel,
            validedept: item.bp_validedept,
            datevalidedept: item.bp_datevalidedept,
            validesite: item.bp_validesite,
            datevalidesite: item.bp_datevalidesite,
            validesociete: item.bp_validesociete,
            datevalidesociete: item.bp_datevalidesociete,
            idsite: item.bp_idsite,
            idsociete: item.bp_idsociete,
            codesociete: item.bp_codesociete,
            codesite: item.bp_codesite,
            createdat: item.bp_createdat,
            createdby: item.bp_createdby,
            updatedat: item.bp_updatedat,
            updatedby: item.bp_updatedby,
          }
        : null,
    }))
  } catch (error) {
    console.error('Erreur lors de la récupération des budgets :', error)
    throw error
  }
}

// Obtenir un budget par son id
async function get_budget_by_id(id) {
  try {
    const pool = await db.poolPromise

    const SQL_QUERY_COMPLETE = `
    SELECT b.*,

    s.idsociete         AS soc_idsociete,
    s.codesociete       AS soc_codesociete,
    s.iddevisereference AS soc_iddevisereference,
    s.codedevisereference AS soc_codedevisereference,
    s.iddevisereporting AS soc_iddevisereporting,
    s.codedevisereporting AS soc_codedevisereporting,
    s.raisonsociale     AS soc_raisonsociale,
    s.sigle             AS soc_sigle,
    s.rccm              AS soc_rccm,
    s.numNUI            AS soc_numNUI,
    s.email             AS soc_email,
    s.telephone         AS soc_telephone,
    s.logo              AS soc_logo,
    s.adresse           AS soc_adresse,
    s.suivibudgetaire   AS soc_suivibudgetaire,
    s.createdat         AS soc_createdat,
    s.createdby         AS soc_createdby,
    s.updatedat         AS soc_updatedat,
    s.updatedby         AS soc_updatedby,

    si.idsite             AS site_idsite,
    si.idsociete          AS site_idsociete,
    si.codesociete        AS site_codesociete,
    si.idcentreanalytique AS site_idcentreanalytique,
    si.codeanalytique     AS site_codeanalytique,
    si.codesite           AS site_codesite,
    si.libelle            AS site_libelle,
    si.email              AS site_email,
    si.telephone          AS site_telephone,
    si.adresse            AS site_adresse,
    si.estcentreanalytique AS site_estcentreanalytique,
    si.createdat          AS site_createdat,
    si.createdby          AS site_createdby,
    si.updatedat          AS site_updatedat,
    si.updatedby          AS site_updatedby,

    bp.idbudget        AS bp_idbudget,
    bp.code            AS bp_code,
    bp.typebudget      AS bp_typebudget,
    bp.datedebut       AS bp_datedebut,
    bp.datefin         AS bp_datefin,
    bp.actif           AS bp_actif,
    bp.cloture         AS bp_cloture,
    bp.valide          AS bp_valide,
    bp.codecircuit     AS bp_codecircuit,
    bp.dernierniveau   AS bp_dernierniveau,
    bp.niveauactuel    AS bp_niveauactuel,
    bp.validedept      AS bp_validedept,
    bp.datevalidedept  AS bp_datevalidedept,
    bp.validesite      AS bp_validesite,
    bp.datevalidesite  AS bp_datevalidesite,
    bp.validesociete   AS bp_validesociete,
    bp.datevalidesociete AS bp_datevalidesociete,
    bp.idsite          AS bp_idsite,
    bp.idsociete       AS bp_idsociete,
    bp.codesociete     AS bp_codesociete,
    bp.codesite        AS bp_codesite,
    bp.createdat       AS bp_createdat,
    bp.createdby       AS bp_createdby,
    bp.updatedat       AS bp_updatedat,
    bp.updatedby       AS bp_updatedby

FROM Budget b
LEFT JOIN Societe s ON s.idsociete = b.idsociete
LEFT JOIN Sites si ON si.idsite = b.idsite
LEFT JOIN Budget bp ON bp.idbudget = b.idbudgetparent
WHERE b.idbudget = @id
ORDER BY b.createdat DESC;

    `

    const result = await pool
      .request()
      .input('id', sql.UniqueIdentifier, id)
      .query(SQL_QUERY_COMPLETE)

    return result.recordset.map((item) => ({
      // =====================
      // BUDGET
      // =====================
      idbudget: item.idbudget,
      code: item.code,
      idbudgetparent: item.idbudgetparent,
      typebudget: item.typebudget,
      datedebut: item.datedebut,
      datefin: item.datefin,
      actif: item.actif,
      cloture: item.cloture,
      valide: item.valide,
      codecircuit: item.codecircuit,
      dernierniveau: item.dernierniveau,
      niveauactuel: item.niveauactuel,
      validedept: item.validedept,
      datevalidedept: item.datevalidedept,
      validesite: item.validesite,
      datevalidesite: item.datevalidesite,
      validesociete: item.validesociete,
      datevalidesociete: item.datevalidesociete,
      idsite: item.idsite,
      idsociete: item.idsociete,
      codesociete: item.codesociete,
      codesite: item.codesite,
      createdat: item.createdat,
      createdby: item.createdby,
      updatedat: item.updatedat,
      updatedby: item.updatedby,

      // =====================
      // SOCIETE (OBJET COMPLET)
      // =====================
      societe: {
        idsociete: item.soc_idsociete,
        codesociete: item.soc_codesociete,
        iddevisereference: item.soc_iddevisereference,
        codedevisereference: item.soc_codedevisereference,
        iddevisereporting: item.soc_iddevisereporting,
        codedevisereporting: item.soc_codedevisereporting,
        raisonsociale: item.soc_raisonsociale,
        sigle: item.soc_sigle,
        rccm: item.soc_rccm,
        numNUI: item.soc_numNUI,
        email: item.soc_email,
        telephone: item.soc_telephone,
        logo: item.soc_logo,
        adresse: item.soc_adresse,
        suivibudgetaire: item.soc_suivibudgetaire,
        createdat: item.soc_createdat,
        createdby: item.soc_createdby,
        updatedat: item.soc_updatedat,
        updatedby: item.soc_updatedby,
      },

      // =====================
      // SITE (OBJET COMPLET)
      // =====================
      site: {
        idsite: item.site_idsite,
        idsociete: item.site_idsociete,
        codesociete: item.site_codesociete,
        idcentreanalytique: item.site_idcentreanalytique,
        codeanalytique: item.site_codeanalytique,
        codesite: item.site_codesite,
        libelle: item.site_libelle,
        email: item.site_email,
        telephone: item.site_telephone,
        adresse: item.site_adresse,
        estcentreanalytique: item.site_estcentreanalytique,
        createdat: item.site_createdat,
        createdby: item.site_createdby,
        updatedat: item.site_updatedat,
        updatedby: item.site_updatedby,
      },

      // =====================
      // BUDGET PARENT COMPLET
      // =====================
      budget_parent: item.bp_idbudget
        ? {
            idbudget: item.bp_idbudget,
            code: item.bp_code,
            typebudget: item.bp_typebudget,
            datedebut: item.bp_datedebut,
            datefin: item.bp_datefin,
            actif: item.bp_actif,
            cloture: item.bp_cloture,
            valide: item.bp_valide,
            codecircuit: item.bp_codecircuit,
            dernierniveau: item.bp_dernierniveau,
            niveauactuel: item.bp_niveauactuel,
            validedept: item.bp_validedept,
            datevalidedept: item.bp_datevalidedept,
            validesite: item.bp_validesite,
            datevalidesite: item.bp_datevalidesite,
            validesociete: item.bp_validesociete,
            datevalidesociete: item.bp_datevalidesociete,
            idsite: item.bp_idsite,
            idsociete: item.bp_idsociete,
            codesociete: item.bp_codesociete,
            codesite: item.bp_codesite,
            createdat: item.bp_createdat,
            createdby: item.bp_createdby,
            updatedat: item.bp_updatedat,
            updatedby: item.bp_updatedby,
          }
        : null,
    }))
  } catch (error) {
    console.error('Erreur lors de la récupération des budgets :', error)
    throw error
  }
}

// Modification d'un budget
async function update_budget(id, data) {
  const budget = await get_budget_by_id(id)
  if (budget.length === 0) {
    throw new Error('Budget non trouvé.')
  }

  if (!data.updatedby) {
    throw new Error('Le champ updatedby est requis pour la mise à jour.')
  }

  if (data.idbudgetparent !== undefined && budget[0].typebudget !== 'Mensuel') {
    throw new Error(
      `Le champ typebudget défini comme: ${budget[0].typebudget}, donc ne peut pas avoir un budget parent.`
    )
  }

  if (data.typebudget === 'Mensuel' && !data.idbudgetparent) {
    throw new Error('Le champ idbudgetparent est requis pour la mise à jour.')
  }

  try {
    const fields = []
    const request = (await db.poolPromise).request()

    // On ajoute les champs présents dans data à la requête
    if (data.code !== undefined) {
      fields.push('code = @code')
      request.input('code', db.sql.NVarChar, data.code)
    }

    if (data.typebudget !== undefined) {
      fields.push('typebudget = @typebudget')
      request.input('typebudget', db.sql.NVarChar, data.typebudget)
    }

    if (data.idbudgetparent !== undefined) {
      fields.push('idbudgetparent = @idbudgetparent')
      request.input(
        'idbudgetparent',
        db.sql.UniqueIdentifier,
        data.idbudgetparent
      )
    }

    if (data.datedebut !== undefined) {
      fields.push('datedebut = @datedebut')
      request.input('datedebut', db.sql.DateTime, data.datedebut)
    }

    if (data.datefin !== undefined) {
      fields.push('datefin = @datefin')
      request.input('datefin', db.sql.DateTime, data.datefin)
    }

    if (data.actif !== undefined) {
      fields.push('actif = @actif')
      request.input('actif', db.sql.Int, data.actif)
    }

    if (data.cloture !== undefined) {
      fields.push('cloture = @cloture')
      request.input('cloture', db.sql.Int, data.cloture)
    }

    if (data.valide !== undefined) {
      fields.push('valide = @valide')
      request.input('valide', db.sql.Int, data.valide)
    }

    if (data.codecircuit !== undefined) {
      fields.push('codecircuit = @codecircuit')
      request.input('codecircuit', db.sql.NVarChar, data.codecircuit)
    }

    if (data.dernierniveau !== undefined) {
      fields.push('dernierniveau = @dernierniveau')
      request.input('dernierniveau', db.sql.NVarChar, data.dernierniveau)
    }

    if (data.niveauactuel !== undefined) {
      fields.push('niveauactuel = @niveauactuel')
      request.input('niveauactuel', db.sql.NVarChar, data.niveauactuel)
    }

    if (data.validedept !== undefined) {
      fields.push('validedept = @validedept')
      request.input('validedept', db.sql.NVarChar, data.validedept)
    }

    if (data.datevalidedept !== undefined) {
      fields.push('datevalidedept = @datevalidedept')
      request.input('datevalidedept', db.sql.DateTime, data.datevalidedept)
    }

    if (data.validesite !== undefined) {
      fields.push('validesite = @validesite')
      request.input('validesite', db.sql.NVarChar, data.validesite)
    }

    if (data.datevalidesite !== undefined) {
      fields.push('datevalidesite = @datevalidesite')
      request.input('datevalidesite', db.sql.DateTime, data.datevalidesite)
    }

    if (data.validesociete !== undefined) {
      fields.push('validesociete = @validesociete')
      request.input('validesociete', db.sql.NVarChar, data.validesociete)
    }

    if (data.datevalidesociete !== undefined) {
      fields.push('datevalidesociete = @datevalidesociete')
      request.input(
        'datevalidesociete',
        db.sql.DateTime,
        data.datevalidesociete
      )
    }

    if (data.idsite !== undefined) {
      fields.push('idsite = @idsite')
      request.input('idsite', db.sql.UniqueIdentifier, data.idsite)
    }

    if (data.idsociete !== undefined) {
      fields.push('idsociete = @idsociete')
      request.input('idsociete', db.sql.UniqueIdentifier, data.idsociete)
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
      UPDATE Budget
      SET ${fields.join(', ')}
      WHERE idbudget = @id
    `

    request.input('id', db.sql.UniqueIdentifier, id)

    await request.query(query)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du budget:', error)
    throw error
  }
}

// Suppression d'un budget
async function delete_budget(id) {
  try {
    const deleteQuery = `
      DELETE FROM Budget
      WHERE idbudget=@idbudget
    `
    const budget = await get_budget_by_id(id)
    if (budget.length === 0) {
      throw new Error('Budget non trouvé.')
    }

    const pool = await db.poolPromise
    await pool
      .request()
      .input('idbudget', sql.UniqueIdentifier, id)
      .query(deleteQuery)
  } catch (error) {
    console.error('Erreur lors de la suppression du budget:', error)
    throw error
  }
}

// Dupliquer un budget
async function duplicate_budget(id, code, createdby) {
  try {
    const budget = await get_budget_by_id(id)
    if (budget.length === 0) {
      throw new Error('Budget non trouvé.')
    }

    if (code === undefined || createdby === undefined) {
      throw new Error('Tous les champs (code, createdby) sont requis.')
    }

    const newBudgetData = {
      code: code,
      idbudgetparent: budget[0].idbudgetparent,
      typebudget: budget[0].typebudget,
      datedebut: budget[0].datedebut,
      datefin: budget[0].datefin,
      actif: budget[0].actif,
      cloture: budget[0].cloture,
      valide: budget[0].valide,
      codecircuit: budget[0].codecircuit,
      dernierniveau: budget[0].dernierniveau,
      niveauactuel: budget[0].niveauactuel,
      validedept: budget[0].validedept,
      datevalidedept: budget[0].datevalidedept,
      validesite: budget[0].validesite,
      datevalidesite: budget[0].datevalidesite,
      validesociete: budget[0].validesociete,
      datevalidesociete: budget[0].datevalidesociete,
      idsite: budget[0].idsite,
      idsociete: budget[0].idsociete,
      codesociete: budget[0].codesociete,
      codesite: budget[0].codesite,
      createdat: new Date(),
      createdby: createdby,
      updatedat: null,
      updatedby: null,
    }
    const newBudget = await create_budget(newBudgetData)
    return newBudget
  } catch (error) {
    console.error('Erreur lors de la duplication du budget:', error)
    throw error
  }
}

module.exports = {
  create_budget,
  get_all_budgets,
  get_budget_by_id,
  update_budget,
  delete_budget,
  duplicate_budget,
}

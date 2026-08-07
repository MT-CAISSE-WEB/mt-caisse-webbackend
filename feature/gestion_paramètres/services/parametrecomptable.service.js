const ParametreComptableModel = require("../models/parametrecomptable.model");
const { v4: uuidv4 } = require("uuid");
let parametremodel = new ParametreComptableModel();
const PaginationModel = require("../../../shared/utils/model");

async function save(data) {
  if (!data.value || !data.societe) {
    throw new Error("Tous les champs (valeur, societe) sont requis.");
  }

  const recorded = await parametremodel.save(data);
  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }

  return recorded.data;
}

async function getall(data) {
  if (!data.societe) {
    throw new Error("Société de utilisateur inexistante dans la base.");
  }

  try {
    const result = await parametremodel.get_parametrecomptable_bysociete(
      data.societe,
    );

    // Transformation des données
    const parametres = result.map((row) => ({
      societe: {
        id: row.idsociete,
        code: row.codesociete,
        raisonSociale: row.raisonsociale,
      },
      journal: row.idjournal
        ? {
            id: row.idjournal,
            code: row.codejournal,
            designation: row.journal_designation,
          }
        : null,
      compte: row.idcompte
        ? {
            id: row.idcompte,
            numero: row.numcompte,
            libelle: row.compte_libelle,
          }
        : null,
      url: row.urldossier,
      analytiquesite: row.analytiquesite,
      analytiquetable: row.analytiquetable,
      axesecond: row.axesecond,
      libelleaxe1: row.libelleaxe1,
      libelleaxe2: row.libelleaxe2,
    }));

    return parametres;
  } catch (error) {
    console.log(
      "Erreur lors de la récupération des paramètres comptables:",
      error,
    );
    throw new Error(
      "Erreur lors de la récupération des paramètres comptables : " +
        error.message,
    );
  }
}

async function saveAnalytiqueEntiteSite(data) {
  const { societe, entite } = data;
  console.log("data ", data);

  if (!societe) {
    throw new Error("La société est obligatoire.");
  }

  const valeur = entite ? 1 : 0;

  return await parametremodel.updateParametreComptable(
    societe,
    "analytiquesite",
    entite,
  );
}

async function saveAxeSecond(data) {
  const { societe, axesecond } = data;

  if (!societe) {
    throw new Error("La société est obligatoire.");
  }

  return await parametremodel.updateParametreComptable(
    societe,
    "axesecond",
    axesecond,
  );
}

async function saveAnalytiqueTable(data) {
  const { societe, table } = data;

  if (!societe) {
    throw new Error("La société est obligatoire.");
  }

  return await parametremodel.updateParametreComptable(
    societe,
    "analytiquetable",
    table,
  );
}

async function findAllcorrespondance() {
  return await parametremodel.findAllCorrespondance();
}

async function findCorrespondanceById(id) {
  const item = await parametremodel.findById(id);
  if (!item) {
    throw new Error("Correspondance non trouvée");
  }
  return item;
}

async function createCorrespondance(data, userId) {
  // Validation des champs
  if (!data.idcentreanalytique) {
    throw new Error("Le centre analytique est obligatoire.");
  }

  if (!data.correspondance?.trim()) {
    throw new Error("La correspondance est obligatoire.");
  }

  // Vérifier si le couple (centre + correspondance) existe déjà
  const existingExact = await parametremodel.getCorrespondanceByCentreAndCode(
    data.idcentreanalytique,
    data.correspondance.trim(),
  );

  if (existingExact) {
    throw new Error("Ce centre est déjà associé à cette correspondance.");
  }

  // Vérifier si le centre est déjà associé à une autre correspondance
  const correspondanceCentre = await parametremodel.getCorrespondanceByCentre(
    data.idcentreanalytique,
  );

  if (correspondanceCentre) {
    throw new Error(
      "Une correspondance existe déjà pour ce centre analytique.",
    );
  }

  const payload = {
    idcorrespondance: uuidv4(),
    idcentreanalytique: data.idcentreanalytique,
    correspondance: data.correspondance.trim(),
    actif: 1,
  };

  return await parametremodel.createCorrespondance(payload, userId);
}

// services/parametrecomptable.service.js

async function updateCorrespondance(id, data, userId) {
  // 1. Vérifier si la correspondance existe
  const existing = await parametremodel.findById(id);
  if (!existing) {
    throw new Error("Correspondance non trouvée");
  }

  // 2. Vérifier si les données sont fournies
  if (!data.idcentreanalytique && !data.correspondance) {
    throw new Error("Au moins un champ à modifier est requis.");
  }

  // 3. Si on modifie le centre ou la correspondance, vérifier les doublons
  const newCentre = data.idcentreanalytique || existing.idcentreanalytique;
  const newCorrespondance = data.correspondance || existing.correspondance;

  // 3.1 Vérifier si le couple (centre + correspondance) existe déjà (pour un AUTRE enregistrement)
  const existingExact = await parametremodel.getCorrespondanceByCentreAndCode(
    newCentre,
    newCorrespondance.trim(),
  );

  if (existingExact && existingExact.idcorrespondance !== id) {
    throw new Error(
      `Le couple (centre ${newCentre} - correspondance ${newCorrespondance}) existe déjà dans la base.`,
    );
  }

  // 3.2 Si le centre change, vérifier que le nouveau centre n'est pas déjà associé à une autre correspondance
  if (
    data.idcentreanalytique &&
    data.idcentreanalytique !== existing.idcentreanalytique
  ) {
    const existingCentre = await parametremodel.getCorrespondanceByCentre(
      data.idcentreanalytique,
    );

    if (existingCentre && existingCentre.idcorrespondance !== id) {
      throw new Error(
        `Le centre analytique est déjà associé à une autre correspondance: "${existingCentre.correspondance}"`,
      );
    }
  }

  // 3. Procéder à la mise à jour
  return await parametremodel.updateCorrespondance(id, data, userId);
}

async function hardDeleteCorrespondance(id) {
  const existing = await parametremodel.findById(id);
  if (!existing) {
    throw new Error("Correspondance non trouvée");
  }

  return await parametremodel.hardDelete(id);
}

async function saveAxisLabels(data) {
  const { societe, libelleaxe1, libelleaxe2 } = data;

  if (!societe) {
    throw new Error("La société est obligatoire.");
  }

  return await parametremodel.updateParametreAxeComptable(
    societe,
    libelleaxe1,
    libelleaxe2,
  );
}

// services/parametrecomptable.service.js

/**
 * Importer des correspondances depuis un fichier CSV
 */
async function importCorrespondancesFromCsv(
  csvData,
  csvColumns,
  userId,
  societeId,
) {
  const model = new ParametreComptableModel();
  const results = {
    total: csvData.length,
    imported: 0,
    errors: 0,
    details: [],
    resume: {
      centresTrouves: 0,
      centresNonTrouves: 0,
      doublons: 0,
      doublonsExacts: 0, // Nouveau compteur pour les doublons exacts
    },
  };

  // Détection du séparateur
  const separator = detectSeparator(csvData.length > 0 ? csvData[0] : "");

  // Mapping des colonnes
  const indexMap = mapColumns(csvColumns);

  // Traitement ligne par ligne
  for (let i = 0; i < csvData.length; i++) {
    const line = csvData[i];
    if (!line || line.trim() === "") continue;

    try {
      // Parser la ligne
      const values = parseCsvLine(line, separator);
      const rowData = mapValuesToData(values, indexMap);

      // Valider les données de la ligne
      const validation = validateRowData(rowData);
      if (!validation.isValid) {
        results.errors++;
        results.details.push({
          ligne: i + 2,
          codecentreanalytique: rowData.codecentreanalytique || "",
          correspondance: rowData.correspondance || "",
          erreurs: validation.errors,
          statut: "ECHEC",
        });
        continue;
      }

      // RECHERCHER LE CENTRE ANALYTIQUE PAR SON CODE
      const centre = await model.getCentreAnalytiqueByCode(
        rowData.codecentreanalytique.trim(),
        societeId,
      );

      if (!centre) {
        results.errors++;
        results.resume.centresNonTrouves++;
        results.details.push({
          ligne: i + 2,
          codecentreanalytique: rowData.codecentreanalytique,
          correspondance: rowData.correspondance,
          erreurs: [
            `Le centre analytique avec le code "${rowData.codecentreanalytique}" n'existe pas dans la base`,
          ],
          statut: "ECHEC",
        });
        continue;
      }

      results.resume.centresTrouves++;

      // ============================================================
      // VÉRIFICATION DOUBLON EXACT : centre + correspondance
      // ============================================================
      const existingExact = await model.getCorrespondanceByCentreAndCode(
        centre.idcentreanalytique,
        rowData.correspondance.trim(),
      );

      if (existingExact) {
        results.errors++;
        results.resume.doublonsExacts++;
        results.details.push({
          ligne: i + 2,
          codecentreanalytique: rowData.codecentreanalytique,
          correspondance: rowData.correspondance,
          centreTrouve: {
            id: centre.idcentreanalytique,
            code: centre.codecentreanalytique,
            libelle: centre.libelle,
          },
          erreurs: [
            `Le couple (${rowData.codecentreanalytique} - ${rowData.correspondance}) existe déjà dans la base`,
          ],
          statut: "ECHEC",
        });
        continue;
      }

      // ============================================================
      // VÉRIFICATION : centre déjà associé à une AUTRE correspondance
      // ============================================================
      const existingCentre = await model.getCorrespondanceByCentre(
        centre.idcentreanalytique,
      );

      if (existingCentre) {
        results.errors++;
        results.resume.doublons++;
        results.details.push({
          ligne: i + 2,
          codecentreanalytique: rowData.codecentreanalytique,
          correspondance: rowData.correspondance,
          centreTrouve: {
            id: centre.idcentreanalytique,
            code: centre.codecentreanalytique,
            libelle: centre.libelle,
          },
          erreurs: [
            `Le centre "${rowData.codecentreanalytique}" est déjà associé à une autre correspondance: "${existingCentre.correspondance}"`,
          ],
          statut: "ECHEC",
        });
        continue;
      }

      // ============================================================
      // VÉRIFICATION : correspondance déjà utilisée par un AUTRE centre
      // ============================================================
      // const existingCode = await model.getCorrespondanceByCode(
      //   rowData.correspondance.trim(),
      // );

      // if (existingCode) {
      //   results.errors++;
      //   results.resume.doublons++;
      //   results.details.push({
      //     ligne: i + 2,
      //     codecentreanalytique: rowData.codecentreanalytique,
      //     correspondance: rowData.correspondance,
      //     centreTrouve: {
      //       id: centre.idcentreanalytique,
      //       code: centre.codecentreanalytique,
      //       libelle: centre.libelle,
      //     },
      //     erreurs: [
      //       `La correspondance "${rowData.correspondance}" est déjà utilisée par un autre centre`,
      //     ],
      //     statut: "ECHEC",
      //   });
      //   continue;
      // }

      // ============================================================
      // CRÉATION DE LA CORRESPONDANCE
      // ============================================================
      const payload = {
        idcorrespondance: uuidv4(),
        idcentreanalytique: centre.idcentreanalytique,
        correspondance: rowData.correspondance.trim(),
        actif: rowData.actif !== undefined ? rowData.actif : 1,
      };

      await model.createCorrespondance(payload, userId);

      results.imported++;
      results.details.push({
        ligne: i + 2,
        codecentreanalytique: rowData.codecentreanalytique,
        correspondance: rowData.correspondance,
        centreTrouve: {
          id: centre.idcentreanalytique,
          code: centre.codecentreanalytique,
          libelle: centre.libelle,
        },
        statut: "IMPORTE",
      });
    } catch (error) {
      results.errors++;
      results.details.push({
        ligne: i + 2,
        erreurs: [error.message],
        statut: "ECHEC",
      });
      console.error(`Erreur ligne ${i + 2}:`, error);
    }
  }

  return results;
}

/**
 * Détecter le séparateur utilisé dans le CSV
 */
function detectSeparator(firstLine) {
  if (!firstLine) return ",";
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  return semicolonCount > commaCount ? ";" : ",";
}

/**
 * Mapper les colonnes pour faciliter l'accès
 */
function mapColumns(columns) {
  const indexMap = {};
  columns.forEach((col, index) => {
    const key = col.toLowerCase().trim();
    indexMap[key] = index;
  });
  return indexMap;
}

/**
 * Parser une ligne CSV en tenant compte des guillemets
 */
function parseCsvLine(line, separator) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === separator && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values;
}

/**
 * Mapper les valeurs parsées vers un objet structuré
 */
function mapValuesToData(values, indexMap) {
  const data = {};

  const getValue = (key) => {
    const index = indexMap[key];
    return index !== undefined && index < values.length
      ? values[index]
      : undefined;
  };

  data.codecentreanalytique = getValue("codecentreanalytique");
  data.correspondance = getValue("correspondance");

  // Colonnes optionnelles
  const actifValue = getValue("actif");
  if (actifValue !== undefined) {
    data.actif = parseInt(actifValue) || 0;
  }

  return data;
}

/**
 * Valider les données d'une ligne
 */
function validateRowData(rowData) {
  const errors = [];

  if (
    !rowData.codecentreanalytique ||
    rowData.codecentreanalytique.trim() === ""
  ) {
    errors.push("Le code du centre analytique est obligatoire");
  }

  if (!rowData.correspondance || rowData.correspondance.trim() === "") {
    errors.push("La correspondance est obligatoire");
  }

  // Validation du format du code (exemple: max 50 caractères)
  if (
    rowData.codecentreanalytique &&
    rowData.codecentreanalytique.length > 50
  ) {
    errors.push(
      "Le code du centre analytique ne doit pas dépasser 50 caractères",
    );
  }

  // Limites de longueur
  if (rowData.correspondance && rowData.correspondance.length > 255) {
    errors.push("La correspondance ne doit pas dépasser 255 caractères");
  }

  // Validation des caractères spéciaux (optionnel)
  const invalidChars = /[<>{}|\\^~\[\]`;]/;
  if (
    rowData.codecentreanalytique &&
    invalidChars.test(rowData.codecentreanalytique)
  ) {
    errors.push(
      "Le code du centre analytique contient des caractères invalides",
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  save,
  getall,
  hardDeleteCorrespondance,
  updateCorrespondance,
  findAllcorrespondance,
  findCorrespondanceById,
  createCorrespondance,
  saveAnalytiqueEntiteSite,
  saveAnalytiqueTable,
  saveAxeSecond,
  saveAxisLabels,
  importCorrespondancesFromCsv,
};

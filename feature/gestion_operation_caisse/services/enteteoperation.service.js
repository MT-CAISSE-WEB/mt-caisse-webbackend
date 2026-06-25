const societeservice = require("../../gestion_organisation/services/societe.service");
const siteservice = require("../../gestion_organisation/services/site.service");
const deviseservice = require("../../gestion_organisation/services/devise.service");
const enteteoperationmodel = require("../models/enteteoperation.model");
const { v4: uuidv4 } = require("uuid");
const compteurservice = require("../../gestion_paramètres/services/compteur.service");
const { EnteteDemande } = require("../../gestion_pj_demandes/models/index");
const DemandePieceJointe = require("../../gestion_pj_demandes/models/pjdemande.model");
const fs2 = require("fs");

let enteteoperation = new enteteoperationmodel();
let enteteoperations = [];

// pour gestion des pj
const { upload } = require("../../../middlewares/upload/pjoperation");
const path = require("path");
const fs = require("fs").promises;
const sequelize = require("../../../config/database");
const AdmZip = require("adm-zip");

async function get_all_enteteoperations() {
  const result = await enteteoperation.get_allenteteoperations();
  enteteoperations = result.recordset.map(
    (item) =>
      new enteteoperationmodel(
        item.idoperation,
        item.codeoperation,
        item.iddemande,
        item.codedemande,
        item.idsociete,
        item.codesociete,
        item.dateoperation,
        item.createdat,
        item.createdby,
        item.updatedat,
        item.updatedby,
      ),
  );
  return enteteoperations;
}

async function create_enteteoperation(data) {
  if (!data.dateoperation) {
    throw new Error("Tous les champs (dateoperation) est requis.");
  }

  //Récuperer le site sur l'utilisateur connecté
  let site = null;
  if (data.site) {
    site = await siteservice.getonesite(data.site);
  } else {
    throw new Error("Site utilisateur introuvable");
  }

  //Récuperer la devise
  let devise = null;
  if (data.devise) {
    devise = await deviseservice.getonedevise(data.devise);
  }

  const datePeriode = new Date(data.dateoperation);

  const today = new Date();
  if (datePeriode > today) {
    throw new Error(
      "La date operation ne peut pas être supérieure à la date du jour",
    );
  }

  const compteur = await compteurservice.getall();
  // Trouver le compteur "operation"
  const demandeCompteur = compteur.data.find(
    (c) => c.typedocument != "demande",
  );

  // Fonction pour résoudre une séquence
  const resolveSequence = (sequence, prefixe) => {
    switch (sequence) {
      case "site":
        return site.data?.codesite || "";
      case "constante":
        return prefixe || "";
      default:
        return "";
    }
  };

  // Résolution des préfixes
  const prefixe = [
    resolveSequence(demandeCompteur?.sequence_1, demandeCompteur?.prefixe_1),
    resolveSequence(demandeCompteur?.sequence_2, demandeCompteur?.prefixe_2),
  ].join("");

  //Générer le numero d'operation
  //const prefix = "NUM";
  const numerogenere = await enteteoperation.create_numoperation(
    prefixe,
    datePeriode,
  );
  const newenteteoperation = new enteteoperationmodel(
    uuidv4(),
    data.codeoperation || numerogenere,
    data.demande ? data.demande : null,
    data.societe,
    data.site,
    data.devise,
    devise.data.codedevise,
    datePeriode,
    data.montant,
    data.tauxoperation || 1,
    data.typepaiement || null,
    data.beneficiaire || null,
    data.createdat || today,
    data.createdby || "System",
  );
  const recorded = await newenteteoperation.create_enteteoperationmodel(
    newenteteoperation,
  );
  // si le modèle renvoie une erreur
  if (!recorded.success) {
    throw new Error(recorded.message);
  }

  return recorded.data;
}

async function get_by_identeteoperation(identeteoperation) {
  if (!identeteoperation) {
    throw new Error("Erreur de donnée");
  }

  try {
    const enteteoperation_ = await enteteoperation.get_oneenteteoperation(
      identeteoperation,
    );
    return enteteoperation_;
  } catch (err) {
    console.log(`Aucune donnée: ${err}`.cyan.bold);
    throw err;
  }
}

async function update_enteteoperation(identeteoperation, data) {
  if (!data.dateoperation) {
    throw new Error("Erreur de donnée");
  }

  try {
    const enteteoperation_ = await enteteoperation.update_enteteoperation(
      data.codeoperation,
      data,
    );
    return enteteoperation_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
}

async function delete_enteteoperation(identeteoperation) {
  try {
    const enteteoperation_ = await enteteoperation.delete_enteteoperation(
      identeteoperation,
    );
    if (!enteteoperation_.success) {
      throw new Error(enteteoperation_.message);
    }
    return enteteoperation_;
  } catch (err) {
    throw err;
  }
}

async function cancel_enteteoperation(data) {
  const today = new Date();

  try {
    if (!data?.idoperation) {
      throw new Error("Opération invalide.");
    }

    if (!Array.isArray(data.caisses) || data.caisses.length === 0) {
      throw new Error("Aucune caisse fournie.");
    }

    if (!Array.isArray(data.lignes) || data.lignes.length === 0) {
      throw new Error("Aucune ligne d'opération fournie.");
    }

    /* ======================================================
       1. Déterminer le type inverse
    ====================================================== */
    let nouveauTypePaiement = null;

    switch ((data.caisses[0]?.codtypeoperation || "").toLowerCase()) {
      case "encaissement":
        nouveauTypePaiement = "decaissement";
        break;

      case "decaissement":
      case "decaissementaj":
        nouveauTypePaiement = "encaissement";
        break;

      default:
        throw new Error("Type de paiement non reconnu.");
    }

    /* ======================================================
       2. Création de l'entête inverse
    ====================================================== */
    const newEnteteData = {
      codeoperation: null, // nouveau compteur
      demande: data.demande || null,
      societe: data.idsociete,
      site: data.idsite,
      devise: data.iddevise,
      dateoperation: new Date(),
      montant: data.montant,
      tauxoperation: data.tauxoperation,
      createdby: data.createdby || "SYSTEM",

      // traçabilité
      idoperationorigine: data.idoperation,
      libelleannulation: `Annulation - ${data.codeoperation}`,
    };

    const enteteoperation = await create_enteteoperation(newEnteteData);

    if (!enteteoperation?.idoperation) {
      throw new Error("Échec de création de l'opération d'annulation.");
    }

    /* ======================================================
       3. Duplication des lignes
    ====================================================== */
    for (const ligne of data.lignes) {
      const dataligne = {
        idoperation: enteteoperation.idoperation,
        idnature: ligne.nature?.idnature || null,
        idcentre: ligne.centre?.idcentre || null,
        idtiers: ligne.tiers?.idtiers || null,
        libelle: `Annulation - ${ligne.libelle}`,
        montantoperation: Number(ligne.montantoperation),
        createdby: data.createdby || "SYSTEM",
      };

      await ligneoperationservice.create_ligneoperation(dataligne);
    }

    /* ======================================================
       4. Création type opération inverse
    ====================================================== */
    for (const caisse of data.caisses) {
      if (caisse.montant && Number(caisse.montant) !== 0) {
        const caisse1 = await caisseservice.get_by_idcaisse(caisse.idcaisse);

        const newtypeoperation = new typeoperationmodel(
          uuidv4(),
          nouveauTypePaiement,
          enteteoperation.idoperation,
          caisse.idperiode || null,
          data.idsociete,
          data.idsite,
          caisse1?.idcaisse || null,
          Number(caisse.montant),
          caisse.taux,
          caisse.montantref,
          today,
          data.createdby || "SYSTEM",
          null,
          null,
        );

        const recorded = await newtypeoperation.create_typeoperationmodel(
          newtypeoperation,
        );

        if (!recorded.success) {
          throw new Error(recorded.message);
        }
      }
    }

    /* ======================================================
       5. Génération écriture comptable
    ====================================================== */
    await ecritureservice.GenererEcriture(enteteoperation.idoperation);

    /* ======================================================
       6. Marquer l'opération source annulée
       (optionnel mais recommandé)
    ====================================================== */
    await update_status(data.idoperation, {
      annulee: 1,
      updatedat: today,
      updatedby: data.createdby || "SYSTEM",
    });

    return enteteoperation;
  } catch (err) {
    throw err;
  }
}

async function update_status(identeteoperation, data) {
  if (!identeteoperation) {
    throw new Error("Erreur de donnée");
  }

  try {
    const enteteoperation_ = await enteteoperation.update_status(
      identeteoperation,
      data,
    );
    return enteteoperation_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
}

async function update_operationorigine(identeteoperation, data) {
  if (!data.idoperationorigine) {
    throw new Error("Erreur de donnée");
  }

  try {
    const enteteoperation_ = await enteteoperation.update_operationorigine(
      identeteoperation,
      data,
    );
    return enteteoperation_.recordset;
  } catch (err) {
    console.log(`Erreur de modification: ${err}`.cyan.bold);
    throw err;
  }
}

const {
  PieceJointe,
  OperationPieceJointe,
  EnteteOperationCaisse,
} = require("../../gestion_pj_demandes/models/operations/index");

/**
 * Upload de fichiers pour une demande
 * @param {string} idoperation - ID de l'opération
 * @param {Array} files - Fichiers uploadés (multer)
 * @param {string} userId - ID de l'utilisateur qui upload
 * @returns {Promise<Array>} - Liste des pièces jointes créées
 */
async function uploadFiles(idoperation, files, userId) {
  // 1. Vérifier que l'opération existe
  const operation = await get_by_identeteoperation(idoperation);
  if (!operation) {
    throw new Error("Opération introuvable");
  }

  const results = [];
  const transaction = await sequelize.transaction();

  try {
    for (const file of files) {
      // 2. Chemin relatif pour stockage en base
      const relativePath = path
        .join("uploads/operations", file.filename)
        .replace(/\\/g, "/");

      try {
        // Utiliser fs.unlink au lieu de fs.unlink
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.error(
          `Erreur nettoyage fichier ${file.filename}:`,
          unlinkError,
        );
      }

      // 3. Créer l'entrée dans PieceJointe
      const [pieceJointe, created] = await PieceJointe.findOrCreate({
        where: {
          urlpiece: relativePath,
          nomfichier: file.originalname,
        },
        defaults: {
          idpiecejointe: uuidv4(),
          urlpiece: relativePath,
          nomfichier: file.originalname,
          mimetype: file.mimetype,
          taille: file.size,
          nomtable: "EnteteOperationCaisse",
          idtable: idoperation,
          dossier: "operations",
          createdat: new Date(),
          createdby: userId,
        },
        transaction,
      });

      // 4. Vérifier si la liaison existe déjà
      const [liaison, liaisonCreated] = await OperationPieceJointe.findOrCreate(
        {
          where: {
            idoperation: idoperation,
            idpiecejointe: pieceJointe.idpiecejointe,
          },
          defaults: {
            idoperationpiecejointe: uuidv4(),
            idoperation: idoperation,
            idpiecejointe: pieceJointe.idpiecejointe,
            createdat: new Date(),
            createdby: userId,
          },
          transaction,
        },
      );

      results.push({
        idpiecejointe: pieceJointe.idpiecejointe,
        nomfichier: file.originalname,
        urlpiece: relativePath,
        taille: file.size,
        mimetype: file.mimetype,
        alreadyExists: !liaisonCreated,
      });
    }

    await transaction.commit();
    return results;
  } catch (error) {
    await transaction.rollback();

    // Nettoyer les fichiers physiques en cas d'erreur
    for (const file of files) {
      const filePath = path.join(
        process.env.UPLOAD_DIR || "./uploads/operations",
        file.filename,
      );
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.error(
          `Erreur nettoyage fichier ${file.filename}:`,
          unlinkError,
        );
      }
    }

    throw new Error(`Erreur upload: ${error.message}`);
  }
}

/**
 * Récupère toutes les pièces jointes d'une demande
 * @param {string} idoperation - ID de l'opération
 * @returns {Promise<Array>} - Liste des pièces jointes
 */
async function getFiles(idoperation) {
  const operation = await get_by_identeteoperation(idoperation);
  if (!operation) {
    throw new Error("Opération introuvable");
  }

  const piecesJointes = await PieceJointe.findAll({
    include: [
      {
        model: OperationPieceJointe,
        where: { idoperation },
        attributes: [],
        required: true,
      },
    ],
    attributes: [
      "idpiecejointe",
      "urlpiece",
      "nomfichier",
      ["mimetype", "mimetype"],
      "taille",
      "createdat",
      "createdby",
    ],
  });

  return piecesJointes;
}

/**
 * Supprime une pièce jointe d'une demande
 * @param {string} idoperation - ID de l'opération
 * @param {string} idpiecejointe - ID de la pièce jointe
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>}
 */
async function deleteFile(idoperation, idpiecejointe, userId) {
  const transaction = await sequelize.transaction();

  try {
    // 1. Vérifier que la liaison existe
    const liaison = await OperationPieceJointe.findOne({
      where: { idoperation, idpiecejointe },
      transaction,
    });

    if (!liaison) {
      throw new Error("Pièce jointe non trouvée pour cette opération");
    }

    // 2. Récupérer les infos du fichier
    const pieceJointe = await PieceJointe.findByPk(idpiecejointe, {
      transaction,
    });

    if (!pieceJointe) {
      throw new Error("Pièce jointe introuvable");
    }

    // 3. Supprimer la liaison
    await liaison.destroy({ transaction });

    // 4. Supprimer l'entrée PieceJointe
    await pieceJointe.destroy({ transaction });

    // 5. Supprimer le fichier physique
    const filePath = path.join(process.cwd(), pieceJointe.urlpiece);
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      console.error(
        `Erreur suppression fichier physique ${filePath}:`,
        unlinkError,
      );
      // On continue même si le fichier n'existe pas
    }

    await transaction.commit();

    return { success: true, message: "Pièce jointe supprimée avec succès" };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Détermine le mimetype depuis l'extension du fichier
 * @param {string} filepath - Chemin du fichier
 * @returns {string}
 */
function getmimetypeFromExtension(filepath) {
  const ext = path.extname(filepath).toLowerCase();
  const mimetypes = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".csv": "text/csv",
    ".txt": "text/plain",
  };
  return mimetypes[ext] || "application/octet-stream";
}
async function downloadFile(urlpiece) {
  // 1. Construire le chemin absolu
  const absolutePath = path.join(process.cwd(), urlpiece);

  // 2. Vérifier si le fichier existe (utiliser fs.access)
  try {
    await fs.access(absolutePath);
  } catch (error) {
    throw new Error(`Fichier introuvable: ${urlpiece}`);
  }

  // 3. Récupérer les stats du fichier (utiliser fs.stat)
  const stats = await fs.stat(absolutePath);

  // 4. Déterminer le mimetype depuis l'extension (fallback)
  const mimetype = getmimetypeFromExtension(absolutePath);

  // 5. Extraire le nom original depuis l'url
  const nomfichier =
    path.basename(urlpiece).split("_").slice(2).join("_") ||
    path.basename(urlpiece);

  // 6. Retourner le stream de lecture (utiliser fs.createReadStream)
  const stream = fs2.createReadStream(absolutePath);

  stream.on("error", (err) => {
    console.error("❌ Erreur stream:", err);
  });

  return {
    stream,
    stats,
    mimetype,
    nomfichier,
  };
}

/**
 * Détermine le mimetype depuis l'extension du fichier
 * @param {string} filepath - Chemin du fichier
 * @returns {string}
 */
function getmimetypeFromExtension(filepath) {
  const ext = path.extname(filepath).toLowerCase();
  const mimetypes = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".csv": "text/csv",
    ".txt": "text/plain",
  };
  return mimetypes[ext] || "application/octet-stream";
}

// Télécharger toutes les pièces jointes
const downloadAllFiles = async (idoperation) => {
  const piecesJointes = await getFiles(idoperation);

  if (!piecesJointes || piecesJointes.length === 0) {
    throw new Error("Aucune pièce jointe trouvée pour cette opération");
  }

  // Cas d'un seul fichier
  if (piecesJointes.length === 1) {
    const piece = piecesJointes[0];
    const filePath = path.join(process.cwd(), piece.urlpiece);

    try {
      await fs.access(filePath);
      const fileBuffer = await fs.readFile(filePath);

      return {
        buffer: fileBuffer,
        filename: piece.nomfichier,
        totalFiles: 1,
        isZip: false,
      };
    } catch (err) {
      console.error(`❌ Fichier introuvable: ${filePath}`, err.message);
      throw new Error(`Fichier introuvable: ${piece.nomfichier}`);
    }
  }

  // Cas de plusieurs fichiers → ZIP

  const zip = new AdmZip();
  let addedFiles = 0;

  for (const piece of piecesJointes) {
    const filePath = path.join(process.cwd(), piece.urlpiece);

    try {
      await fs.access(filePath);
      const fileBuffer = await fs.readFile(filePath);
      zip.addFile(piece.nomfichier, fileBuffer);
      addedFiles++;
    } catch (err) {
      console.error(`   ❌ Erreur: ${err.message}`);
    }
  }

  if (addedFiles === 0) {
    throw new Error("Aucun fichier valide n'a pu être ajouté au ZIP");
  }

  const zipBuffer = zip.toBuffer();

  const operationInfo = await EnteteOperationCaisse.findByPk(idoperation, {
    attributes: ["codeoperation"],
  });
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
  const filename = `operation_${operationInfo?.codeoperation}_${timestamp}.zip`;

  return {
    buffer: zipBuffer,
    filename: filename,
    totalFiles: addedFiles,
    isZip: true,
  };
};

// Pièces jointes opération & demandes
/**
 * Télécharge toutes les pièces jointes d'une opération et/ou d'une demande
 * @param {string} idoperation - ID de l'opération (optionnel)
 * @param {string} iddemande - ID de la demande sélectionnée (optionnel)
 * @returns {Promise<{buffer: Buffer, filename: string, totalFiles: number}>}
 */
async function downloadAllOperationFiles(idoperation = null, iddemande = null) {
  let operationFiles = [];
  let operation = null;
  let demandeFiles = [];
  let demandeInfo = null;

  // 1. Récupérer les PJ de l'opération (si un ID est fourni)
  if (idoperation) {
    operation = await get_by_identeteoperation(idoperation);
    if (operation) {
      operationFiles = await getOperationFiles(idoperation);
    }
  }

  // 2. Récupérer les PJ de la demande (si un ID est fourni)
  if (iddemande) {
    demandeFiles = await getDemandeFiles(iddemande);
    demandeInfo = await getDemandeInfo(iddemande);
  }

  const totalFiles = operationFiles.length + demandeFiles.length;

  if (totalFiles === 0) {
    throw new Error("Aucune pièce jointe trouvée");
  }

  // 3. Création du ZIP
  const zip = new AdmZip();
  let addedFiles = 0;

  // Ajouter les fichiers de l'opération (si existants)
  for (const file of operationFiles) {
    const filePath = path.join(process.cwd(), file.urlpiece);
    try {
      await fs.access(filePath);
      const fileBuffer = await fs.readFile(filePath);
      zip.addFile(`operation/${file.nomfichier}`, fileBuffer);
      addedFiles++;
    } catch (err) {
      console.error(`   ❌ Fichier operation introuvable: ${file.nomfichier}`);
    }
  }

  // Ajouter les fichiers de la demande (si existants)
  for (const file of demandeFiles) {
    const filePath = path.join(process.cwd(), file.urlpiece);
    try {
      await fs.access(filePath);
      const fileBuffer = await fs.readFile(filePath);
      const folderName = demandeInfo?.codedemande
        ? `demande_${demandeInfo.codedemande}`
        : "demande";
      zip.addFile(`${folderName}/${file.nomfichier}`, fileBuffer);
      addedFiles++;
    } catch (err) {
      console.error(`   ❌ Fichier demande introuvable: ${file.nomfichier}`);
    }
  }

  if (addedFiles === 0) {
    throw new Error("Aucun fichier valide n'a pu être ajouté au ZIP");
  }

  const zipBuffer = zip.toBuffer();

  // 4. Générer le nom du fichier ZIP
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
  let filename = `documents_${timestamp}.zip`;

  if (operation?.codeoperation && demandeInfo?.codedemande) {
    filename = `${operation.codeoperation}_${demandeInfo.codedemande}_${timestamp}.zip`;
  } else if (operation?.codeoperation) {
    filename = `operation_${operation.codeoperation}_${timestamp}.zip`;
  } else if (demandeInfo?.codedemande) {
    filename = `demande_${demandeInfo.codedemande}_${timestamp}.zip`;
  }

  return {
    buffer: zipBuffer,
    filename: filename,
    totalFiles: addedFiles,
    operationFiles: operationFiles.length,
    demandeFiles: demandeFiles.length,
    hasOperation: operationFiles.length > 0,
    hasDemande: demandeFiles.length > 0,
    isZip: true,
  };
}
/**
 * Récupère les pièces jointes d'une opération
 */
async function getOperationFiles(idoperation) {
  const piecesJointes = await PieceJointe.findAll({
    include: [
      {
        model: OperationPieceJointe,
        where: { idoperation },
        attributes: [],
        required: true,
      },
    ],
    attributes: [
      "idpiecejointe",
      "urlpiece",
      "nomfichier",
      ["mimetype", "mimetype"],
      "taille",
      "createdat",
      "createdby",
    ],
  });
  return piecesJointes;
}

/**
 * Récupère les pièces jointes d'une demande
 */
async function getDemandeFiles(iddemande) {
  const piecesJointes = await PieceJointe.findAll({
    include: [
      {
        model: DemandePieceJointe,
        where: { iddemande },
        attributes: [],
        required: true,
      },
    ],
    attributes: [
      "idpiecejointe",
      "urlpiece",
      "nomfichier",
      ["mimetype", "mimetype"],
      "taille",
      "createdat",
      "createdby",
    ],
  });
  return piecesJointes;
}

/**
 * Récupère les infos d'une demande
 */
async function getDemandeInfo(iddemande) {
  const demande = await EnteteDemande.findByPk(iddemande, {
    attributes: ["codedemande", "libelledemande"],
  });
  return demande;
}

// Obtenir les pièces jointes d'une opération avec ceux de la demande
const operationWithDemande = async (idoperaion) => {
  const operation = await EnteteOperationCaisse.findByPk(idoperaion);

  if (operation.iddemande) {
  }
};

/**
 * Récupère toutes les pièces jointes d'une opération et de sa demande associée
 * @param {string} idoperation - ID de l'opération
 * @returns {Promise<{operationPJ: Array, demandePJ: Array, totalCount: number, hasDemande: boolean}>}
 */
async function getOperationWithDemandePieces(idoperation) {
  // 1. Récupérer l'opération
  const operation = await get_by_identeteoperation(idoperation);
  if (!operation) {
    throw new Error("Opération introuvable");
  }

  // 2. Récupérer les PJ de l'opération
  const operationPJ = await getOperationFiles(idoperation);

  // 3. Récupérer les PJ de la demande associée (si elle existe)
  let demandePJ = [];
  let demandeInfo = null;
  let hasDemande = false;

  if (operation.iddemande) {
    demandePJ = await getDemandeFiles(operation.iddemande);
    demandeInfo = await getDemandeInfo(operation.iddemande);
    hasDemande = true;
  }

  return {
    operationPJ: operationPJ,
    demandePJ: demandePJ,
    operationCount: operationPJ.length,
    demandeCount: demandePJ.length,
    totalCount: operationPJ.length + demandePJ.length,
    hasDemande: hasDemande,
    demandeInfo: demandeInfo,
    operationInfo: {
      codeoperation: operation.codeoperation,
      idoperation: operation.idoperation,
    },
  };
}

module.exports = {
  get_all_enteteoperations,
  get_by_identeteoperation,
  create_enteteoperation,
  cancel_enteteoperation,
  update_enteteoperation,
  update_status,
  update_operationorigine,
  delete_enteteoperation,
  uploadFiles,
  getFiles,
  deleteFile,
  downloadFile,
  downloadAllFiles,
  downloadAllOperationFiles,
  getOperationWithDemandePieces,
};
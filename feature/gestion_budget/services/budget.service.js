const { v4: uuidv4, validate } = require("uuid");
const db = require("../../../config/db");
const { sql, connectInstance, connectDB } = require("../../../config/db");
const config = db.config;
const enteteDemandeModel = require("../../gestion_demande_decaissement/models/entetedemande.model");
let modelcircuit = new enteteDemandeModel();
const circuitquery = require("../queries/circuitvalidation.query");
const budgetcontroller = require("../controllers/budget.controller");
const { upload } = require("../../../middlewares/upload/pjbudget");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const sequelize = require("../../../config/database");

//Recuperer le budget par idbudget
async function get_budgetByid(idbudget) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input("idbudget", sql.UniqueIdentifier, idbudget)
    .query(circuitquery.getBudgetById);

  return result.recordset[0];
}

//Récuperer les validateurs d'un circuit
async function get_validateursCircuit(idcircuit) {
  if (!idcircuit) {
    throw new Error("Identifiant du circuit inexistant");
  }

  try {
    const validateurs = modelcircuit.prepareValidateurCircuit(idcircuit);

    return validateurs;
  } catch (error) {
    throw new Error(error);
  }
}

//Creation || initialisation des validateurs dans la table ValidationBudget
async function initValidationBudget(data) {
  const pool = await connectDB();
  try {
    const result = await pool
      .request()
      .input("idbudget", sql.UniqueIdentifier, data.idbudget)
      .input(
        "idcircuitvalidation",
        sql.UniqueIdentifier,
        data.idcircuitvalidation,
      )
      .input("idcircuitetape", sql.UniqueIdentifier, data.idcircuitetape)
      .input("idutilisateur", sql.UniqueIdentifier, data.user)
      .input("rang", sql.Int, data.rang)
      .query(circuitquery.initvalidationBudget);

    return result.recordset;
  } catch (error) {
    return error;
  }
}

//Methode de creation du circuit validation du budget
const initCircuitBudget = async (budget) => {
  let validateurs = [];
  //Récupérer les validateurs
  validateurs = await get_validateursCircuit(budget.idcircuitvalidation);
  // console.log("Validateur:", validateurs)

  if (!validateurs || validateurs.lenght == 0) {
    throw new Error("Aucun validateurs existant dans le circuit");
  } else {
    for (const valid of validateurs) {
      //Prépare data des validateurs
      const dataValidateurs = {
        idbudget: budget.idbudget,
        idcircuitvalidation: valid.idcircuitvalidation,
        idcircuitetape: valid.idcircuitetape,
        user: valid.idutilisateur,
        rang: valid.rang,
      };
      // Enregistrer
      try {
        await initValidationBudget(dataValidateurs);
      } catch (error) {
        throw new Error(error);
      }
    }
  }
};

// Récupérer des validateurs du budget idbudget
async function get_validateurCircuit(idbudget) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input("idbudget", sql.UniqueIdentifier, idbudget)
    .query(circuitquery.circuitValidateur);

  return result.recordset;
}

// Récuperer le circuit de type entite societe
async function get_circuitEntiteSociete(idsociete) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input("idsociete", sql.UniqueIdentifier, idsociete)
    .query(circuitquery.circuitBudget);

  return result.recordset[0];
}

//Envoyer idbudget pour récuperer les validateurs du circuit du budget
exports.get_validateurBudget = async (req, res) => {
  try {
    const idbudget = req.params.id;
    if (!idbudget) {
      throw new Error("ID demande requis");
    }
    const validateurs = await get_validateurCircuit(idbudget);
    res.json({
      success: true,
      data: validateurs,
      message: "Validateurs du circuit",
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

//Check right de l'utilisatuer
async function check_rightUser(data) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input("idbudget", sql.UniqueIdentifier, data.idbudget)
    .input("iduser", sql.UniqueIdentifier, data.iduser)
    .input("niveauactuel", sql.Int, data.niveauactuel)
    .query(circuitquery.checkRight);

  return result.recordset;
}

// Save decision de l'utilisateur
async function save_decision(data) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input("idbudget", sql.UniqueIdentifier, data.idbudget)
    .input("iduser", sql.UniqueIdentifier, data.iduser)
    .input("commentaire", sql.NVarChar(255), data.commentaire)
    .input("decision", sql.NVarChar(20), data.decision)
    .query(circuitquery.saveDecision);

  return result.recordset;
}

// Récuperer le dernier validateur d'un circuit pour un budget
async function get_dernierniveau(idbudget, idcircuit) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input("idbudget", sql.UniqueIdentifier, idbudget)
    .input("idcircuit", sql.UniqueIdentifier, idcircuit)
    .query(circuitquery.dernierNiveau);

  return result.recordset;
}

//Valider le budget
async function validateBudget(idbudget, data) {
  if (!idbudget || !data.decision) {
    throw new Error("Aucune donnée reçue");
  }

  if (data.decision === "refuser" && !data.motif) {
    throw new Error("Motif requis");
  }

  if (data.decision === "complement" && !data.motif) {
    throw new Error("Motif requis");
  }

  //Recuperer le budget par idbuget
  let budget = null;
  budget = await get_budgetByid(idbudget);
  if (!budget) {
    throw new Error("Budget inexistant");
  }

  if (budget.valide > 1) {
    throw new Error("Budget non validable");
  } else {
    const filtreData = {
      idbudget: budget.idbudget,
      iduser: data.iduser,
      niveauactuel: budget.niveauactuel,
    };
    const rights = await check_rightUser(filtreData);
    if (!rights.length) {
      throw new Error("Vous n'êtes pas autorisé à valider à ce niveau");
    }

    //Mapper la décision utilisateur
    let reponse = null;
    if (data.decision == "accepter") {
      reponse = "approuve";
    } else if (data.decision == "refuser") {
      reponse = "rejete";
    } else {
      reponse = "revoir";
    }

    // =============================
    // CAS : REJET IMMEDIAT
    // =============================
    if (reponse === "rejete") {
      // Mise à jour statut global du budget
      await update_statut({
        idbudget: budget.idbudget,
        valide: 2, // 2 = REJETÉ
      });

      // Mettre à jour les champs site/société
      const payload = {
        idbudget: budget.idbudget,
        valide: 2,
      };

      const circuit = await get_circuitvalidation(budget.idcircuitvalidation);

      if (circuit.typeentite == "site") {
        await update_budgetSite(payload);
      } else {
        await update_budgetSociete(payload);
      }

      // Arrêt du workflow
      return { message: "Budget rejeté" };
    }

    const decisionPayload = {
      idbudget: data.idbudget,
      iduser: data.iduser,
      motif: data.motif ?? null,
      commentaire: data.comment ?? null,
      decision: reponse,
    };

    //Enregistrer la décision
    await save_decision(decisionPayload);

    //Cas REFUS → rejet immédiat
    // if (!isAccepted) {
    //   await update_statut({
    //     idbudget: budget.idbudget,
    //     statut: 3 // REJETÉE
    //   });
    //   return;
    // }

    // Get niveauactuel du budget
    const { valide, niveauactuel } = budget;

    // vérifier si dernier niveau atteint
    const [{ dernierRang }] = await get_dernierniveau(
      budget.idbudget,
      budget.idcircuitvalidation,
    );
    //Si le budget a pour circuit type entite
    const circuit = await get_circuitvalidation(budget.idcircuitvalidation);
    console.log("circuit:", circuit);

    let upvalide = 0;
    if (niveauactuel === dernierRang) {
      // validation finale
      await update_statut({
        idbudget: idbudget,
        valide: 1, // VALIDÉE
      });

      upvalide = 1;
      if (circuit.typeentite == "site") {
        try {
          //Récuperer le circuit de type entite societe
          const circuit_societe = await get_circuitEntiteSociete(
            budget.idsociete,
          );

          if (!circuit_societe || circuit_societe.length == 0) {
            throw new Error("Circuit de type entite societé inexistant");
          }

          const init_dataCircuit = {
            idcircuit: circuit_societe.idcircuitvalidation,
            idbudget: budget.idbudget,
            niveauactuel: 1,
            valide: 0,
          };

          //Rattcher le circuit societe et renitialiser les variables de validation
          const new_budget = await update_circuit(init_dataCircuit);
          console.log("new_budget:", new_budget);
          await initCircuitBudget(new_budget);
        } catch (error) {
          throw new Error(error);
        }
      }
    } else {
      // passer au circuit etape suivant
      await nextNiveauactuel(idbudget);
    }

    const payload = { idbudget: budget.idbudget, valide: upvalide };
    console.log("Payload:", payload);

    if (circuit.typeentite == "site") {
      await update_budgetSite(payload);
    } else {
      await update_budgetSociete(payload);
    }
  }

  return { message: "Budget validé." };
}

async function update_statut(data) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input("idbudget", sql.UniqueIdentifier, data.idbudget)
    .input("valide", sql.Int, data.valide)
    .query(circuitquery.updateStatut);

  return result.recordset;
}

async function nextNiveauactuel(idbudget) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input("idbudget", sql.UniqueIdentifier, idbudget)
    .query(circuitquery.niveauActuel);

  return result.recordset;
}

//Recuperer le circuit validation par idcircuit
async function get_circuitvalidation(idcircuit) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input("idcircuit", sql.UniqueIdentifier, idcircuit)
    .query(circuitquery.circuitvalidation);

  return result.recordset[0];
}

// Rattacher le budget societe
async function update_circuit(data) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input("idbudget", sql.UniqueIdentifier, data.idbudget)
    .input("idcircuit", sql.UniqueIdentifier, data.idcircuit)
    .input("niveauactuel", sql.Int, data.niveauactuel)
    .input("valide", sql.Int, data.valide)
    .query(circuitquery.updateCircuit);

  return result.recordset[0];
}

// Mise a jour du budget les champs site
async function update_budgetSite(data) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input("idbudget", sql.UniqueIdentifier, data.idbudget)
    .input("datevalidesite", sql.DateTime, new Date())
    .input("validesite", sql.Int, data.valide)
    .query(circuitquery.updateBudgetSite);

  return result.recordset;
}

// Mise a jour du budget les champs societe
async function update_budgetSociete(data) {
  const pool = await connectDB();
  const result = await pool
    .request()
    .input("idbudget", sql.UniqueIdentifier, data.idbudget)
    .input("datevalidesociete", sql.DateTime, new Date())
    .input("validesociete", sql.Int, data.valide)
    .query(circuitquery.updateBudgetSociete);

  return result.recordset;
}

//Envoyer idbudget pour récuperer les validateurs du circuit du budget
exports.validerBudget = async (req, res) => {
  try {
    const idbudget = req.params.id;
    if (!idbudget) {
      throw new Error("ID Budget requis");
    }
    const validateurs = await validateBudget(idbudget, req.body);
    res.json({ success: true, message: "Décision pris en compte" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.initCircuitBudget = initCircuitBudget;

const {
  PieceJointe,
  BudgetPieceJointe,
  Budget,
} = require("../../gestion_pj_demandes/models/budgets/index");

/**
 * Upload de fichiers pour une demande
 * @param {string} idbudget - ID du budget
 * @param {Array} files - Fichiers uploadés (multer)
 * @param {string} userId - ID de l'utilisateur qui upload
 * @returns {Promise<Array>} - Liste des pièces jointes créées
 */
exports.uploadFiles = async (idbudget, files, userId) => {
  // 1. Vérifier que la budget existe
  const budget = await Budget.findByPk(idbudget);
  if (!budget) {
    throw new Error("Budget introuvable");
  }

  const results = [];
  const transaction = await sequelize.transaction();

  try {
    for (const file of files) {
      // 2. Chemin relatif pour stockage en base
      const relativePath = path
        .join("uploads/budgets", file.filename)
        .replace(/\\/g, "/");

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
          nomtable: "Budget",
          idtable: idbudget,
          dossier: "budgets",
          createdat: new Date(),
          createdby: userId,
        },
        transaction,
      });

      // 4. Vérifier si la liaison existe déjà
      const [liaison, liaisonCreated] = await BudgetPieceJointe.findOrCreate({
        where: {
          idbudget: idbudget,
          idpiecejointe: pieceJointe.idpiecejointe,
        },
        defaults: {
          idbudgetpiecejointe: uuidv4(),
          idbudget: idbudget,
          idpiecejointe: pieceJointe.idpiecejointe,
          createdat: new Date(),
          createdby: userId,
        },
        transaction,
      });

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
        process.env.UPLOAD_DIR || "./uploads/budgets",
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
};

/**
 * Récupère toutes les pièces jointes d'une demande
 * @param {string} idbudget - ID du budget
 * @returns {Promise<Array>} - Liste des pièces jointes
 */
exports.getFiles = async (idbudget) => {
  // 1. Vérifier que la demande existe
  const budget = await Budget.findByPk(idbudget);
  if (!budget) {
    throw new Error("Budget introuvable");
  }

  const piecesJointes = await PieceJointe.findAll({
    include: [
      {
        model: BudgetPieceJointe,
        where: { idbudget },
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
};

/**
 * Supprime une pièce jointe d'une demande
 * @param {string} idbudget - ID du budget
 * @param {string} idpiecejointe - ID de la pièce jointe
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>}
 */
exports.deleteFile = async (idbudget, idpiecejointe, userId) => {
  const transaction = await sequelize.transaction();

  try {
    // 1. Vérifier que la liaison existe
    const liaison = await BudgetPieceJointe.findOne({
      where: { idbudget, idpiecejointe },
      transaction,
    });

    if (!liaison) {
      throw new Error("Pièce jointe non trouvée pour cette demande");
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
};

/**
 * Télécharge un fichier (stream direct)
 * @param {string} urlpiece - Chemin relatif du fichier (ex: uploads/demandes/xxx.pdf)
 * @returns {Promise<{stream: fs.ReadStream, stats: fs.Stats, mimetype: string, nomfichier: string}>}
 */
exports.downloadFile = async (urlpiece) => {
  // 1. Construire le chemin absolu
  const absolutePath = path.join(process.cwd(), urlpiece);

  // 2. Vérifier si le fichier existe
  try {
    await fs.access(absolutePath);
  } catch (error) {
    throw new Error(`Fichier introuvable: ${urlpiece}`);
  }

  // 3. Récupérer les stats du fichier
  const stats = await fs.stat(absolutePath);

  // 4. Déterminer le mimetype depuis l'extension (fallback)
  const mimetype = getmimetypeFromExtension(absolutePath);

  // 5. Extraire le nom original depuis l'url (ou depuis la base selon ton besoin)
  const nomfichier =
    path.basename(urlpiece).split("_").slice(2).join("_") ||
    path.basename(urlpiece);

  // 6. Retourner le stream de lecture
  const stream = fs.createReadStream(absolutePath);

  return {
    stream,
    stats,
    mimetype,
    nomfichier,
  };
};

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

exports.downloadFile = async (urlpiece) => {
  // 1. Construire le chemin absolu
  const absolutePath = path.join(process.cwd(), urlpiece);

  // 2. Vérifier si le fichier existe (utiliser fs.promises.access)
  try {
    await fs.promises.access(absolutePath);
  } catch (error) {
    throw new Error(`Fichier introuvable: ${urlpiece}`);
  }

  // 3. Récupérer les stats du fichier (utiliser fs.promises.stat)
  const stats = await fs.promises.stat(absolutePath);

  // 4. Déterminer le mimetype depuis l'extension (fallback)
  const mimetype = getmimetypeFromExtension(absolutePath);

  // 5. Extraire le nom original depuis l'url
  const nomfichier =
    path.basename(urlpiece).split("_").slice(2).join("_") ||
    path.basename(urlpiece);

  // 6. Retourner le stream de lecture (utiliser fs.createReadStream)
  const stream = fs.createReadStream(absolutePath);

  stream.on("error", (err) => {
    console.error("❌ Erreur stream:", err);
  });

  return {
    stream,
    stats,
    mimetype,
    nomfichier,
  };
};

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
const {
  JustificatifOperation,
  Devise,
  EnteteOperationCaisse,
  DetailsJustificatifOperation,
  TypeOperation,
} = require("../models");
const sequelize = require("../../../config/database");
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");
const ecritureservice = require("../../gestion_comptabilisation/services/ecriture.service");

/* ===== CREATE ===== */
exports.create = async (req, res) => {
  try {
    const justificatif = await JustificatifOperation.create(req.body);
    res.status(201).json({ success: true, data: justificatif });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ===== GET ALL avec Foreign Keys ===== */
exports.findAll = async (req, res) => {
  try {
    const data = await JustificatifOperation.findAll({
      include: [
        { model: Devise, as: "devise" },
        { model: EnteteOperationCaisse, as: "operation" },
      ],
    });

    res.json({ success: true, data: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ===== GET ONE ===== */
exports.findOne = async (req, res) => {
  try {
    const justificatif = await JustificatifOperation.findByPk(req.params.id, {
      include: ["devise", "operation"],
    });

    if (!justificatif)
      return res.status(404).json({ success: false, message: "Introuvable" });

    res.json({ success: true, message: "Introuvable", data: justificatif });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ===== UPDATE ===== */
exports.update = async (req, res) => {
  try {
    await JustificatifOperation.update(req.body, {
      where: { idjustificatifoperation: req.params.id },
    });

    res.json({ success: true, message: "Mis à jour avec succès" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ===== DELETE ===== */
exports.delete = async (req, res) => {
  try {
    await JustificatifOperation.destroy({
      where: { idjustificatifoperation: req.params.id },
    });

    res.json({ success: true, message: "Supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Nouveau controller avec gestion création justificatif
// exports.createFull = async (req, res) => {
//   const transaction = await sequelize.transaction();

//   try {
//     const {
//       details,
//       idsite,
//       idsociete,
//       retour_caisse,
//       caisses,
//       ...justificatifData
//     } = req.body;

//     /* ======================================================
//        0. VALIDATIONS DE BASE
//     ====================================================== */

//     if (!justificatifData.idoperation) {
//       throw new Error("idoperation est obligatoire.");
//     }

//     // 👉 Cas métier : pas de justificatif si pas de détails
//     const isOnlyRetourCaisse =
//       retour_caisse === false && (!details || details.length === 0);

//     /* ======================================================
//        1. GÉNÉRATION CODE (ANTI CONCURRENCE)
//     ====================================================== */

//     let codejustificatif = null;

//     if (!isOnlyRetourCaisse) {
//       const lastPiece = await JustificatifOperation.findOne({
//         order: [["createdat", "DESC"]],
//         lock: transaction.LOCK.UPDATE,
//         transaction,
//       });

//       let compteur = 1;

//       if (lastPiece && lastPiece.codejustificatif) {
//         const lastNumber = parseInt(
//           lastPiece.codejustificatif.split("-")[1],
//           10,
//         );
//         compteur = isNaN(lastNumber) ? 1 : lastNumber + 1;
//       }

//       codejustificatif = `PIECE-${String(compteur).padStart(6, "0")}`;
//     }

//     /* ======================================================
//        2. CRÉATION JUSTIFICATIF (CONDITIONNELLE)
//     ====================================================== */

//     let justificatif = null;
//     let taux = 1;

//     if (!isOnlyRetourCaisse) {
//       justificatif = await JustificatifOperation.create(
//         {
//           ...justificatifData,
//           codejustificatif,
//         },
//         { transaction },
//       );

//       taux = justificatif.taux || 1;
//     }

//     /* ======================================================
//        3. DÉTAILS (SI JUSTIFICATIF)
//     ====================================================== */

//     let totalDetails = 0;

//     if (justificatif && details && details.length > 0) {
//       const detailsToInsert = details.map((d) => {
//         if (!d.idnature) {
//           throw new Error("Chaque détail doit contenir idnature.");
//         }

//         if (!d.montantdetail || d.montantdetail <= 0) {
//           throw new Error("Montant détail invalide.");
//         }

//         const montantref = d.montantdetail * taux;
//         totalDetails += montantref;

//         return {
//           iddetailsjustificatifoperation: uuidv4(),
//           idjustificatif: justificatif.idjustificatifoperation,
//           idnature: d.idnature,
//           idcentreanalytique: d.idcentreanalytique || null,
//           idtiers: d.idtiers || null,
//           montantdetail: d.montantdetail,
//           montantref,
//           createdby: justificatif.createdby,
//         };
//       });

//       await DetailsJustificatifOperation.bulkCreate(detailsToInsert, {
//         transaction,
//       });
//     }

//     /* ======================================================
//        4. RETOUR CAISSE (INDÉPENDANT)
//     ====================================================== */

//     if (retour_caisse === true) {
//       if (!caisses || caisses.length === 0) {
//         throw new Error(
//           "Le tableau caisses est obligatoire lorsque retour_caisse=true",
//         );
//       }

//       let totalCaisses = 0;

//       const operationId = justificatif
//         ? justificatif.idoperation
//         : justificatifData.idoperation;

//       const createdBy = justificatif
//         ? justificatif.createdby
//         : justificatifData.createdby;

//       const caissesToInsert = caisses.map((c) => {
//         if (!c.idcaisse || c.montantcaisse === undefined || !c.taux) {
//           throw new Error("Données caisse invalides.");
//         }

//         if (c.montantcaisse > 0) {
//           const montantref = c.montantcaisse * c.taux;
//           totalCaisses += montantref;

//           return {
//             idtypeoperation: uuidv4(),
//             codtypeoperation: c.codtypeoperation,
//             idperiode: c.idperiode,
//             idsociete: idsociete,
//             idsite: idsite,
//             idcaisse: c.idcaisse,
//             idoperation: operationId,
//             montant: c.montantcaisse,
//             taux: c.taux,
//             montantref,
//             createdby: createdBy,
//           };
//         } else {
//           return null;
//         }
//       });

//       await TypeOperation.bulkCreate(caissesToInsert, { transaction });
//     }

//     /* ======================================================
//        5. TOTAL JUSTIFIÉ (SI JUSTIFICATIF)
//     ====================================================== */

//     let totalJustifie = 0;

//     if (justificatif) {
//       const totalJustifieRaw =
//         (await DetailsJustificatifOperation.sum("montantref", {
//           where: {
//             idjustificatif: {
//               [Op.in]: sequelize.literal(`(
//                 SELECT idjustificatifoperation
//                 FROM JustificatifOperation
//                 WHERE idoperation = '${justificatif.idoperation}'
//               )`),
//             },
//           },
//           transaction,
//         })) || 0;

//       totalJustifie = Number(totalJustifieRaw);
//     }

//     /* ======================================================
//        6. RÉCUP OPÉRATION
//     ====================================================== */

//     const operation = await EnteteOperationCaisse.findByPk(
//       justificatif ? justificatif.idoperation : justificatifData.idoperation,
//       { transaction },
//     );

//     if (!operation) {
//       throw new Error("Opération introuvable.");
//     }

//     /* ======================================================
//        7. CALCUL STATUT
//     ====================================================== */

//     let statut = 0;

//     if (justificatif) {
//       if (totalJustifie > 0 && totalJustifie < operation.montant) {
//         statut = 1;
//       } else if (totalJustifie >= operation.montant) {
//         statut = 2;
//       }
//     }

//     /* ======================================================
//        8. UPDATE STATUT
//     ====================================================== */

//     await EnteteOperationCaisse.update(
//       { justifiee: statut },
//       {
//         where: {
//           idoperation: justificatif
//             ? justificatif.idoperation
//             : justificatifData.idoperation,
//         },
//         transaction,
//       },
//     );

//     await transaction.commit();

//     /* ======================================================
//        9. RÉPONSE
//     ====================================================== */

//     const statut_en_lettre =
//       statut === 0
//         ? "Non justifiée"
//         : statut === 1
//         ? "Partiellement justifiée"
//         : "Justifiée";

//     return res.status(201).json({
//       success: true,
//       message: "Opération traitée avec succès",
//       statut_justification: statut,
//       statut_en_lettre,
//       justificatif,
//     });
//   } catch (error) {
//     await transaction.rollback();

//     return res.status(500).json({
//       success: false,
//       message: "Erreur lors du traitement",
//       error: error.message,
//     });
//   }
// };

exports.createFull = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      details,
      idsite,
      idsociete,
      retour_caisse,
      caisses,
      ...justificatifData
    } = req.body;

    /* ======================================================
       0. VALIDATIONS DE BASE
    ====================================================== */

    if (!justificatifData.idoperation) {
      throw new Error("idoperation est obligatoire.");
    }

    /* ======================================================
       1. GÉNÉRATION CODE
    ====================================================== */

    let codejustificatif = null;

    if (!retour_caisse) {
      const lastPiece = await JustificatifOperation.findOne({
        order: [["createdat", "DESC"]],
        lock: transaction.LOCK.UPDATE,
        transaction,
      });

      let compteur = 1;

      if (lastPiece && lastPiece.codejustificatif) {
        const lastNumber = parseInt(
          lastPiece.codejustificatif.split("-")[1],
          10,
        );
        compteur = isNaN(lastNumber) ? 1 : lastNumber + 1;
      }

      codejustificatif = `PIECE-${String(compteur).padStart(6, "0")}`;
    }

    /* ======================================================
       2. CRÉATION JUSTIFICATIF
    ====================================================== */

    let justificatif = null;
    let taux = 1;

    // ✔️ INTERDICTION si retour caisse
    if (!retour_caisse) {
      justificatif = await JustificatifOperation.create(
        {
          ...justificatifData,
          codejustificatif,
        },
        { transaction },
      );

      taux = justificatif.taux || 1;
    }

    /* ======================================================
       3. DÉTAILS
    ====================================================== */

    let totalDetails = 0;

    if (!retour_caisse && justificatif && details?.length > 0) {
      const detailsToInsert = details.map((d) => {
        if (!d.idnature) {
          throw new Error("Chaque détail doit contenir idnature.");
        }

        if (!d.montantdetail || d.montantdetail <= 0) {
          throw new Error("Montant détail invalide.");
        }

        const montantref = d.montantdetail * taux;
        totalDetails += montantref;

        return {
          iddetailsjustificatifoperation: uuidv4(),
          idjustificatif: justificatif.idjustificatifoperation,
          idnature: d.idnature,
          idcentreanalytique: d.idcentreanalytique || null,
          idtiers: d.idtiers || null,
          montantdetail: d.montantdetail,
          montantref,
          createdby: justificatif.createdby,
        };
      });

      await DetailsJustificatifOperation.bulkCreate(detailsToInsert, {
        transaction,
      });
    }

    /* ======================================================
       4. RETOUR CAISSE
    ====================================================== */

    let totalCaisses = 0;

    if (retour_caisse === true) {
      if (!caisses || caisses.length === 0) {
        throw new Error(
          "Le tableau caisses est obligatoire lorsque retour_caisse=true",
        );
      }

      const operationId = justificatif
        ? justificatif.idoperation
        : justificatifData.idoperation;

      const createdBy = justificatif
        ? justificatif.createdby
        : justificatifData.createdby;

      // ✔️ FILTRAGE montant > 0
      const caissesValides = caisses.filter((c) => c.montantcaisse > 0);

      const caissesToInsert = caissesValides.map((c) => {
        if (!c.idcaisse || c.montantcaisse === undefined || !c.taux) {
          throw new Error("Données caisse invalides.");
        }

        const montantref = c.montantcaisse * c.taux;
        totalCaisses += montantref;

        return {
          idtypeoperation: uuidv4(),
          codtypeoperation: "encaissement",
          idperiode: c.idperiode,
          idsociete,
          idsite,
          idcaisse: c.idcaisse,
          idoperation: operationId,
          montant: c.montantcaisse,
          taux: c.taux,
          montantref,
          createdby: createdBy,
        };
      });

      if (caissesToInsert.length > 0) {
        await TypeOperation.bulkCreate(caissesToInsert, { transaction });
      }
    }

    /* ======================================================
       5. TOTAL JUSTIFIÉ GLOBAL
    ====================================================== */

    const operationId = justificatif
      ? justificatif.idoperation
      : justificatifData.idoperation;

    const totalJustifieRaw =
      (await DetailsJustificatifOperation.sum("montantref", {
        where: {
          idjustificatif: {
            [Op.in]: sequelize.literal(`(
              SELECT idjustificatifoperation
              FROM JustificatifOperation
              WHERE idoperation = '${operationId}'
            )`),
          },
        },
        transaction,
      })) || 0;

    const totalJustifie = Number(totalJustifieRaw);

    /* ======================================================
       6. OPÉRATION
    ====================================================== */

    const operation = await EnteteOperationCaisse.findByPk(operationId, {
      transaction,
    });

    if (!operation) {
      throw new Error("Opération introuvable.");
    }

    /* ======================================================
       7. STATUT (LOGIQUE MÉTIER CORRIGÉE)
    ====================================================== */

    let statut = 0;

    const totalGlobal = totalJustifie + totalCaisses;

    if (totalGlobal > 0 && totalGlobal < operation.montant) {
      statut = 1;
    } else if (totalGlobal === Number(operation.montant)) {
      statut = 2;
    }

    /* ======================================================
       8. UPDATE
    ====================================================== */

    await EnteteOperationCaisse.update(
      { justifiee: statut },
      {
        where: { idoperation: operationId },
        transaction,
      },
    );

    await transaction.commit();

    if (retour_caisse === true) {
      // comptabilisation
      await ecritureservice.GenererEcriture(operationId);
    } else {
      // comptabilisation
      await ecritureservice.GenererJustificatif(
        justificatif.idjustificatifoperation,
      );
    }

    /* ======================================================
       9. RÉPONSE
    ====================================================== */

    const statut_en_lettre =
      statut === 0
        ? "Non justifiée"
        : statut === 1
        ? "Partiellement justifiée"
        : "Justifiée";

    return res.status(201).json({
      success: true,
      message: "Opération traitée avec succès",
      statut_justification: statut,
      statut_en_lettre,
      justificatif,
    });
  } catch (error) {
    await transaction.rollback();

    return res.status(500).json({
      success: false,
      message: "Erreur lors du traitement",
      error: error.message,
    });
  }
};

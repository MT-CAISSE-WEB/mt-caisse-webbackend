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

/* ===== CREATE ===== */
exports.create = async (req, res) => {
  try {
    const justificatif = await JustificatifOperation.create(req.body);
    res.status(201).json(justificatif);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error:", error.message);
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
    res.status(500).json({ error: error.message });
  }
};

/* ===== GET ONE ===== */
exports.findOne = async (req, res) => {
  try {
    const justificatif = await JustificatifOperation.findByPk(req.params.id, {
      include: ["devise", "operation"],
    });

    if (!justificatif) return res.status(404).json({ message: "Introuvable" });

    res.json(justificatif);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ===== UPDATE ===== */
exports.update = async (req, res) => {
  try {
    await JustificatifOperation.update(req.body, {
      where: { idjustificatifoperation: req.params.id },
    });

    res.json({ message: "Mis à jour avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ===== DELETE ===== */
exports.delete = async (req, res) => {
  try {
    await JustificatifOperation.destroy({
      where: { idjustificatifoperation: req.params.id },
    });

    res.json({ message: "Supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// exports.createFull = async (req, res) => {
//   const transaction = await sequelize.transaction();

//   try {
//     /* ======================================================
//        Données du body
//     ====================================================== */
//     const { details, retour_caisse, caisses, ...justificatifData } = req.body;

//     /* ======================================================
//        Validation détails
//     ====================================================== */
//     if (!details || details.length === 0) {
//       return res.status(400).json({
//         message: "Un justificatif doit contenir au moins un détail.",
//       });
//     }

//     /* ======================================================
//        1. Génération du code PIECE-COMPTEUR
//     ====================================================== */
//     const lastPiece = await JustificatifOperation.findOne({
//       order: [["createdAt", "DESC"]],
//       transaction,
//     });

//     let compteur = 1;

//     if (lastPiece && lastPiece.codejustificatif) {
//       const lastNumber = parseInt(lastPiece.codejustificatif.split("-")[1]);
//       compteur = lastNumber + 1;
//     }

//     const codejustificatif = `PIECE-${String(compteur).padStart(6, "0")}`;

//     /* ======================================================
//        2. Création du justificatif
//     ====================================================== */
//     const justificatif = await JustificatifOperation.create(
//       {
//         ...justificatifData,
//         codejustificatif,
//       },
//       { transaction },
//     );

//     /* ======================================================
//        3. Création des détails (montantref = montantdetail * taux)
//     ====================================================== */
//     const detailsToInsert = details.map((d) => ({
//       iddetail: uuidv4(),
//       idjustificatif: justificatif.idjustificatifoperation,
//       idnature: d.idnature,
//       idcentreanalytique: d.idcentreanalytique,
//       montantdetail: d.montantdetail,
//       montantref: d.montantdetail * justificatif.taux,
//     }));

//     await DetailsJustificatifOperation.bulkCreate(detailsToInsert, {
//       transaction,
//     });

//     /* ======================================================
//        4. Création des caisses si retour_caisse = true
//     ====================================================== */
//     if (retour_caisse === true) {
//       if (!caisses || caisses.length === 0) {
//         return res.status(400).json({
//           message:
//             "Le tableau caisses est obligatoire lorsque retour_caisse=true",
//         });
//       }

//       const caissesToInsert = caisses.map((c) => ({
//         idtypeoperation: uuidv4(),
//         codtypeoperation: c.codtypeoperation,
//         idperiode: c.idperiode,
//         idsociete: c.idsociete,
//         idsite: c.idsite,
//         idcaisse: c.idcaisse,

//         /* FK */
//         idoperation: justificatif.idoperation,

//         montant: c.montant,
//         taux: c.taux,
//         montantref: c.montant * c.taux,

//         createdby: justificatif.createdby,
//       }));

//       await TypeOperation.bulkCreate(caissesToInsert, {
//         transaction,
//       });
//     }

//     /* ======================================================
//        Commit
//     ====================================================== */
//     await transaction.commit();

//     return res.status(201).json({
//       message: "Création complète réussie",
//       justificatif,
//     });
//   } catch (error) {
//     await transaction.rollback();

//     return res.status(500).json({
//       message: "Erreur lors de la création complète",
//       error: error.message,
//     });
//   }
// };

exports.createFull = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { idsociete, idsite, details, retour_caisse, caisses, ...justificatifData } = req.body;

    /* ======================================================
       0. VALIDATIONS DE BASE
    ====================================================== */

    if ((retour_caisse == false) && (!details || details.length === 0)) {
      throw new Error("Un justificatif doit contenir au moins un détail.");
    }

    if (!justificatifData.idoperation) {
      throw new Error("idoperation est obligatoire.");
    }

    /* ======================================================
       1. GÉNÉRATION CODE (ANTI CONCURRENCE)
    ====================================================== */

    // ⚠️ Lock pessimiste pour éviter doublons
    const lastPiece = await JustificatifOperation.findOne({
      order: [["createdat", "DESC"]],
      lock: transaction.LOCK.UPDATE,
      transaction,
    });

    let compteur = 1;

    if (lastPiece && lastPiece.codejustificatif) {
      const lastNumber = parseInt(lastPiece.codejustificatif.split("-")[1], 10);
      compteur = isNaN(lastNumber) ? 1 : lastNumber + 1;
    }

    const codejustificatif = `PIECE-${String(compteur).padStart(6, "0")}`;

    /* ======================================================
       2. CRÉATION JUSTIFICATIF
    ====================================================== */

    const justificatif = await JustificatifOperation.create(
      {
        ...justificatifData,
        codejustificatif,
      },
      { transaction },
    );

    const taux = justificatif.taux || 1;

    /* ======================================================
       3. VALIDATION + PRÉPARATION DÉTAILS
    ====================================================== */

    let totalDetails = 0;

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

    /* ======================================================
       4. RETOUR CAISSE (VALIDATION MÉTIER)
    ====================================================== */

    if (retour_caisse === true) {
      if (!caisses || caisses.length === 0) {
        throw new Error(
          "Le tableau caisses est obligatoire lorsque retour_caisse=true",
        );
      }

      let totalCaisses = 0;

      const caissesToInsert = caisses.map((c) => {
        console.log(c);
        if (!c.idcaisse || c.montantcaisse == undefined || !c.taux) {
          throw new Error("Données caisse invalides.");
        }

        const montantref = c.montantcaisse * c.taux;
        totalCaisses += montantref;

        return {
          idtypeoperation: uuidv4(),
          codtypeoperation: "encaissement",
          idperiode: c.idperiode,
          idsociete: idsociete,
          idsite: idsite,
          idcaisse: c.idcaisse,
          idoperation: justificatif.idoperation,
          montant: c.montantcaisse,
          taux: c.taux,
          montantref,
          createdby: justificatif.createdby,
        };
      });
      // if (Math.abs(totalCaisses - totalDetails) > 0.001) {
      //   throw new Error(
      //     "Incohérence entre le total justificatif et le retour caisse.",
      //   );
      // }

      await TypeOperation.bulkCreate(caissesToInsert, { transaction });
    }

    /* ======================================================
       5. TOTAL JUSTIFIÉ GLOBAL
    ====================================================== */

    const totalJustifieRaw =
      (await DetailsJustificatifOperation.sum("montantref", {
        where: {
          idjustificatif: {
            [Op.in]: sequelize.literal(`(
          SELECT idjustificatifoperation
          FROM JustificatifOperation
          WHERE idoperation = '${justificatif.idoperation}'
        )`),
          },
        },
        transaction,
      })) || 0;

    const totalJustifie = Number(totalJustifieRaw);

    /* ======================================================
       6. RÉCUP OPÉRATION
    ====================================================== */

    const operation = await EnteteOperationCaisse.findByPk(
      justificatif.idoperation,
      { transaction },
    );

    if (!operation) {
      throw new Error("Opération introuvable.");
    }

    /* ======================================================
       7. CALCUL STATUT
    ====================================================== */

    let statut = 0;

    if (totalJustifie > 0 && totalJustifie < operation.montant) {
      statut = 1;
    } else if (totalJustifie >= operation.montant) {
      statut = 2;
    }

    /* ======================================================
       8. UPDATE STATUT
    ====================================================== */

    await EnteteOperationCaisse.update(
      { justifiee: statut },
      {
        where: { idoperation: justificatif.idoperation },
        transaction,
      },
    );

    await transaction.commit();

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
      success : true,
      message: "Création complète réussie",
      statut_justification: statut,
      statut_en_lettre,
      justificatif,
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la création complète",
      error: error.message,
    });
  }
};

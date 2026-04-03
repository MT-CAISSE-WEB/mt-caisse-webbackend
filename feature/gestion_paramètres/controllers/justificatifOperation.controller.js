const {
  JustificatifOperation,
  Devise,
  EnteteOperationCaisse,
  DetailsJustificatifOperation,
  TypeOperation,
} = require("../models");
const sequelize = require("../../../config/database");
const { v4: uuidv4 } = require("uuid");

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

    res.json({success: true, data: data});
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

exports.createFull = async (req, res) => {
  const { details, retour_caisse, caisses, ...justificatifData } = req.body;

  /* ======================================================
     VALIDATIONS AVANT TRANSACTION (CRITIQUE)
  ====================================================== */

  if (!details || details.length === 0) {
    return res.status(400).json({
      message: "Un justificatif doit contenir au moins un détail.",
    });
  }

  if (retour_caisse === true && (!caisses || caisses.length === 0)) {
    return res.status(400).json({
      message: "Le tableau caisses est obligatoire lorsque retour_caisse=true",
    });
  }

  try {
    const justificatif = await sequelize.transaction(
      async (transaction) => {

        /* ======================================================
           1. COMPTEUR SÉCURISÉ (ANTI CONCURRENCE)
           SERIALIZABLE + LOCK
        ====================================================== */

        const lastPiece = await JustificatifOperation.findOne({
          attributes: ["codejustificatif"],
          order: [["createdAt", "DESC"]],
          lock: transaction.LOCK.UPDATE,
          transaction,
        });

        let compteur = 1;

        if (lastPiece?.codejustificatif) {
          const lastNumber = parseInt(lastPiece.codejustificatif.split("-")[1]);
          compteur = lastNumber + 1;
        }

        const codejustificatif = `PIECE-${String(compteur).padStart(6, "0")}`;

        /* ======================================================
           2. CREATION JUSTIFICATIF
        ====================================================== */

        const newJustificatif = await JustificatifOperation.create(
          {
            ...justificatifData,
            codejustificatif,
          },
          { transaction }
        );

        /* ======================================================
           3. DETAILS
        ====================================================== */

        const detailsToInsert = details.map((d) => ({
          // iddetail: uuidv4(),
          idjustificatif: newJustificatif.idjustificatifoperation,
          idnature: d.idnature,
          idcentreanalytique: d.idcentreanalytique,
          montantdetail: d.montantdetail,
          montantref: d.montantdetail * newJustificatif.taux,
        }));

        try {
          await DetailsJustificatifOperation.bulkCreate(detailsToInsert, {
            transaction,
          });
        } catch (error) {
          throw Error(error.message);
        }

        /* ======================================================
           4. CAISSES
        ====================================================== */

        if (retour_caisse === true) {
          const caissesToInsert = caisses.map((c) => ({
            // idtypeoperation: uuidv4(),
            codtypeoperation: c.codtypeoperation,
            idperiode: c.idperiode,
            idsociete: c.idsociete,
            idsite: c.idsite,
            idcaisse: c.idcaisse,

            idoperation: newJustificatif.idoperation,

            montant: c.montant,
            taux: c.taux,
            montantref: c.montant * c.taux,

            createdby: newJustificatif.createdby,
          }));

          await TypeOperation.bulkCreate(caissesToInsert, {
            transaction,
          });
        }

        /* ======================================================
           RETURN => COMMIT AUTOMATIQUE
        ====================================================== */
        return newJustificatif;
      }
    );

    /* ======================================================
       SUCCESS
    ====================================================== */

    return res.status(201).json({
      success: true,
      message: "Création complète réussie",
      justificatif,
    });

  } catch (error) {
    // console.error("CREATE FULL ERROR:", error);
    return res.status(500).json({
      message: "Erreur lors de la création complète",
      error: error.message,
    });
  }
};

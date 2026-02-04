const {
  JustificatifOperation,
  Devise,
  EnteteOperationCaisse,
  DetailsJustificatifOperation,
  TypeOperation
} = require("../models");
const sequelize = require("../../../config/database");


/* ===== CREATE ===== */
exports.create = async (req, res) => {
  try {
    const justificatif = await JustificatifOperation.create(req.body);
    res.status(201).json(justificatif);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("error:", error.message)
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

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ===== GET ONE ===== */
exports.findOne = async (req, res) => {
  try {
    const justificatif = await JustificatifOperation.findByPk(
      req.params.id,
      {
        include: ["devise", "operation"],
      }
    );

    if (!justificatif)
      return res.status(404).json({ message: "Introuvable" });

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
  const transaction = await sequelize.transaction();

  try {
    /* ======================================================
       Données envoyées depuis le body
    ====================================================== */
    const {
      details,
      retour_caisse,
      typeOperationData,
      ...justificatifData
    } = req.body;

    /* ======================================================
       Validation : détails obligatoires
    ====================================================== */
    if (!details || details.length === 0) {
      return res.status(400).json({
        message: "Un justificatif doit contenir au moins un détail.",
      });
    }

    /* ======================================================
       1. Création du justificatif
    ====================================================== */
    const justificatif = await JustificatifOperation.create(
      justificatifData,
      { transaction }
    );

    /* ======================================================
       2. Création des détails liés
    ====================================================== */
    const detailsToInsert = details.map((d) => ({
      ...d,
      idjustificatif: justificatif.idjustificatifoperation,
    }));

    await DetailsJustificatifOperation.bulkCreate(detailsToInsert, {
      transaction,
    });

    /* ======================================================
       3. Création TypeOperation si retour_caisse = true
    ====================================================== */
    if (retour_caisse === true) {
      if (!typeOperationData) {
        return res.status(400).json({
          message:
            "typeOperationData est obligatoire lorsque retour_caisse=true",
        });
      }

      await TypeOperation.create(
        {
          ...typeOperationData,

          /* FK automatique */
          idoperation: justificatif.idoperation,

          /* Montants issus du justificatif */
          montant: justificatif.montantjustificatif,
          taux: justificatif.taux,

          /* Exemple calcul montantref */
          montantref:
            justificatif.montantjustificatif * justificatif.taux,

          createdby: justificatif.createdby,
        },
        { transaction }
      );
    }

    /* ======================================================
       Commit transaction
    ====================================================== */
    await transaction.commit();

    return res.status(201).json({
      message: "Justificatif + détails créés avec succès",
      retour_caisse,
      justificatif,
    });
  } catch (error) {
    await transaction.rollback();

    return res.status(500).json({
      message: "Erreur lors de la création complète",
      error: error.message,
    });
  }
};
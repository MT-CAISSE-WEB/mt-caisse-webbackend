const express = require("express");
const router = express.Router();
const controller = require("../controllers/lignebudget.controller");
const BudgetDepartementNature = require("../models/lignebudget.model");
const { v4: uuidv4 } = require("uuid");
const { Op, Sequelize } = require("sequelize");
const sequelize = require("../../../config/database");

router.post("/create", controller.create); // CREATE
router.get("/", controller.getAll); // READ ALL
router.get("/:id", controller.getById); // READ ONE BY ID
router.patch("/update/:id", controller.update); // UPDATE
router.delete("/delete/:id", controller.delete); // DELETE
router.post("/duplicate/:id", controller.duplicate); // DUPLICATE
// getByBudgetId
router.get("/budget/:idbudget", controller.getByBudgetId);

// ==========================
// Créer plusieurs lignes de budget
// ==========================
router.post("/bulk", async (req, res) => {
  try {
    const lignes = req.body; // tableau d'objets { idbudget, iddepartement, idnature, montantprevisiondept, montantprevisionsite, montantprevisionsociete }

    if (!Array.isArray(lignes) || lignes.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Aucune ligne à créer." });
    }

    // Ajouter les UUID et timestamps
    const payload = lignes.map((l) => ({
      idbudgetdepartementnature: uuidv4(),
      idbudget: l.idbudget,
      iddepartement: l.iddepartement,
      idcentreanalytique: l.idcentreanalytique,
      idnature: l.idnature,
      montantprevisiondept: l.montantprevisiondept || 0,
      montantprevisionsite: l.montantprevisionsite || 0,
      montantprevisionsociete: l.montantprevisionsociete || 0,
      totalconsocloture: 0,
      soldecloture: 0,
      createdat: new Date(),
      createdby: l.createdby, // ou récupérer depuis le token/auth
      updatedat: null,
      updatedby: null,
    }));

    // Insertion multiple
    const result = await BudgetDepartementNature.bulkCreate(payload);

    return res.status(201).json({
      success: true,
      data: result,
      message: "Lignes créées avec succès.",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Erreur serveur.", error: err.message });
  }
});

router.put("/bulk-update", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const lignes = req.body;
    console.log("lignes:", lignes);

    if (!Array.isArray(lignes) || lignes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Aucune ligne à mettre à jour.",
      });
    }

    for (const l of lignes) {
      // 🔐 Vérification collision métier
      const existing = await BudgetDepartementNature.findOne({
        where: {
          idbudget: l.idbudget,
          iddepartement: l.iddepartement,
          idnature: l.idnature,
          idcentreanalytique: l.idcentreanalytique,
          idbudgetdepartementnature: { [Op.ne]: l.idbudgetdepartementnature },
        },
        transaction: t,
      });

      if (existing) {
        throw new Error(
          `Conflit détecté : une ligne existe déjà pour ce budget / département / nature`,
        );
      }

      // ✅ Mise à jour complète
      await BudgetDepartementNature.update(
        {
          idbudget: l.idbudget,
          iddepartement: l.iddepartement,
          idnature: l.idnature,
          idcentreanalytique: l.idcentreanalytique,

          montantprevisiondept: l.montantprevisiondept,
          montantprevisionsite: l.montantprevisionsite,
          montantprevisionsociete: l.montantprevisionsociete,

          updatedat: new Date(),
          updatedby: l.updatedby,
        },
        {
          where: {
            idbudgetdepartementnature: l.idbudgetdepartementnature,
          },
          transaction: t,
        },
      );
    }

    await t.commit();

    res.json({
      success: true,
      message: "Mise à jour complète des lignes budgétaires terminée.",
    });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message || "Erreur serveur",
    });
  }
});

module.exports = router;

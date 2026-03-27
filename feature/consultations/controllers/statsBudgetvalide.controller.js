// controllers/budgetController.js
const { QueryTypes } = require("sequelize");
const sequelize = require("../../../config/database");

/**
 * @desc    Récupérer le budget annuel en cours avec ses budgets mensuels et leur consommation
 * @route   GET /api/statsbudget/budget-valide/:idsociete
 * @access  Privé
 */
exports.getBudgetAnnuelEnCours = async (req, res) => {
  try {
    const { idsite, idsociete } = req.query;
    const anneeCourante = new Date().getFullYear();
    let query = "";
    let result = null;
    if (idsite) {
      query = `
      WITH BudgetAnnuel AS (
        -- Récupérer le budget annuel actif
        SELECT TOP 1
          b.idbudget,
          b.codebudget,
          b.libelle,
          b.datedebut,
          b.datefin
        FROM Budget b
        WHERE b.idsociete = :idsociete
          AND b.idsite = :idsite
          AND b.typebudget = 'Annuel'
          AND b.actif = 1
          AND YEAR(b.datedebut) = :annee
      ),

      BudgetsMensuels AS (
        -- Récupérer les budgets mensuels liés
        SELECT
          bm.idbudget,
          bm.codebudget,
          bm.libelle,
          bm.datedebut,
          bm.datefin,
          MONTH(bm.datedebut) as mois_numero,
          -- Convertir le numéro en nom de mois
          CASE MONTH(bm.datedebut)
            WHEN 1 THEN 'Janvier'
            WHEN 2 THEN 'Février'
            WHEN 3 THEN 'Mars'
            WHEN 4 THEN 'Avril'
            WHEN 5 THEN 'Mai'
            WHEN 6 THEN 'Juin'
            WHEN 7 THEN 'Juillet'
            WHEN 8 THEN 'Août'
            WHEN 9 THEN 'Septembre'
            WHEN 10 THEN 'Octobre'
            WHEN 11 THEN 'Novembre'
            WHEN 12 THEN 'Décembre'
          END as mois_nom,
          bm.idbudgetparent
        FROM Budget bm
        INNER JOIN BudgetAnnuel ba ON ba.idbudget = bm.idbudgetparent
        WHERE bm.typebudget = 'Mensuel'
      ),

      ConsommationMensuelle AS (
        -- Calculer les montants pour chaque budget mensuel
        SELECT
          bm.idbudget,
          bm.mois_numero,
          bm.mois_nom,
          bm.codebudget,
          bm.libelle,
          -- Montant prévisionnel
          ISNULL((
            SELECT SUM(montantprevisionsociete)
            FROM BudgetDepartementNature
            WHERE idbudget = bm.idbudget
          ), 0) as montant_previsionnel,
          -- Montant consommé
          ISNULL((
            SELECT SUM(ld.montantdemande)
            FROM LigneDemande ld
            INNER JOIN EnteteDemande ed ON ed.iddemande = ld.iddemande
            WHERE ld.idbudget = bm.idbudget
              AND ed.statut = 1 -- Statut approuvé
          ), 0) as montant_consomme
        FROM BudgetsMensuels bm
      ),

      Totaux AS (
        -- Calculer les totaux annuels
        SELECT
          SUM(montant_previsionnel) as total_previsionnel,
          SUM(montant_consomme) as total_consomme
        FROM ConsommationMensuelle
      )

      -- Résultat final
      SELECT
        ba.codebudget as code_budget_annuel,
        ba.libelle as libelle_budget_annuel,
        YEAR(ba.datedebut) as annee,
        -- Budgets mensuels en JSON avec nom du mois
        (
          SELECT
            cm.mois_numero,
            cm.mois_nom,
            cm.codebudget as code_budget_mensuel,
            cm.libelle as libelle_budget_mensuel,
            cm.montant_previsionnel,
            cm.montant_consomme,
            CASE
              WHEN cm.montant_previsionnel > 0
              THEN ROUND((cm.montant_consomme * 100.0 / cm.montant_previsionnel), 2)
              ELSE 0
            END as taux_consommation
          FROM ConsommationMensuelle cm
          ORDER BY cm.mois_numero
          FOR JSON PATH
        ) as budgets_mensuels,
        -- Totaux annuels en JSON
        (
          SELECT
            t.total_previsionnel,
            t.total_consomme,
            CASE
              WHEN t.total_previsionnel > 0
              THEN ROUND((t.total_consomme * 100.0 / t.total_previsionnel), 2)
              ELSE 0
            END as taux_consommation_annuel
          FROM Totaux t
          FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
        ) as totaux_annuels
      FROM BudgetAnnuel ba
    `;
      result = await sequelize.query(query, {
        replacements: {
          idsociete,
          idsite,
          annee: anneeCourante,
        },
        type: QueryTypes.SELECT,
      });
    } else {
      query = `
      WITH BudgetAnnuel AS (
        -- Récupérer le budget annuel actif
        SELECT TOP 1
          b.idbudget,
          b.codebudget,
          b.libelle,
          b.datedebut,
          b.datefin
        FROM Budget b
        WHERE b.idsociete = :idsociete
          AND b.typebudget = 'Annuel'
          AND b.actif = 1
          AND YEAR(b.datedebut) = :annee
      ),

      BudgetsMensuels AS (
        -- Récupérer les budgets mensuels liés
        SELECT
          bm.idbudget,
          bm.codebudget,
          bm.libelle,
          bm.datedebut,
          bm.datefin,
          MONTH(bm.datedebut) as mois_numero,
          -- Convertir le numéro en nom de mois
          CASE MONTH(bm.datedebut)
            WHEN 1 THEN 'Janvier'
            WHEN 2 THEN 'Février'
            WHEN 3 THEN 'Mars'
            WHEN 4 THEN 'Avril'
            WHEN 5 THEN 'Mai'
            WHEN 6 THEN 'Juin'
            WHEN 7 THEN 'Juillet'
            WHEN 8 THEN 'Août'
            WHEN 9 THEN 'Septembre'
            WHEN 10 THEN 'Octobre'
            WHEN 11 THEN 'Novembre'
            WHEN 12 THEN 'Décembre'
          END as mois_nom,
          bm.idbudgetparent
        FROM Budget bm
        INNER JOIN BudgetAnnuel ba ON ba.idbudget = bm.idbudgetparent
        WHERE bm.typebudget = 'Mensuel'
      ),

      ConsommationMensuelle AS (
        -- Calculer les montants pour chaque budget mensuel
        SELECT
          bm.idbudget,
          bm.mois_numero,
          bm.mois_nom,
          bm.codebudget,
          bm.libelle,
          -- Montant prévisionnel
          ISNULL((
            SELECT SUM(montantprevisionsociete)
            FROM BudgetDepartementNature
            WHERE idbudget = bm.idbudget
          ), 0) as montant_previsionnel,
          -- Montant consommé
          ISNULL((
            SELECT SUM(ld.montantdemande)
            FROM LigneDemande ld
            INNER JOIN EnteteDemande ed ON ed.iddemande = ld.iddemande
            WHERE ld.idbudget = bm.idbudget
              AND ed.statut = 1 -- Statut approuvé
          ), 0) as montant_consomme
        FROM BudgetsMensuels bm
      ),

      Totaux AS (
        -- Calculer les totaux annuels
        SELECT
          SUM(montant_previsionnel) as total_previsionnel,
          SUM(montant_consomme) as total_consomme
        FROM ConsommationMensuelle
      )

      -- Résultat final
      SELECT
        ba.codebudget as code_budget_annuel,
        ba.libelle as libelle_budget_annuel,
        YEAR(ba.datedebut) as annee,
        -- Budgets mensuels en JSON avec nom du mois
        (
          SELECT
            cm.mois_numero,
            cm.mois_nom,
            cm.codebudget as code_budget_mensuel,
            cm.libelle as libelle_budget_mensuel,
            cm.montant_previsionnel,
            cm.montant_consomme,
            CASE
              WHEN cm.montant_previsionnel > 0
              THEN ROUND((cm.montant_consomme * 100.0 / cm.montant_previsionnel), 2)
              ELSE 0
            END as taux_consommation
          FROM ConsommationMensuelle cm
          ORDER BY cm.mois_numero
          FOR JSON PATH
        ) as budgets_mensuels,
        -- Totaux annuels en JSON
        (
          SELECT
            t.total_previsionnel,
            t.total_consomme,
            CASE
              WHEN t.total_previsionnel > 0
              THEN ROUND((t.total_consomme * 100.0 / t.total_previsionnel), 2)
              ELSE 0
            END as taux_consommation_annuel
          FROM Totaux t
          FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
        ) as totaux_annuels
      FROM BudgetAnnuel ba
    `;
      result = await sequelize.query(query, {
        replacements: {
          idsociete,
          annee: anneeCourante,
        },
        type: QueryTypes.SELECT,
      });
    }

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Aucun budget annuel trouvé pour ${anneeCourante}`,
      });
    }

    // Parser les JSON
    const budgetData = result[0];
    budgetData.budgets_mensuels = JSON.parse(
      budgetData.budgets_mensuels || "[]",
    );
    budgetData.totaux_annuels = JSON.parse(budgetData.totaux_annuels || "{}");

    res.json({
      success: true,
      data: budgetData,
    });
  } catch (error) {
    console.error("Erreur budget annuel:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

// exports.getBudgetAnnuelEnCours = async (req, res) => {
//   try {
//     // ======================================================
//     // 0. PARAMÈTRES
//     // ======================================================
//     const { idsociete } = req.params;
//     const { idsociete, idsite } = req.query; // filtre optionnel
//     const anneeCourante = new Date().getFullYear();

//     if (!idsociete) {
//       return res.status(400).json({
//         success: false,
//         message: "Le paramètre idsociete est obligatoire",
//       });
//     }

//     // ======================================================
//     // 1. REQUÊTE SQL AVEC FILTRE SOCIÉTÉ & SITE
//     // ======================================================
//     const query = `
//       WITH BudgetAnnuel AS (
//         SELECT TOP 1
//           b.idbudget,
//           b.codebudget,
//           b.libelle,
//           b.datedebut,
//           b.datefin
//         FROM Budget b
//         WHERE b.idsociete = :idsociete
//           ${idsite ? "AND b.idsite = :idsite" : ""}
//           AND b.typebudget = 'Annuel'
//           AND b.actif = 1
//           AND YEAR(b.datedebut) = :annee
//       ),

//       BudgetsMensuels AS (
//         SELECT
//           bm.idbudget,
//           bm.codebudget,
//           bm.libelle,
//           bm.datedebut,
//           bm.datefin,
//           MONTH(bm.datedebut) as mois_numero,
//           CASE MONTH(bm.datedebut)
//             WHEN 1 THEN 'Janvier'
//             WHEN 2 THEN 'Février'
//             WHEN 3 THEN 'Mars'
//             WHEN 4 THEN 'Avril'
//             WHEN 5 THEN 'Mai'
//             WHEN 6 THEN 'Juin'
//             WHEN 7 THEN 'Juillet'
//             WHEN 8 THEN 'Août'
//             WHEN 9 THEN 'Septembre'
//             WHEN 10 THEN 'Octobre'
//             WHEN 11 THEN 'Novembre'
//             WHEN 12 THEN 'Décembre'
//           END as mois_nom,
//           bm.idbudgetparent
//         FROM Budget bm
//         INNER JOIN BudgetAnnuel ba ON ba.idbudget = bm.idbudgetparent
//         WHERE bm.typebudget = 'Mensuel'
//       ),

//       ConsommationMensuelle AS (
//         SELECT
//           bm.idbudget,
//           bm.mois_numero,
//           bm.mois_nom,
//           bm.codebudget,
//           bm.libelle,
//           -- Montant prévisionnel
//           ISNULL((
//             SELECT SUM(montantprevisionsociete)
//             FROM BudgetDepartementNature bdn
//             WHERE bdn.idbudget = bm.idbudget
//               AND bdn.idsociete = :idsociete
//               ${idsite ? "AND bdn.idsite = :idsite" : ""}
//           ), 0) as montant_previsionnel,
//           -- Montant consommé
//           ISNULL((
//             SELECT SUM(ld.montantdemande)
//             FROM LigneDemande ld
//             INNER JOIN EnteteDemande ed ON ed.iddemande = ld.iddemande
//             WHERE ld.idbudget = bm.idbudget
//               AND ed.statut = 1
//               AND ed.idsociete = :idsociete
//               ${idsite ? "AND ed.idsite = :idsite" : ""}
//           ), 0) as montant_consomme
//         FROM BudgetsMensuels bm
//       ),

//       Totaux AS (
//         SELECT
//           SUM(montant_previsionnel) as total_previsionnel,
//           SUM(montant_consomme) as total_consomme
//         FROM ConsommationMensuelle
//       )

//       SELECT
//         ba.codebudget as code_budget_annuel,
//         ba.libelle as libelle_budget_annuel,
//         YEAR(ba.datedebut) as annee,
//         (
//           SELECT
//             cm.mois_numero,
//             cm.mois_nom,
//             cm.codebudget as code_budget_mensuel,
//             cm.libelle as libelle_budget_mensuel,
//             cm.montant_previsionnel,
//             cm.montant_consomme,
//             CASE
//               WHEN cm.montant_previsionnel > 0
//               THEN ROUND((cm.montant_consomme * 100.0 / cm.montant_previsionnel), 2)
//               ELSE 0
//             END as taux_consommation
//           FROM ConsommationMensuelle cm
//           ORDER BY cm.mois_numero
//           FOR JSON PATH
//         ) as budgets_mensuels,
//         (
//           SELECT
//             t.total_previsionnel,
//             t.total_consomme,
//             CASE
//               WHEN t.total_previsionnel > 0
//               THEN ROUND((t.total_consomme * 100.0 / t.total_previsionnel), 2)
//               ELSE 0
//             END as taux_consommation_annuel
//           FROM Totaux t
//           FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
//         ) as totaux_annuels
//       FROM BudgetAnnuel ba
//     `;

//     // ======================================================
//     // 2. EXECUTION
//     // ======================================================
//     const replacements = { idsociete, annee: anneeCourante };
//     if (idsite) replacements.idsite = idsite;

//     const result = await sequelize.query(query, {
//       replacements,
//       type: QueryTypes.SELECT,
//     });

//     if (!result || result.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: `Aucun budget annuel trouvé pour ${anneeCourante}`,
//       });
//     }

//     // ======================================================
//     // 3. PARSING JSON
//     // ======================================================
//     const budgetData = result[0];
//     budgetData.budgets_mensuels = JSON.parse(
//       budgetData.budgets_mensuels || "[]",
//     );
//     budgetData.totaux_annuels = JSON.parse(budgetData.totaux_annuels || "{}");

//     res.json({
//       success: true,
//       data: budgetData,
//     });
//   } catch (error) {
//     console.error("Erreur budget annuel:", error);
//     res.status(500).json({
//       success: false,
//       message: "Erreur serveur",
//       error: error.message,
//     });
//   }
// };

// const {
//   Departement,
//   AffectationDepartementNature,
//   NatureOperation,
// } = require("../models/index");
// const { fn, col } = require("sequelize");

// /**
//  * GET : Nombre de natures par département
//  */
// exports.countNatureByDepartement = async (req, res) => {
//   try {
//     const results = await Departement.findAll({
//       attributes: [
//         "iddepartement",
//         "codedept",
//         "libelle",

//         // COUNT pivot.idnature
//         [fn("COUNT", col("affectations.idnature")), "totalNatures"],
//       ],

//       include: [
//         {
//           model: AffectationDepartementNature,
//           as: "affectations",
//           attributes: [],
//         },
//       ],

//       group: [
//         "Departement.iddepartement",
//         "Departement.codedept",
//         "Departement.libelle",
//       ],
//     });

//     res.status(200).json({ success: true, data: results });
//   } catch (error) {
//     console.error("Erreur stats :", error);
//     res.status(500).json({
//       success: false,
//       message: "Erreur serveur",
//       error: error.message,
//     });
//   }
// };

const {
  Departement,
  AffectationDepartementNature,
  NatureOperation,
  EnteteDemande,
  LigneDemande,
} = require("../models/index");

const { fn, col, literal } = require("sequelize");

exports.getTauxConsommationNatureByDepartement = async (req, res) => {
  try {
    const results = await Departement.findAll({
      attributes: [
        "iddepartement",
        "codedept",
        "libelle",

        // Nombres
        [
          fn("COUNT", literal("DISTINCT affectations.idnature")),
          "totalNatures",
        ],
        [
          fn("COUNT", literal("DISTINCT [demandes->lignes].idnature")),
          "naturesUtilisees",
        ],

        // Taux
        [
          literal(`
            CASE
              WHEN COUNT(DISTINCT affectations.idnature) = 0 THEN 0
              ELSE (COUNT(DISTINCT [demandes->lignes].idnature) * 100.0) /
                   COUNT(DISTINCT affectations.idnature)
            END
          `),
          "tauxConsommation",
        ],

        // Noms des natures affectées (subquery)
        [
          literal(`(
            SELECT STRING_AGG(n2.libelle, ', ')
            FROM AffectationDepartementNature a2
            INNER JOIN NatureOperation n2 ON a2.idnature = n2.idnature
            WHERE a2.iddepartement = Departement.iddepartement
          )`),
          "naturesAffectees",
        ],

        // Noms des natures utilisées
        [
          literal(`(
            SELECT STRING_AGG(n3.libelle, ', ')
            FROM EnteteDemande e2
            INNER JOIN LigneDemande l2 ON e2.iddemande = l2.iddemande
            INNER JOIN NatureOperation n3 ON l2.idnature = n3.idnature
            WHERE e2.iddepartement = Departement.iddepartement
          )`),
          "naturesUtiliseesLibelle",
        ],
      ],

      include: [
        {
          model: AffectationDepartementNature,
          as: "affectations",
          attributes: [],
          required: false,
        },
        {
          model: EnteteDemande,
          as: "demandes",
          attributes: [],
          required: false,
          include: [
            {
              model: LigneDemande,
              as: "lignes",
              attributes: [],
              required: false,
            },
          ],
        },
      ],

      group: [
        "Departement.iddepartement",
        "Departement.codedept",
        "Departement.libelle",
      ],
    });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Erreur stats :", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
  }
};

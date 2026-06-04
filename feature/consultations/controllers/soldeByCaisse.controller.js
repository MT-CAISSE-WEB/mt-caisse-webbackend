const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");

exports.getStatsCaisse = async (req, res) => {
  try {
    const { periode = "month", idcaisse } = req.query;

    // ===== Expression période =====
    let periodSelect = "";
    let periodGroup = "";

    switch (periode) {
      case "week":
        periodSelect = `
          CONCAT(
            DATEPART(YEAR, E.dateoperation),
            '-W',
            RIGHT('00' + CAST(DATEPART(WEEK, E.dateoperation) AS VARCHAR), 2)
          )
        `;
        periodGroup = `
          DATEPART(YEAR, E.dateoperation),
          DATEPART(WEEK, E.dateoperation)
        `;
        break;

      case "year":
        periodSelect = `CAST(YEAR(E.dateoperation) AS VARCHAR)`;
        periodGroup = `YEAR(E.dateoperation)`;
        break;

      case "month":
      default:
        periodSelect = `FORMAT(E.dateoperation, 'yyyy-MM')`;
        periodGroup = `FORMAT(E.dateoperation, 'yyyy-MM')`;
        break;
    }

    // ===== Filtre année courante + caisse =====
    let whereConditions = `
      YEAR(E.dateoperation) = YEAR(GETDATE())
    `;

    if (idcaisse) {
      whereConditions += ` AND E.idcaisse = :idcaisse`;
    }

    const sql = `
      SELECT
        periode,
        total_encaissement,
        total_decaissement,
        (total_encaissement - total_decaissement) AS solde_periode,

        SUM(total_encaissement - total_decaissement)
          OVER (
            ORDER BY periode
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
          ) AS solde_cumule

      FROM (
        SELECT
          ${periodSelect} AS periode,

          SUM(CASE 
              WHEN T.codtypeoperation = 'ENC'
              THEN T.montantref ELSE 0 END) AS total_encaissement,

          SUM(CASE 
              WHEN T.codtypeoperation = 'DEC'
              THEN T.montantref ELSE 0 END) AS total_decaissement

        FROM EnteteOperationCaisse E
        INNER JOIN TypeOperation T
          ON T.idoperation = E.idoperation

        WHERE ${whereConditions}

        GROUP BY ${periodGroup}
      ) X

      ORDER BY periode
    `;

    const data = await sequelize.query(sql, {
      replacements: { idcaisse },
      type: QueryTypes.SELECT,
    });

    res.json({
      success: true,
      annee: new Date().getFullYear(),
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const mssql = require("mssql");
const { poolPromise } = require("../../../config/db");

class SocieteRepository {
  static async getSocieteIdByCode(codesociete) {
    try {
      const pool = await poolPromise;
      const request = pool.request();
      request.input("codesociete", mssql.NVarChar, codesociete);
      const result = await request.query(
        "SELECT idsociete FROM Societe WHERE codesociete = @codesociete",
      );
      return result.recordset[0]?.idsociete || null;
    } catch (error) {
      throw new Error(
        `Erreur lors de la recherche de la société: ${error.message}`,
      );
    }
  }
}

module.exports = SocieteRepository;

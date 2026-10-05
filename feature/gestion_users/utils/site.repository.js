const mssql = require("mssql");
const { poolPromise } = require("../../../config/db");

class SiteRepository {
  static async getSiteIdByCode(codesite) {
    try {
      const pool = await poolPromise;
      const request = pool.request();
      request.input("codesite", mssql.NVarChar, codesite);
      const result = await request.query(
        "SELECT idsite FROM Site WHERE codesite = @codesite",
      );
      return result.recordset[0]?.idsite || null;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche du site: ${error.message}`);
    }
  }
}

module.exports = SiteRepository;

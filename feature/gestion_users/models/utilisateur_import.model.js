const mssql = require("mssql");
const { poolPromise } = require("../../../config/db");
const AuthService = require("../utils/auth.service");

class UserModel {
  /**
   * Récupérer tous les utilisateurs avec leurs relations
   */
  static async findAll(filters = {}, page = 1, limit = 50) {
    const pool = await poolPromise;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        u.idutilisateur,
        u.codeutilisateur,
        u.nom,
        u.prenom,
        u.email,
        u.telephone,
        u.login,
        u.adresse,
        u.typeentitesite,
        u.typeentitedepartement,
        u.typeentitesociete,
        u.acheteur,
        u.createdat,
        u.createdby,
        s.codesociete,
        s.raisonsociale,
        st.codesite,
        st.libelle as site_libelle,
        STRING_AGG(r.code, ',') as roles
      FROM Utilisateur u
      LEFT JOIN Societe s ON u.idsociete = s.idsociete
      LEFT JOIN Site st ON u.idsite = st.idsite
      LEFT JOIN utilisateur_role ur ON u.idutilisateur = ur.idutilisateur
      LEFT JOIN role r ON ur.idrole = r.idrole
      WHERE 1=1
    `;

    const params = [];

    // Filtres
    if (filters.search) {
      query += ` AND (u.nom LIKE @search OR u.prenom LIKE @search OR u.email LIKE @search OR u.codeutilisateur LIKE @search)`;
      params.push({
        name: "search",
        type: mssql.NVarChar,
        value: `%${filters.search}%`,
      });
    }

    if (filters.idsociete) {
      query += ` AND u.idsociete = @idsociete`;
      params.push({
        name: "idsociete",
        type: mssql.UniqueIdentifier,
        value: filters.idsociete,
      });
    }

    if (filters.idsite) {
      query += ` AND u.idsite = @idsite`;
      params.push({
        name: "idsite",
        type: mssql.UniqueIdentifier,
        value: filters.idsite,
      });
    }

    query += `
      GROUP BY 
        u.idutilisateur, u.codeutilisateur, u.nom, u.prenom, u.email, 
        u.telephone, u.login, u.adresse, u.typeentitesite, 
        u.typeentitedepartement, u.typeentitesociete, u.acheteur, u.createdat, u.createdby,
        s.codesociete, s.raisonsociale,
        st.codesite, st.libelle
      ORDER BY u.createdat DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    params.push(
      { name: "offset", type: mssql.Int, value: offset },
      { name: "limit", type: mssql.Int, value: limit },
    );

    const request = pool.request();
    params.forEach((p) => request.input(p.name, p.type, p.value));

    const result = await request.query(query);

    // Récupérer le total
    let countQuery = `
      SELECT COUNT(DISTINCT u.idutilisateur) as total
      FROM Utilisateur u
      WHERE 1=1
    `;

    const countRequest = pool.request();
    if (filters.search) {
      countQuery += ` AND (u.nom LIKE @search OR u.prenom LIKE @search OR u.email LIKE @search OR u.codeutilisateur LIKE @search)`;
      countRequest.input("search", mssql.NVarChar, `%${filters.search}%`);
    }

    const countResult = await countRequest.query(countQuery);

    return {
      data: result.recordset,
      pagination: {
        total: countResult.recordset[0].total,
        page,
        limit,
        totalPages: Math.ceil(countResult.recordset[0].total / limit),
      },
    };
  }

  /**
   * Récupérer tous les utilisateurs pour l'export
   */
  static async findAllForExport(filters = {}) {
    const pool = await poolPromise;

    let query = `
      SELECT 
        u.codeutilisateur,
        u.nom,
        u.prenom,
        u.email,
        u.telephone,
        u.login,
        u.adresse,
        u.typeentitesite,
        u.typeentitedepartement,
        u.typeentitesociete,
        u.acheteur,
        u.createdat,
        s.codesociete,
        s.raisonsociale,
        st.codesite,
        st.libelle as site_libelle,
        STRING_AGG(r.code, ',') as roles
      FROM Utilisateur u
      LEFT JOIN Societe s ON u.idsociete = s.idsociete
      LEFT JOIN Site st ON u.idsite = st.idsite
      LEFT JOIN utilisateur_role ur ON u.idutilisateur = ur.idutilisateur
      LEFT JOIN role r ON ur.idrole = r.idrole
      WHERE 1=1
    `;

    const params = [];

    if (filters.idsociete) {
      query += ` AND u.idsociete = @idsociete`;
      params.push({
        name: "idsociete",
        type: mssql.UniqueIdentifier,
        value: filters.idsociete,
      });
    }

    if (filters.idsite) {
      query += ` AND u.idsite = @idsite`;
      params.push({
        name: "idsite",
        type: mssql.UniqueIdentifier,
        value: filters.idsite,
      });
    }

    query += `
      GROUP BY 
        u.codeutilisateur, u.nom, u.prenom, u.email, u.telephone, 
        u.login, u.adresse, u.typeentitesite, u.typeentitedepartement, 
        u.typeentitesociete, u.acheteur, u.createdat,
        s.codesociete, s.raisonsociale,
        st.codesite, st.libelle
      ORDER BY u.codeutilisateur
    `;

    const request = pool.request();
    params.forEach((p) => request.input(p.name, p.type, p.value));

    const result = await request.query(query);
    return result.recordset || [];
  }

  /**
   * Créer un utilisateur avec hash Argon2
   */
  /**
   * Créer un utilisateur avec hash Argon2
   */
  static async create(userData) {
    const pool = await poolPromise;
    const {
      codeutilisateur,
      nom,
      prenom,
      email,
      telephone,
      login,
      password,
      adresse,
      idsociete,
      idsite,
      typeentitesite,
      typeentitedepartement,
      typeentitesociete,
      acheteur,
      createdby,
      roles = [],
    } = userData;

    const transaction = new mssql.Transaction(pool);
    await transaction.begin();

    try {
      const request = transaction.request();
      const idutilisateur = require("crypto").randomUUID();

      // Insérer l'utilisateur
      const insertQuery = `
            INSERT INTO Utilisateur (
                idutilisateur, codeutilisateur, nom, prenom, email, telephone,
                login, password, adresse, idsociete, idsite,
                typeentitesite, typeentitedepartement, typeentitesociete,
                acheteur, createdat, createdby
            ) VALUES (
                @idutilisateur, @codeutilisateur, @nom, @prenom, @email, @telephone,
                @login, @password, @adresse, @idsociete, @idsite,
                @typeentitesite, @typeentitedepartement, @typeentitesociete,
                @acheteur, GETDATE(), @createdby
            )
        `;

      request.input("idutilisateur", mssql.UniqueIdentifier, idutilisateur);
      request.input("codeutilisateur", mssql.NVarChar, codeutilisateur);
      request.input("nom", mssql.NVarChar, nom);
      request.input("prenom", mssql.NVarChar, prenom);
      request.input("email", mssql.NVarChar, email);
      request.input("telephone", mssql.NVarChar, telephone);
      request.input("login", mssql.NVarChar, login);
      request.input("password", mssql.NVarChar, password);
      request.input("adresse", mssql.NVarChar, adresse);
      request.input("idsociete", mssql.UniqueIdentifier, idsociete);
      request.input("idsite", mssql.UniqueIdentifier, idsite);
      request.input("typeentitesite", mssql.Int, typeentitesite || 0);
      request.input(
        "typeentitedepartement",
        mssql.Int,
        typeentitedepartement || 0,
      );
      request.input("typeentitesociete", mssql.Int, typeentitesociete || 0);
      request.input("acheteur", mssql.Int, acheteur || 0);
      request.input("createdby", mssql.NVarChar, createdby);

      await request.query(insertQuery);

      // Assigner les rôles avec la bonne syntaxe
      if (roles && roles.length > 0) {
        for (const roleCode of roles) {
          // Nettoyer le code du rôle (enlever les espaces)
          const cleanRoleCode = roleCode.trim();

          // Utiliser request.input pour la requête
          const roleRequest = transaction.request();
          roleRequest.input("code", mssql.NVarChar, cleanRoleCode);

          const roleResult = await roleRequest.query(
            `SELECT idrole FROM role WHERE code = @code`,
          );

          if (roleResult.recordset.length > 0) {
            const roleId = roleResult.recordset[0].idrole;

            const roleRequest2 = transaction.request();
            roleRequest2.input(
              "idutilisateur",
              mssql.UniqueIdentifier,
              idutilisateur,
            );
            roleRequest2.input("idrole", mssql.Int, roleId);
            roleRequest2.input("createdby", mssql.NVarChar, createdby);

            await roleRequest2.query(`
                        INSERT INTO utilisateur_role (idutilisateur, idrole, createdat, createdby)
                        VALUES (@idutilisateur, @idrole, GETDATE(), @createdby)
                    `);
          } else {
            console.warn(`⚠️ Rôle non trouvé: ${cleanRoleCode}`);
          }
        }
      }

      await transaction.commit();
      return idutilisateur;
    } catch (error) {
      console.error("❌ Erreur création utilisateur:", error);
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Mettre à jour un utilisateur (sans le mot de passe)
   */
  static async update(idutilisateur, userData) {
    const pool = await poolPromise;
    const {
      nom,
      prenom,
      email,
      telephone,
      adresse,
      idsociete,
      idsite,
      typeentitesite,
      typeentitedepartement,
      typeentitesociete,
      acheteur,
      updatedby,
      roles = [],
    } = userData;

    const transaction = new mssql.Transaction(pool);
    await transaction.begin();

    try {
      const request = transaction.request();

      // Mettre à jour l'utilisateur
      const updateQuery = `
        UPDATE Utilisateur SET
          nom = @nom,
          prenom = @prenom,
          email = @email,
          telephone = @telephone,
          adresse = @adresse,
          idsociete = @idsociete,
          idsite = @idsite,
          typeentitesite = @typeentitesite,
          typeentitedepartement = @typeentitedepartement,
          typeentitesociete = @typeentitesociete,
          acheteur = @acheteur,
          updatedat = GETDATE(),
          updatedby = @updatedby
        WHERE idutilisateur = @idutilisateur
      `;

      request.input("idutilisateur", mssql.UniqueIdentifier, idutilisateur);
      request.input("nom", mssql.NVarChar, nom);
      request.input("prenom", mssql.NVarChar, prenom);
      request.input("email", mssql.NVarChar, email);
      request.input("telephone", mssql.NVarChar, telephone);
      request.input("adresse", mssql.NVarChar, adresse);
      request.input("idsociete", mssql.UniqueIdentifier, idsociete);
      request.input("idsite", mssql.UniqueIdentifier, idsite);
      request.input("typeentitesite", mssql.Int, typeentitesite || 0);
      request.input(
        "typeentitedepartement",
        mssql.Int,
        typeentitedepartement || 0,
      );
      request.input("typeentitesociete", mssql.Int, typeentitesociete || 0);
      request.input("acheteur", mssql.Int, acheteur || 0);
      request.input("updatedby", mssql.NVarChar, updatedby);

      await request.query(updateQuery);

      // Supprimer les anciens rôles
      const deleteRequest = transaction.request();
      deleteRequest.input(
        "idutilisateur",
        mssql.UniqueIdentifier,
        idutilisateur,
      );
      await deleteRequest.query(`
        DELETE FROM utilisateur_role WHERE idutilisateur = @idutilisateur
      `);

      // Assigner les nouveaux rôles
      if (roles && roles.length > 0) {
        for (const roleCode of roles) {
          const roleRequest = transaction.request();
          const roleResult = await roleRequest.query(
            `SELECT idrole FROM role WHERE code = @code`,
            { code: roleCode },
          );

          if (roleResult.recordset.length > 0) {
            const roleRequest2 = transaction.request();
            roleRequest2.input(
              "idutilisateur",
              mssql.UniqueIdentifier,
              idutilisateur,
            );
            roleRequest2.input(
              "idrole",
              mssql.Int,
              roleResult.recordset[0].idrole,
            );
            roleRequest2.input("updatedby", mssql.NVarChar, updatedby);
            await roleRequest2.query(`
              INSERT INTO utilisateur_role (idutilisateur, idrole, createdat, createdby)
              VALUES (@idutilisateur, @idrole, GETDATE(), @updatedby)
            `);
          }
        }
      }

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Mettre à jour le mot de passe d'un utilisateur avec Argon2
   */
  static async updatePassword(idutilisateur, newPassword, updatedby) {
    const pool = await poolPromise;

    try {
      // Hasher le nouveau mot de passe avec Argon2
      const hashedPassword = await AuthService.hashPassword(newPassword);

      const request = pool.request();
      request.input("idutilisateur", mssql.UniqueIdentifier, idutilisateur);
      request.input("password", mssql.NVarChar, hashedPassword);
      request.input("updatedby", mssql.NVarChar, updatedby);

      await request.query(`
        UPDATE Utilisateur 
        SET password = @password,
            updatedat = GETDATE(),
            updatedby = @updatedby
        WHERE idutilisateur = @idutilisateur
      `);

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Vérifier si un utilisateur existe
   */
  static async exists(field, value) {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("value", mssql.NVarChar, value);
    const result = await request.query(`
      SELECT COUNT(*) as count FROM Utilisateur WHERE ${field} = @value
    `);
    return result.recordset[0].count > 0;
  }

  /**
   * Obtenir un utilisateur par ID
   */
  static async findById(idutilisateur) {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("idutilisateur", mssql.UniqueIdentifier, idutilisateur);

    const result = await request.query(`
      SELECT 
        u.*,
        s.codesociete,
        s.raisonsociale,
        st.codesite,
        st.libelle as site_libelle,
        STRING_AGG(r.code, ',') as roles
      FROM Utilisateur u
      LEFT JOIN Societe s ON u.idsociete = s.idsociete
      LEFT JOIN Site st ON u.idsite = st.idsite
      LEFT JOIN utilisateur_role ur ON u.idutilisateur = ur.idutilisateur
      LEFT JOIN role r ON ur.idrole = r.idrole
      WHERE u.idutilisateur = @idutilisateur
      GROUP BY 
        u.idutilisateur, u.codeutilisateur, u.nom, u.prenom, u.email, 
        u.telephone, u.login, u.password, u.adresse, u.typeentitesite, 
        u.typeentitedepartement, u.typeentitesociete, u.acheteur, u.createdat, u.createdby, u.updatedat, u.updatedby,
        s.codesociete, s.raisonsociale,
        st.codesite, st.libelle
    `);

    return result.recordset[0] || null;
  }

  /**
   * Obtenir un utilisateur par login pour l'authentification
   */
  static async findByLogin(login) {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("login", mssql.NVarChar, login);

    const result = await request.query(`
      SELECT 
        u.*,
        STRING_AGG(r.code, ',') as roles
      FROM Utilisateur u
      LEFT JOIN utilisateur_role ur ON u.idutilisateur = ur.idutilisateur
      LEFT JOIN role r ON ur.idrole = r.idrole
      WHERE u.login = @login
      GROUP BY 
        u.idutilisateur, u.codeutilisateur, u.nom, u.prenom, u.email, 
        u.telephone, u.login, u.password, u.adresse, u.typeentitesite, 
        u.typeentitedepartement, u.typeentitesociete, u.acheteur, u.createdat, u.createdby, u.updatedat, u.updatedby
    `);

    return result.recordset[0] || null;
  }

  /**
   * Obtenir les permissions d'un utilisateur
   */
  static async getPermissions(idutilisateur) {
    const pool = await poolPromise;
    const request = pool.request();
    request.input("idutilisateur", mssql.UniqueIdentifier, idutilisateur);

    const result = await request.query(`
      SELECT DISTINCT p.code
      FROM permission p
      INNER JOIN role_permission rp ON p.idpermission = rp.idpermission
      INNER JOIN utilisateur_role ur ON rp.idrole = ur.idrole
      WHERE ur.idutilisateur = @idutilisateur
    `);

    return result.recordset.map((r) => r.code);
  }
}

module.exports = UserModel;

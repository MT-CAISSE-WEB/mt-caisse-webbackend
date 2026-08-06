const UserModel = require("../models/utilisateur_import.model");
const AuthService = require("../utils/auth.service");
const {
  validateUserData,
  validateUserImport,
} = require("../utils/user.validator");
const { parseCSV, generateCSV } = require("../utils/csv.util");
const { AppError } = require("../utils/error.middleware");
const SocieteRepository = require("../utils/societe.repository");
const SiteRepository = require("../utils/site.repository");

class UserService {
  /**
   * Récupérer la liste des utilisateurs avec pagination
   */
  static async getUsers(filters, page, limit) {
    try {
      return await UserModel.findAll(filters, page, limit);
    } catch (error) {
      throw new AppError(
        "Erreur lors de la récupération des utilisateurs",
        500,
      );
    }
  }

  /**
   * Exporter les utilisateurs en CSV
   */
  static async exportUsers(filters = {}) {
    try {
      // 1. Récupérer les utilisateurs
      const users = (await UserModel.findAllForExport(filters)) || [];

      if (users.length === 0) {
        throw new AppError("Aucun utilisateur à exporter", 404);
      }

      // 2. Transformer les données pour l'export avec des noms de colonnes clairs
      const exportData = users.map((user) => ({
        codeutilisateur: user.codeutilisateur || "",
        nom: user.nom || "",
        prenom: user.prenom || "",
        email: user.email || "",
        telephone: user.telephone ? String(user.telephone) : "",
        login: user.login || "",
        adresse: user.adresse || "",
        typeentitesite: user.typeentitesite ?? 0,
        typeentitedepartement: user.typeentitedepartement ?? 0,
        typeentitesociete: user.typeentitesociete ?? 0,
        acheteur: user.acheteur ?? 0,
        createdat: user.createdat
          ? new Date(user.createdat).toLocaleDateString("fr-FR")
          : "",
        codesociete: user.codesociete || "",
        raisonsociale: user.raisonsociale || "",
        codesite: user.codesite || "",
        site_libelle: user.site_libelle || "",
        roles: user.roles || "",
      }));

      // 3. Définir les colonnes avec des noms plus lisibles
      const columns = [
        { key: "codeutilisateur", label: "Code Utilisateur" },
        { key: "nom", label: "Nom" },
        { key: "prenom", label: "Prénom" },
        { key: "email", label: "Email" },
        { key: "telephone", label: "Téléphone" },
        { key: "login", label: "Login" },
        { key: "adresse", label: "Adresse" },
        { key: "typeentitesite", label: "Type Entité Site" },
        { key: "typeentitedepartement", label: "Type Entité Département" },
        { key: "typeentitesociete", label: "Type Entité Société" },
        { key: "acheteur", label: "Acheteur" },
        { key: "createdat", label: "Date Création" },
        { key: "codesociete", label: "Code Société" },
        { key: "raisonsociale", label: "Raison Sociale" },
        { key: "codesite", label: "Code Site" },
        { key: "site_libelle", label: "Site" },
        { key: "roles", label: "Rôles" },
      ];

      // 4. Générer le CSV avec les colonnes formatées
      const csv = await generateCSV(exportData, {
        columns: columns,
        delimiter: ";",
        header: true,
        quote: true,
      });

      return csv;
    } catch (error) {
      console.error("❌ Erreur Service exportUsers:", error);
      throw error;
    }
  }

  // Récupérer l'ID d'une société depuis son code
  static async getSocieteIdByCode(codesociete) {
    return await SocieteRepository.getSocieteIdByCode(codesociete);
  }

  // Récupérer l'ID d'un site depuis son code
  static async getSiteIdByCode(codesite) {
    return await SiteRepository.getSiteIdByCode(codesite);
  }

  /**
   * Valider une ligne d'import avec toutes les vérifications
   */
  static async validateImportRow(row) {
    // 1. Validation syntaxique - NE PAS OUBLIER await
    const validation = await validateUserImport(row);

    // ✅ Si validation est undefined ou null, on initialise
    if (!validation) {
      return {
        isValid: false,
        errors: ["Erreur de validation inattendue"],
        data: row,
      };
    }

    // Copier les données validées
    const data = { ...validation.data };
    const allErrors = [...(validation.errors || [])];

    // 2. Vérifications en base (seulement si la validation syntaxique est OK)
    if (validation.isValid) {
      // Vérifier la société
      if (data.codesociete) {
        try {
          const idsociete = await SocieteRepository.getSocieteIdByCode(
            data.codesociete,
          );
          if (!idsociete) {
            allErrors.push(
              `La société avec le code "${data.codesociete}" n'existe pas`,
            );
          } else {
            data.idsociete = idsociete;
          }
        } catch (error) {
          allErrors.push(
            `Erreur lors de la vérification de la société: ${error.message}`,
          );
        }
      }

      // Vérifier le site (optionnel)
      if (data.codesite) {
        try {
          const idsite = await SiteRepository.getSiteIdByCode(data.codesite);
          if (!idsite) {
            allErrors.push(
              `Le site avec le code "${data.codesite}" n'existe pas`,
            );
          } else {
            data.idsite = idsite;
          }
        } catch (error) {
          allErrors.push(
            `Erreur lors de la vérification du site: ${error.message}`,
          );
        }
      }

      // 3. Vérifications d'unicité
      if (data.email) {
        try {
          const emailExists = await UserModel.exists("email", data.email);
          if (emailExists) {
            allErrors.push(`L'email "${data.email}" existe déjà`);
          }
        } catch (error) {
          allErrors.push(
            `Erreur lors de la vérification de l'email: ${error.message}`,
          );
        }
      }

      if (data.login) {
        try {
          const loginExists = await UserModel.exists("login", data.login);
          if (loginExists) {
            allErrors.push(`Le login "${data.login}" existe déjà`);
          }
        } catch (error) {
          allErrors.push(
            `Erreur lors de la vérification du login: ${error.message}`,
          );
        }
      }

      if (data.codeutilisateur) {
        try {
          const codeExists = await UserModel.exists(
            "codeutilisateur",
            data.codeutilisateur,
          );
          if (codeExists) {
            allErrors.push(
              `Le code utilisateur "${data.codeutilisateur}" existe déjà`,
            );
          }
        } catch (error) {
          allErrors.push(
            `Erreur lors de la vérification du code: ${error.message}`,
          );
        }
      }
    }

    // ✅ Retourner toujours un objet complet
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      data: data,
      originalData: row, // Garder les données originales pour référence
    };
  }

  /**
   * Importer des utilisateurs depuis un CSV
   */
  static async importUsers(csvData, createdBy) {
    const result = {
      success: [],
      errors: [],
      total: 0,
    };

    try {
      const parsedData = await parseCSV(csvData);
      result.total = parsedData.length;

      if (parsedData.length === 0) {
        throw new AppError("Le fichier CSV est vide", 400);
      }

      for (let i = 0; i < parsedData.length; i++) {
        const row = parsedData[i];
        const rowNumber = i + 2;

        try {
          // Utiliser la nouvelle méthode de validation
          const validation = await this.validateImportRow(row);

          if (!validation.isValid) {
            result.errors.push({
              row: rowNumber,
              errors: validation.errors,
            });
            continue;
          }

          // Hash du mot de passe
          const hashedPassword = await AuthService.hashPassword(
            validation.data.password,
          );

          // Créer l'utilisateur
          await UserModel.create({
            ...validation.data,
            password: hashedPassword,
            createdby: createdBy,
            idsociete: validation.data.idsociete,
            idsite: validation.data.idsite,
            roles: validation.data.roles
              ? validation.data.roles.split(",").map((r) => r.trim())
              : [],
          });

          result.success.push({
            row: rowNumber,
            user: validation.data.email,
          });
        } catch (error) {
          result.errors.push({
            row: rowNumber,
            errors: [error.message || "Erreur inattendue"],
          });
        }
      }

      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        "Erreur lors de l'import des utilisateurs: " + error.message,
        500,
      );
    }
  }

  /**
   * Créer un utilisateur individuellement
   */
  static async createUser(userData, createdBy) {
    try {
      // Valider les données
      const validation = validateUserData(userData);
      if (!validation.isValid) {
        throw new AppError(validation.errors.join(", "), 400);
      }

      // Vérifier les doublons
      const emailExists = await UserModel.exists("email", userData.email);
      if (emailExists) {
        throw new AppError("Cet email est déjà utilisé", 409);
      }

      const loginExists = await UserModel.exists("login", userData.login);
      if (loginExists) {
        throw new AppError("Ce login est déjà utilisé", 409);
      }

      const codeExists = await UserModel.exists(
        "codeutilisateur",
        userData.codeutilisateur,
      );
      if (codeExists) {
        throw new AppError("Ce code utilisateur est déjà utilisé", 409);
      }

      // Hash du mot de passe avec Argon2
      const hashedPassword = await AuthService.hashPassword(userData.password);

      // Créer l'utilisateur
      const id = await UserModel.create({
        ...userData,
        password: hashedPassword,
        createdby: createdBy,
      });

      return await UserModel.findById(id);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erreur lors de la création de l'utilisateur", 500);
    }
  }

  /**
   * Preview import - CORRIGÉ
   */
  static async previewImport(csvBuffer) {
    try {
      // Convertir le Buffer en string
      const csvString = csvBuffer.toString("utf8");

      // Vérifier que le CSV n'est pas vide
      if (!csvString || csvString.trim() === "") {
        throw new AppError("Le fichier CSV est vide", 400);
      }

      // Parser le CSV
      const parsedData = await parseCSV(csvString);

      if (!parsedData || parsedData.length === 0) {
        throw new AppError("Aucune donnée à importer", 400);
      }

      const preview = [];
      let validCount = 0;
      let invalidCount = 0;

      // Limiter à 10 lignes pour l'aperçu
      const maxLines = Math.min(parsedData.length, 10);

      for (let i = 0; i < maxLines; i++) {
        const row = parsedData[i];
        const rowNumber = i + 2; // +2 car ligne 1 = headers

        // Valider la ligne
        const validation = await this.validateImportRow(row);

        // ✅ Log de débogage
        console.log(`Ligne ${rowNumber}:`, {
          isValid: validation.isValid,
          errors: validation.errors,
          data: validation.data,
        });

        // Mettre à jour les statistiques
        if (validation.isValid) {
          validCount++;
        } else {
          invalidCount++;
        }

        // ✅ Construire l'objet preview avec TOUTES les données
        preview.push({
          rowNumber: rowNumber,
          // Données originales
          originalData: {
            codeutilisateur: row.codeutilisateur || "",
            nom: row.nom || "",
            prenom: row.prenom || "",
            email: row.email || "",
            login: row.login || "",
            password: row.password ? "********" : "", // Ne pas afficher le mot de passe
            codesociete: row.codesociete || "",
            codesite: row.codesite || "",
            typeentitesite: row.typeentitesite || "0",
            typeentitedepartement: row.typeentitedepartement || "0",
            typeentitesociete: row.typeentitesociete || "0",
            acheteur: row.acheteur || "0",
            roles: row.roles || "",
            adresse: row.adresse || "",
            telephone: row.telephone || "",
          },
          // Données validées avec IDs résolus
          validatedData: {
            codeutilisateur: validation.data?.codeutilisateur || "",
            nom: validation.data?.nom || "",
            prenom: validation.data?.prenom || "",
            email: validation.data?.email || "",
            login: validation.data?.login || "",
            codesociete: validation.data?.codesociete || "",
            codesite: validation.data?.codesite || "",
            idsociete: validation.data?.idsociete || null,
            idsite: validation.data?.idsite || null,
          },
          isValid: validation.isValid,
          errors: validation.errors || [],
          // Nombre d'erreurs
          errorCount: (validation.errors || []).length,
        });
      }

      // ✅ Retourner un objet complet
      return {
        preview: preview,
        stats: {
          total: parsedData.length,
          valid: validCount,
          invalid: invalidCount,
          previewed: preview.length,
        },
        totalRows: parsedData.length,
        previewLimit: maxLines,
      };
    } catch (error) {
      console.error("Erreur previewImport:", error);
      throw new AppError(
        "Erreur lors de l'aperçu de l'import: " + error.message,
        500,
      );
    }
  }

  /**
   * Mettre à jour un utilisateur
   */
  static async updateUser(idutilisateur, userData, updatedBy) {
    try {
      // Vérifier que l'utilisateur existe
      const existing = await UserModel.findById(idutilisateur);
      if (!existing) {
        throw new AppError("Utilisateur non trouvé", 404);
      }

      // Vérifier les doublons d'email (si changé)
      if (userData.email && userData.email !== existing.email) {
        const emailExists = await UserModel.exists("email", userData.email);
        if (emailExists) {
          throw new AppError("Cet email est déjà utilisé", 409);
        }
      }

      // Vérifier les doublons de login (si changé)
      if (userData.login && userData.login !== existing.login) {
        const loginExists = await UserModel.exists("login", userData.login);
        if (loginExists) {
          throw new AppError("Ce login est déjà utilisé", 409);
        }
      }

      // Mettre à jour
      await UserModel.update(idutilisateur, {
        ...userData,
        updatedby: updatedBy,
      });

      // Si un nouveau mot de passe est fourni, le mettre à jour avec Argon2
      if (userData.password) {
        await UserModel.updatePassword(
          idutilisateur,
          userData.password,
          updatedBy,
        );
      }

      return await UserModel.findById(idutilisateur);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erreur lors de la mise à jour de l'utilisateur", 500);
    }
  }

  /**
   * Authentifier un utilisateur
   */
  static async authenticate(login, password) {
    try {
      // Récupérer l'utilisateur
      const user = await UserModel.findByLogin(login);

      if (!user) {
        throw new AppError("Identifiants invalides", 401);
      }

      if (user.actif === 0) {
        throw new AppError("Compte désactivé", 401);
      }

      // Vérifier le mot de passe avec Argon2
      const isValid = await AuthService.verifyPassword(user.password, password);

      if (!isValid) {
        throw new AppError("Identifiants invalides", 401);
      }

      // Récupérer les permissions
      const permissions = await UserModel.getPermissions(user.idutilisateur);
      user.permissions = permissions;

      // Générer les tokens
      const accessToken = AuthService.generateToken(user);
      const refreshToken = AuthService.generateRefreshToken(user);

      // Supprimer le mot de passe avant de retourner
      delete user.password;

      return {
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erreur lors de l'authentification", 500);
    }
  }

  /**
   * Obtenir un template CSV pour l'import
   */
  static getImportTemplate() {
    const headers = [
      "codeutilisateur*",
      "nom*",
      "prenom*",
      "email*",
      "telephone",
      "login*",
      "password*",
      "adresse",
      "codesociete*",
      "codesite",
      "typeentitesite",
      "typeentitedepartement",
      "typeentitesociete",
      "acheteur",
      "roles",
    ];

    const example = {
      codeutilisateur: "EMP001",
      nom: "Dupont",
      prenom: "Jean",
      email: "jean.dupont@example.com",
      telephone: "+242061234567",
      login: "jdupont",
      password: "MotDePasse123!",
      adresse: "12 Rue de la Paix, Pointe-Noire",
      codesociete: "SOC001",
      codesite: "SIEGE",
      typeentitesite: "0",
      typeentitedepartement: "0",
      typeentitesociete: "1",
      acheteur: "0",
      roles: "ADMIN,USER", // Exemple plus clair
    };

    return {
      headers,
      example,
      downloadUrl: "/User/template/download", // ✅ Lien explicite
      instructions: [
        "⚠️ Les champs marqués d'un * sont obligatoires.",
        "🔹 codesociete : doit exister dans la base (ex: SOC001).",
        "🔹 codesite : doit exister dans la base (ex: SIEGE).",
        "🔹 typeentitesite/typeentitedepartement/typeentitesociete : 0 = Non, 1 = Oui.",
        "🔹 acheteur : 0 = Non, 1 = Oui.",
        "🔹 roles : codes des rôles séparés par des virgules (ex: ADMIN,USER).",
        "🔹 password : 8+ caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial (@$!%*?&).",
        "🔹 Le mot de passe sera automatiquement hashé avec Argon2id.",
      ],
    };
  }
}

module.exports = UserService;

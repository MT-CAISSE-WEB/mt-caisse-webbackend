const UserService = require("../services/user_import.service");
const { AppError } = require("../utils/error.middleware");

class UserController {
  /**
   * Récupérer la liste des utilisateurs
   */
  static async getUsers(req, res, next) {
    try {
      const {
        page = 1,
        limit = 50,
        search,
        idsociete,
        idsite,
        actif,
      } = req.query;

      const filters = {};
      if (search) filters.search = search;
      if (idsociete) filters.idsociete = idsociete;
      if (idsite) filters.idsite = idsite;
      if (actif !== undefined && actif !== "") filters.actif = parseInt(actif);

      const result = await UserService.getUsers(
        filters,
        parseInt(page),
        parseInt(limit),
      );

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Exporter les utilisateurs en CSV
   */
  static async exportUsers(req, res, next) {
    try {
      const csv = await UserService.exportUsers(req.query);

      if (!csv || typeof csv !== "string") {
        throw new AppError("Erreur de génération du CSV", 500);
      }

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=export_utilisateurs_${Date.now()}.csv`,
      );
      res.setHeader("Content-Length", Buffer.byteLength(csv, "utf8"));
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }

  static async previewImport(req, res, next) {
    try {
      if (!req.file) throw new AppError("Aucun fichier", 400);

      const preview = await UserService.previewImport(req.file.buffer);
      res.json({ success: true, data: preview });
    } catch (error) {
      console.error("Erreur previewImport:", error);
      next(error);
    }
  }

  /**
   * Importer des utilisateurs depuis un CSV
   */
  static async importUsers(req, res, next) {
    try {
      if (!req.file) {
        throw new AppError("Aucun fichier CSV fourni", 400);
      }

      const createdBy = req.user?.idutilisateur || "SYSTEM";
      const result = await UserService.importUsers(req.file.buffer, createdBy);

      res.status(200).json({
        success: true,
        message: `${result.success.length} utilisateur(s) importé(s) avec succès`,
        data: {
          total: result.total,
          success: result.success.length,
          errors: result.errors.length,
          details: result,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Créer un utilisateur
   */
  static async createUser(req, res, next) {
    try {
      const userData = req.body;
      const createdBy = req.user?.idutilisateur || "SYSTEM";

      const user = await UserService.createUser(userData, createdBy);

      res.status(201).json({
        success: true,
        message: "Utilisateur créé avec succès",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mettre à jour un utilisateur
   */
  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const userData = req.body;
      const updatedBy = req.user?.idutilisateur || "SYSTEM";

      const user = await UserService.updateUser(id, userData, updatedBy);

      res.status(200).json({
        success: true,
        message: "Utilisateur mis à jour avec succès",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtenir le template CSV d'import
   */
  static async getImportTemplate(req, res, next) {
    try {
      const template = UserService.getImportTemplate();

      res.status(200).json({
        success: true,
        data: template,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Télécharger le template CSV
   */
  static async downloadTemplate(req, res, next) {
    try {
      const template = UserService.getImportTemplate();

      // Générer le CSV avec generateCSV (gère les virgules/guillemets)
      const csv = await generateCSV([template.example], {
        header: true,
        columns: template.headers,
      });

      // Ajouter les instructions en commentaires (lignes commençant par #)
      const instructions = template.instructions
        .map((inst) => `# ${inst}`)
        .join("\n");

      const fullCsv = `${instructions}\n${csv}`;

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=template_import_utilisateurs.csv",
      );
      res.send(fullCsv);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;

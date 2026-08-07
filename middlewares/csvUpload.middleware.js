// middlewares/csvUpload.middleware.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuration du stockage temporaire
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/temp";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `correspondance-${uniqueSuffix}${path.extname(file.originalname)}`,
    );
  },
});

// Filtre pour accepter uniquement les CSV
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["text/csv", "application/vnd.ms-excel"];
  const allowedExtensions = [".csv"];

  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers CSV sont autorisés"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/**
 * Détecter le séparateur utilisé dans le CSV
 */
function detectSeparator(firstLine) {
  if (!firstLine) return ",";
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  return semicolonCount > commaCount ? ";" : ",";
}

// Middleware pour valider les colonnes du CSV
const validateCsvColumns = (requiredColumns) => {
  return (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Aucun fichier n'a été téléchargé",
      });
    }

    try {
      const csvContent = fs.readFileSync(req.file.path, "utf8");
      const lines = csvContent.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        throw new Error(
          "Le fichier CSV est vide ou ne contient pas de données",
        );
      }

      // Détecter le séparateur à partir de la première ligne
      const separator = detectSeparator(lines[0]);

      // Lire l'en-tête
      const headerLine = lines[0];
      const columns = headerLine
        .split(separator)
        .map((col) => col.trim().replace(/^"|"$/g, ""));

      // Vérifier les colonnes requises
      const missingColumns = requiredColumns.filter(
        (col) => !columns.includes(col),
      );

      if (missingColumns.length > 0) {
        throw new Error(
          `Colonnes manquantes: ${missingColumns.join(
            ", ",
          )}. Colonnes requises: ${requiredColumns.join(", ")}`,
        );
      }

      // Stocker les colonnes pour les utiliser plus tard
      req.csvColumns = columns;
      req.csvData = lines.slice(1); // Lignes de données (hors en-tête)

      next();
    } catch (error) {
      // Nettoyer le fichier en cas d'erreur
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };
};

// Middleware pour nettoyer le fichier après traitement
const cleanupUploadedFile = () => {
  return (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (error) {
          console.error("Erreur lors du nettoyage du fichier:", error);
        }
      }
      originalSend.call(this, data);
    };
    next();
  };
};

module.exports = {
  upload,
  validateCsvColumns,
  cleanupUploadedFile,
};

const multer = require("multer");
const path = require("path");
const { AppError } = require("./error.middleware");

// Configuration de multer en mémoire
const storage = multer.memoryStorage();

// Filtre pour n'accepter que les fichiers CSV
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["text/csv", "application/vnd.ms-excel"];
  const allowedExtensions = [".csv"];

  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  if (allowedMimeTypes.includes(mimeType) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError("Seuls les fichiers CSV sont acceptés", 400), false);
  }
};

// Configuration de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
});

// Middleware wrapper avec gestion d'erreurs
const uploadMiddleware = {
  single: (fieldName) => {
    return (req, res, next) => {
      upload.single(fieldName)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          if (err.code === "FILE_TOO_LARGE") {
            return next(
              new AppError("Le fichier est trop volumineux (max 5MB)", 400),
            );
          }
          return next(new AppError(`Erreur d'upload: ${err.message}`, 400));
        } else if (err) {
          return next(err);
        }
        next();
      });
    };
  },
};

module.exports = {
  uploadMiddleware,
};

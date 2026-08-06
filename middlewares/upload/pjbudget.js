// middlewares/upload/pjbudget.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// ⭐ Mapping extension -> mimetype
const extensionToMime = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".csv": "text/csv",
  ".txt": "text/plain",
};

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || "./uploads/budgets";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${uuidv4()}_${Date.now()}`;
    const sanitizedOriginalName = file.originalname.replace(/\s/g, "_");
    cb(null, `${uniqueSuffix}_${sanitizedOriginalName}`);
  },
});

// ⭐ Filtre qui FORCE le mimetype basé sur l'extension
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (extensionToMime[ext]) {
    // ⭐ FORCER le mimetype
    file.mimetype = extensionToMime[ext];
    cb(null, true);
  } else {
    cb(new Error(`Extension non autorisée: ${ext}`), false);
  }
};

// ⭐ Middleware pour corriger le mimetype APRÈS l'upload
const fixmimetype = (req, res, next) => {
  if (req.files) {
    req.files.forEach((file) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (extensionToMime[ext]) {
        file.mimetype = extensionToMime[ext];
      }
    });
  }
  next();
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
    files: parseInt(process.env.MAX_FILES_PER_REQUEST) || 10,
  },
});

module.exports = { upload, fixmimetype, extensionToMime };

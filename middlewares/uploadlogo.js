const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads', 'logo');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Vérifie si le dossier existe, sinon le crée
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });  // crée dossiers parents si besoin
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  }
});

const uploadLogo = multer({ storage });

module.exports = uploadLogo;


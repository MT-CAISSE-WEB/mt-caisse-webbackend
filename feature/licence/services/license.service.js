const { machineIdSync } = require("node-machine-id");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

let PUBLIC_KEY = "";

try {
  // 1. Définir le chemin absolu vers le fichier PEM
  const filePath = path.join(__dirname, "public_key.pem");

  // 2. Lire le fichier en spécifiant l'encodage 'utf8' pour obtenir du texte (chaîne)
  PUBLIC_KEY = fs.readFileSync(filePath, "utf8");

  // 3. Votre clé est prête à être utilisée
  console.log("Clé chargée avec succès !");
  console.log(PUBLIC_KEY);
} catch (error) {
  console.error("Erreur lors de la lecture du fichier de clé :", error.message);
}

const LICENSE_DIR = path.join(__dirname, "../../.mti_secure");
const LICENSE_FILE_PATH = path.join(LICENSE_DIR, "license.dat"); // Extension .dat pour le rendre moins évident

class LicenseService {
  constructor() {
    if (!fs.existsSync(LICENSE_DIR)) {
      fs.mkdirSync(LICENSE_DIR, { recursive: true, mode: 0o700 });
    }

    console.log("🔑 MACHINE ID DU POSTE:", this.getMachineId());
  }

  getMachineId() {
    return machineIdSync({ original: true });
    // Astuce robuste : vous pouvez hasher ce machineId avec un sel pour qu'il ne soit pas lisible en clair
  }

  // CŒUR DE LA SÉCURITÉ : Validation purement cryptographique
  validateLicense() {
    const currentMachineId = this.getMachineId();
    const now = new Date();

    // A. Le fichier existe-t-il ? Sinon, BLOCAGE IMMÉDIAT.
    if (!fs.existsSync(LICENSE_FILE_PATH)) {
      return {
        valid: false,
        reason: "NO_LICENSE",
        message: "Système non activé. Fichier de licence manquant.",
      };
    }

    try {
      const fileContent = fs.readFileSync(LICENSE_FILE_PATH, "utf8");
      const licenseData = JSON.parse(fileContent);

      // B. Vérification de la signature RSA (Mathématiquement inviolable sans la clé privée)
      const verifier = crypto.createVerify("SHA256");
      verifier.update(JSON.stringify(licenseData.payload));

      const isValidSignature = verifier.verify(
        PUBLIC_KEY,
        licenseData.signature,
        "base64",
      );

      if (!isValidSignature) {
        return {
          valid: false,
          reason: "TAMPERED",
          message: "Fichier de licence falsifié ou corrompu.",
        };
      }

      const payload = licenseData.payload;

      // C. Vérification de l'empreinte machine
      if (payload.machineid !== currentMachineId) {
        return {
          valid: false,
          reason: "WRONG_MACHINE",
          message: "Licence invalide pour ce poste.",
        };
      }

      // D. Vérification de la date
      const endDate = new Date(payload.enddate);
      if (now > endDate) {
        return {
          valid: false,
          reason: "EXPIRED",
          message: `Licence expirée le ${endDate.toLocaleDateString()}.`,
        };
      }

      // SUCCÈS
      return {
        valid: true,
        data: {
          client: payload.clientname,
          expiresAt: payload.enddate,
          daysLeft: Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)),
        },
      };
    } catch (error) {
      return {
        valid: false,
        reason: "CORRUPTED",
        message: "Fichier de licence illisible.",
      };
    }
  }

  // Cette méthode est appelée lors de l'upload du fichier par l'admin
  activateLicense(licenseData) {
    // 1. On s'assure que la structure est bonne avant d'écrire
    if (!licenseData.payload || !licenseData.signature) {
      throw new Error("Format de licence invalide.");
    }

    // 2. Vérification immédiate pour ne pas enregistrer un fichier invalide
    const validation = this.validateLicenseFromData(licenseData);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    // ✅ 3. CORRECTION : S'assurer que le dossier existe AVANT d'écrire le fichier
    // (Au cas où il aurait été supprimé manuellement pendant que le serveur tourne)
    if (!fs.existsSync(LICENSE_DIR)) {
      fs.mkdirSync(LICENSE_DIR, { recursive: true, mode: 0o700 });
    }

    // 4. Écriture en mode lecture seule (0o400)
    fs.writeFileSync(LICENSE_FILE_PATH, JSON.stringify(licenseData, null, 2), {
      mode: 0o400,
    });

    return { success: true, message: "Licence activée avec succès." };
  }

  // Méthode interne pour valider avant écriture
  validateLicenseFromData(licenseData) {
    const currentMachineId = this.getMachineId();
    const verifier = crypto.createVerify("SHA256");
    verifier.update(JSON.stringify(licenseData.payload));
    const isValidSignature = verifier.verify(
      PUBLIC_KEY,
      licenseData.signature,
      "base64",
    );

    if (!isValidSignature)
      return { valid: false, message: "Signature invalide." };
    if (licenseData.payload.machineid !== currentMachineId)
      return { valid: false, message: "Mauvais poste." };
    if (new Date() > new Date(licenseData.payload.enddate))
      return { valid: false, message: "Déjà expiré." };

    return { valid: true };
  }

  // Supprime la licence (pour remplacement ou révocation)
  removeLicense() {
    if (fs.existsSync(LICENSE_FILE_PATH)) {
      fs.unlinkSync(LICENSE_FILE_PATH);
      return {
        success: true,
        message:
          "Licence supprimée avec succès. L'application sera verrouillée.",
      };
    }
    return { success: false, message: "Aucune licence active à supprimer." };
  }
}

module.exports = new LicenseService();

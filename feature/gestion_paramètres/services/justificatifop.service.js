const {
    Justificatif,
    JustificatifPieceJointe,
    PieceJointe
} = require("../../gestion_pj_demandes/models/justificatifs/index");
// pour gestion des pj
const { upload } = require("../../../middlewares/upload/pjjustificatif");
const path = require("path");
const fs = require("fs").promises;
const fs2 = require("fs");
const sequelize = require("../../../config/database");
const AdmZip = require("adm-zip");
const { v4: uuidv4 } = require("uuid");

/**
 * Upload de fichiers pour une demande
 * @param {string} idjustificatifoperation - ID de la demande
 * @param {Array} files - Fichiers uploadés (multer)
 * @param {string} userId - ID de l'utilisateur qui upload
 * @returns {Promise<Array>} - Liste des pièces jointes créées
 */
async function uploadFiles(idjustificatifoperation, files, userId) {
    // 1. Vérifier que la demande existe
    const justificatif = await Justificatif.findByPk(idjustificatifoperation);
    if (!justificatif) {
        throw new Error("Justificatif introuvable");
    }

    const results = [];
    const transaction = await sequelize.transaction();
    
    

    try {
        for (const file of files) {
            // 2. Chemin relatif pour stockage en base
            const relativePath = path
                .join("uploads/justificatifs", file.filename)
                .replace(/\\/g, "/");

            // 3. Créer l'entrée dans PieceJointe
            const [pieceJointe, created] = await PieceJointe.findOrCreate({
                where: {
                    urlpiece: relativePath,
                    nomfichier: file.originalname,
                },
                defaults: {
                    idpiecejointe: uuidv4(),
                    urlpiece: relativePath,
                    nomfichier: file.originalname,
                    mimetype: file.mimetype,
                    taille: file.size,
                    nomtable: "JustificatifOperation",
                    idtable: idjustificatifoperation,
                    dossier: "justificatifs",
                    createdat: new Date(),
                    createdby: userId,
                },
                transaction,
            });

            // 4. Vérifier si la liaison existe déjà
            const [liaison, liaisonCreated] = await JustificatifPieceJointe.findOrCreate({
                where: {
                    idjustificatifoperation: idjustificatifoperation,
                    idpiecejointe: pieceJointe.idpiecejointe,
                },
                defaults: {
                    idjustificatifpiecejointe: uuidv4(),
                    idjustificatifoperation: idjustificatifoperation,
                    idpiecejointe: pieceJointe.idpiecejointe,
                    createdat: new Date(),
                    createdby: userId,
                },
                transaction,
            });

            results.push({
                idpiecejointe: pieceJointe.idpiecejointe,
                nomfichier: file.originalname,
                urlpiece: relativePath,
                taille: file.size,
                mimetype: file.mimetype,
                alreadyExists: !liaisonCreated,
            });
        }

        await transaction.commit();
        return results;
    } catch (error) {
        await transaction.rollback();

        // Nettoyer les fichiers physiques en cas d'erreur
        for (const file of files) {
            const filePath = path.join(
                process.env.UPLOAD_DIR || "./uploads/justificatifs",
                file.filename,
            );
            try {
                await fs.unlink(filePath);
            } catch (unlinkError) {
                console.error(
                    `Erreur nettoyage fichier ${file.filename}:`,
                    unlinkError,
                );
            }
        }

        throw new Error(`Erreur upload: ${error.message}`);
    }
}

/**
 * Récupère toutes les pièces jointes d'un justificatif
 * @param {string} idjustificatifoperation - ID du justificatif
 * @returns {Promise<Array>} - Liste des pièces jointes
 */
async function getFiles(idjustificatifoperation) {

    const justificatif = await Justificatif.findByPk(idjustificatifoperation);
    if (!justificatif) {
        throw new Error("Justificatif introuvable");
    }

    const piecesJointes = await PieceJointe.findAll({
        include: [
            {
                model: JustificatifPieceJointe,
                where: { idjustificatifoperation },
                attributes: [],
                required: true,
            },
        ],
        attributes: [
            "idpiecejointe",
            "urlpiece",
            "nomfichier",
            ["mimetype", "mimetype"],
            "taille",
            "createdat",
            "createdby",
        ],
    });

    return piecesJointes;
}

/**
 * Supprime une pièce jointe d'une demande
 * @param {string} idjustificatifoperation - ID de la demande
 * @param {string} idpiecejointe - ID de la pièce jointe
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>}
 */
async function deleteFile(idjustificatifoperation, idpiecejointe, userId) {
    const transaction = await sequelize.transaction();

    try {
        // 1. Vérifier que la liaison existe
        const liaison = await JustificatifPieceJointe.findOne({
            where: { idjustificatifoperation, idpiecejointe },
            transaction,
        });

        if (!liaison) {
            throw new Error(
                "Pièce jointe non trouvée pour ce justificatif"
            );
        }

        // 2. Récupérer les infos du fichier
        const pieceJointe = await PieceJointe.findByPk(idpiecejointe, {
            transaction,
        });

        if (!pieceJointe) {
            throw new Error("Pièce jointe introuvable");
        }

        // 3. Supprimer la liaison
        await liaison.destroy({ transaction });

        // 4. Supprimer l'entrée PieceJointe
        await pieceJointe.destroy({ transaction });

        // 5. Supprimer le fichier physique
        const filePath = path.join(process.cwd(), pieceJointe.urlpiece);
        try {
            await fs.unlink(filePath);
        } catch (unlinkError) {
            console.error(
                `Erreur suppression fichier physique ${filePath}:`,
                unlinkError,
            );
            // On continue même si le fichier n'existe pas
        }

        await transaction.commit();

        return { success: true, message: "Pièce jointe supprimée avec succès" };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

/**
 * Détermine le mimetype depuis l'extension du fichier
 * @param {string} filepath - Chemin du fichier
 * @returns {string}
 */
function getmimetypeFromExtension(filepath) {
    const ext = path.extname(filepath).toLowerCase();
    const mimetypes = {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".doc": "application/msword",
        ".docx":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".xls": "application/vnd.ms-excel",
        ".xlsx":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".csv": "text/csv",
        ".txt": "text/plain",
    };
    return mimetypes[ext] || "application/octet-stream";
}
async function downloadFile(urlpiece) {
    // 1. Construire le chemin absolu
    const absolutePath = path.join(process.cwd(), urlpiece);

    // 2. Vérifier si le fichier existe (utiliser fs.access)
    try {
        await fs.access(absolutePath);
    } catch (error) {
        throw new Error(
            `Fichier introuvable: ${urlpiece}`
        );
    }

    // 3. Récupérer les stats du fichier (utiliser fs.stat)
    const stats = await fs.stat(absolutePath);

    // 4. Déterminer le mimetype depuis l'extension (fallback)
    const mimetype = getmimetypeFromExtension(absolutePath);

    // 5. Extraire le nom original depuis l'url
    const nomfichier =
        path.basename(urlpiece).split("_").slice(2).join("_") ||
        path.basename(urlpiece);

    // 6. Retourner le stream de lecture (utiliser fs.createReadStream)
    const stream = fs2.createReadStream(absolutePath);

    stream.on("error", (err) => {
        console.error("❌ Erreur stream:", err);
    });

    return {
        stream,
        stats,
        mimetype,
        nomfichier,
    };
}

/**
 * Détermine le mimetype depuis l'extension du fichier
 * @param {string} filepath - Chemin du fichier
 * @returns {string}
 */
function getmimetypeFromExtension(filepath) {
    const ext = path.extname(filepath).toLowerCase();
    const mimetypes = {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".doc": "application/msword",
        ".docx":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".xls": "application/vnd.ms-excel",
        ".xlsx":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".csv": "text/csv",
        ".txt": "text/plain",
    };
    return mimetypes[ext] || "application/octet-stream";
}

// Télécharger toutes les pièces jointes
const downloadAllFiles = async (idjustificatifoperation) => {
    const piecesJointes = await getFiles(idjustificatifoperation);

    if (!piecesJointes || piecesJointes.length === 0) {
        throw new Error("Aucune pièce jointe trouvée pour ce justificatif");
    }

    // Cas d'un seul fichier
    if (piecesJointes.length === 1) {
        const piece = piecesJointes[0];
        const filePath = path.join(process.cwd(), piece.urlpiece);

        try {
            await fs.access(filePath);
            const fileBuffer = await fs.readFile(filePath);

            return {
                buffer: fileBuffer,
                filename: piece.nomfichier,
                totalFiles: 1,
                isZip: false,
            };
        } catch (err) {
            console.error(`❌ Fichier introuvable: ${filePath}`, err.message);
            throw new Error(`Fichier introuvable: ${piece.nomfichier}`);
        }
    }

    // Cas de plusieurs fichiers → ZIP

    const zip = new AdmZip();
    let addedFiles = 0;

    for (const piece of piecesJointes) {
        const filePath = path.join(process.cwd(), piece.urlpiece);

        try {
            await fs.access(filePath);
            const fileBuffer = await fs.readFile(filePath);
            zip.addFile(piece.nomfichier, fileBuffer);
            addedFiles++;
        } catch (err) {
            console.error(`   ❌ Erreur: ${err.message}`);
        }
    }

    if (addedFiles === 0) {
        throw new Error("Aucun fichier valide n'a pu être ajouté au ZIP");
    }

    const zipBuffer = zip.toBuffer();

    const justificatifInfo = await Justificatif.findByPk(idjustificatifoperation, {
        attributes: ["codejustificatif", "commentaire"],
    });
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const filename = `justificatif_${justificatifInfo?.codejustificatif}_${justificatifInfo?.commentaire}_${timestamp}.zip`;

    return {
        buffer: zipBuffer,
        filename: filename,
        totalFiles: addedFiles,
        isZip: true,
    };
};

module.exports = {
  // Gestion pièces jointes
  uploadFiles,
  getFiles,
  deleteFile,
  downloadFile,
  downloadAllFiles,
};
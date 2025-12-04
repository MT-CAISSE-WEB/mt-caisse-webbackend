const { DateTime } = require('mssql');
const { sql, connectInstance, connectionDb } = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const devise = require('../../devise/devise.model');

const queryInsert = `
        INSERT INTO Utilisateur (idutilisateur, code, nom, prenom, adresse, telephone, email, typeentitesite, typeentitedepartement, 
        typeentitesociete, acheteur, iddepartement, codedept, idsociete, codesociete, createdat, createdby, updatedat, updatedby)
        OUTPUT INSERTED.*
        VALUES (@idutilisateur, @code, @nom, @prenom, @adresse, @telephone, @email, @typeentitesite, @typeentitedepartement, 
        @typeentitesociete, @acheteur, @iddepartement, @codedept, @idsociete, @codesociete, @createdat, @createdby, @updatedat, @updatedby)
`;

const queryUpdate = `
UPDATE Utilisateur 
SET nom = @nom, prenom = @prenom, adresse = @adresse, 
telephone = @telephone, email = @email, typeentitesite = @typeentitesite, typeentitedepartement = @typeentitedepartement, 
typeentitesociete = @typeentitesociete, acheteur = @acheteur, iddepartement = @iddepartement, codedept = @codedept, 
idsociete = @idsociete, codesociete = @codesociete, updatedat = @updatedat, updatedby = @updatedby 
OUTPUT INSERTED.* 
WHERE code = @code
`;

class utilisateurModel {
    constructor(idutilisateur, code, nom, prenom, adresse, telephone, email, typeentitesite, typeentitedepartement, typeentitesociete, 
        acheteur, iddepartement, codedept, idsociete, codesociete, createdat, createdby, updatedat, updatedby)
    {
        this.idutilisateur = idutilisateur;
        this.code = code;
        this.nom = nom;
        this.prenom = prenom;
        this.adresse = adresse;
        this.telephone = telephone;
        this.email = email;
        this.typeentitesite = typeentitesite;
        this.typeentitedepartement = typeentitedepartement;
        this.typeentitesociete = typeentitesociete;
        this.acheteur = acheteur;
        this.iddepartement = iddepartement;
        this.codedept = codedept;
        this.idsociete = idsociete;
        this.codesociete = codesociete;
        this.createdat = createdat;
        this.createdby = createdby;
        this.updatedat = updatedat;
        this.updatedby = updatedby;
    }

    async create_utilisateurmodel() {
        const pool = await connectionDb();
        try {
            const result = await pool.request()
            .input('idutilisateur', sql.UniqueIdentifier, this.idutilisateur)
            .input('code', sql.NVarChar(24), this.code)
            .input('nom', sql.NVarChar(100), this.nom)
            .input('prenom', sql.NVarChar(100), this.prenom)
            .input('adresse', sql.NVarChar(100), this.adresse)
            .input('telephone', sql.NVarChar(50), this.telephone)
            .input('email', sql.NVarChar(50), this.email)
            .input('typeentitesite', sql.NVarChar(30), this.typeentitesite)
            .input('typeentitedepartement', sql.NVarChar(30), this.typeentitedepartement)
            .input('typeentitesociete', sql.NVarChar(30), this.typeentitesociete)
            .input('acheteur', sql.Bit, this.acheteur ? 1 : 0)
            .input('iddepartement', sql.UniqueIdentifier, this.iddepartement)
            .input('codedept', sql.NVarChar(20), this.codedept)
            .input('idsociete', sql.UniqueIdentifier, this.idsociete)
            .input('codesociete', sql.NVarChar(50), this.codesociete)
            .input('createdat', sql.DateTime2, this.createdat)
            .input('createdby', sql.UniqueIdentifier, this.createdby)
            .input('updatedat', sql.DateTime2, this.updatedat)
            .input('updatedby', sql.UniqueIdentifier, this.updatedby)
            .query(queryInsert);

            return { success: true, data: result.recordset[0] };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async get_allutilisateurs () {
        const pool = await connectionDb();
        const query = "SELECT * FROM Utilisateur";
        try {
            const result = await pool.request().query(query);
            return result;
        } catch (error) {
            console.log(`Erreur de recuperation: ${error}`.cyan.bold);
        }
    }

    async get_oneutilisateur(idutilisateur) {
        const pool = await connectionDb();
        try {
            const result = await pool
                .request()
                .input("idutilisateur", sql.UniqueIdentifier, idutilisateur)
                .query("SELECT * FROM Utilisateur WHERE idutilisateur = @idutilisateur");

            const utilisateur = result.recordset[0];

            if (!utilisateur) {
                return { success: false, message: "Utilisateur introuvable" };
            }

            let codedept = null;
            let codesociete = null;

            if (utilisateur.codedept) {
                codedept = await this.get_oneutilisateur(utilisateur.codedept);
            }

            if (utilisateur.codesociete) {
                codesociete = await this.get_oneutilisateur(utilisateur.codesociete);
            }

            return { ...utilisateur, codedept, codesociete };

        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async update_utilisateur(code, data) {
        const pool = await connectionDb();
        try {
            const check = await pool.request()
            .input('code', sql.NVarChar(50), code)
            .query(`SELECT COUNT(*) AS count FROM Utilisateur WHERE code = @code`);

            if (check.recordset[0].count > 0) {
                const result = await pool.request()
                    .input('idutilisateur', sql.UniqueIdentifier, data.idutilisateur)
                    .input('code', sql.NVarChar(24), data.code)
                    .input('nom', sql.NVarChar(100), data.nom)
                    .input('prenom', sql.NVarChar(100), data.prenom)
                    .input('adresse', sql.NVarChar(100), data.adresse)
                    .input('telephone', sql.NVarChar(50), data.telephone)
                    .input('email', sql.NVarChar(50), data.email)
                    .input('typeentitesite', sql.NVarChar(30), data.typeentitesite)
                    .input('typeentitedepartement', sql.NVarChar(30), data.typeentitedepartement)
                    .input('typeentitesociete', sql.NVarChar(30), data.typeentitesociete)
                    .input('acheteur', sql.Bit, data.acheteur ? 1 : 0)
                    .input('iddepartement', sql.UniqueIdentifier, data.iddepartement)
                    .input('codedept', sql.NVarChar(20), data.codedept)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('codesociete', sql.NVarChar(50), data.codesociete)
                    .input('updatedat', sql.DateTime2, data.updatedat)
                    .input('updatedby', sql.UniqueIdentifier, data.updatedby)
                    .query(queryUpdate);

                return result;
            } else {
                const result = await pool.request()
                    .input('idutilisateur', sql.UniqueIdentifier, data.idutilisateur)
                    .input('code', sql.NVarChar(24), data.code)
                    .input('nom', sql.NVarChar(100), data.nom)
                    .input('prenom', sql.NVarChar(100), data.prenom)
                    .input('adresse', sql.NVarChar(100), data.adresse)
                    .input('telephone', sql.NVarChar(50), data.telephone)
                    .input('email', sql.NVarChar(50), data.email)
                    .input('typeentitesite', sql.NVarChar(30), data.typeentitesite)
                    .input('typeentitedepartement', sql.NVarChar(30), data.typeentitedepartement)
                    .input('typeentitesociete', sql.NVarChar(30), data.typeentitesociete)
                    .input('acheteur', sql.Bit, data.acheteur ? 1 : 0)
                    .input('iddepartement', sql.UniqueIdentifier, data.iddepartement)
                    .input('codedept', sql.NVarChar(20), data.codedept)
                    .input('idsociete', sql.UniqueIdentifier, data.idsociete)
                    .input('codesociete', sql.NVarChar(50), data.codesociete)
                    .input('createdat', sql.DateTime2, data.createdat)
                    .input('createdby', sql.UniqueIdentifier, data.createdby)
                    .input('updatedat', sql.DateTime2, data.updatedat)
                    .input('updatedby', sql.UniqueIdentifier, data.updatedby)
                    .query(queryInsert);

                return result;
            }

        } catch (error) {
            console.log(`Erreur de modification: ${error}`.cyan.bold);
        }
    }

    async delete_utilisateur(idutilisateur) {
        const pool = await connectionDb();
        try {
            const result = await pool.request()
            .input('idutilisateur', sql.UniqueIdentifier, idutilisateur)
            .query("DELETE FROM Utilisateur WHERE idutilisateur = @idutilisateur");

            return result;
        } catch (error) {
            console.log(`Erreur de suppression: ${error}`.cyan.bold);
        }
    }
}

module.exports = utilisateurModel;

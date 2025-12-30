const { sql, poolPromise, connectInstance, connectDB} = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
dotenv.config({path: '../../../config/config.env'});
const argon2 = require('argon2');
const jwt = require("jsonwebtoken");
const db = require('../../../config/db');


async function upsertuser(params){
    try {
        const {
            codeutilisateur, idsociete, nom, prenom, adresse, telephone, email,
            login, password, idrole, typeentitesite, typeentitedepartement, typeentitesociete,
            acheteur, createdby, updatedby
        } = params;

        console.log(params);

        const idutilisateur = uuidv4();

        const hashpassword = await argon2.hash(password);

        const query = `
        IF EXISTS (SELECT 1 FROM Utilisateur WHERE codeutilisateur = @codeutilisateur)
        BEGIN
            UPDATE Utilisateur SET 
                idsociete = @idsociete,
                nom = @nom,
                prenom = @prenom,
                adresse = @adresse,
                telephone = @telephone,
                email = @email,
                login = @login,
                idrole = @idrole,
                password = @password, 
                typeentitesite = @typeentitesite,
                typeentitedepartement = @typeentitedepartement,
                typeentitesociete = @typeentitesociete,
                acheteur = @acheteur,
                updatedby = @updatedby,
                updatedat = GETDATE()
            OUTPUT 'update' AS action, INSERTED.*
            WHERE codeutilisateur = @codeutilisateur
        END 
        ELSE
        BEGIN
            INSERT INTO Utilisateur 
                (idutilisateur, codeutilisateur, idsociete, nom, prenom, adresse, telephone, email, 
                 login, password, idrole, typeentitesite, typeentitedepartement, typeentitesociete, 
                 acheteur, createdby, createdat)
            OUTPUT 'insert' AS action, INSERTED.*
            VALUES  
                (@idutilisateur, @codeutilisateur, @idsociete, @nom, @prenom, @adresse, 
                 @telephone, @email, @login, @password, @idrole, @typeentitesite, @typeentitedepartement, 
                 @typeentitesociete, @acheteur, @createdby, GETDATE())
        END`;

        
        const pool = await connectDB();
        const result = await pool.request()
            .input("idutilisateur", sql.UniqueIdentifier, idutilisateur)
            .input("codeutilisateur", sql.NVarChar, codeutilisateur)
            .input("idsociete", sql.UniqueIdentifier, idsociete)
            .input("nom", sql.NVarChar, nom)
            .input("prenom", sql.NVarChar, prenom)
            .input("adresse", sql.NVarChar, adresse)
            .input("telephone", sql.NVarChar, telephone)
            .input("email", sql.NVarChar, email)
            .input("login", sql.NVarChar, login)
            .input("idrole", sql.Int, idrole)
            .input("password", sql.NVarChar, hashpassword)
            .input("typeentitesite", sql.Int, typeentitesite)
            .input("typeentitedepartement", sql.Int, typeentitedepartement)
            .input("typeentitesociete", sql.Int, typeentitesociete)
            .input("acheteur", sql.Int, acheteur)
            .input("createdby", sql.NVarChar, createdby)
            .input("updatedby", sql.NVarChar, updatedby)
            .query(query);

            console.log("Securite - upsert user executed");
        
        // SÉCURITÉ → éviter crash
        if (!result.recordset || result.recordset.length === 0) {
            return {
                success: false,
                status: 500,
                message: "Aucune donnée retournée (probable erreur SQL)"
            };
        }

        const data = result.recordset[0];

        return {
            success: true,
            status: 200,
            message: data.action === "update"
                ? "Utilisateur mis à jour avec succès !"
                : "Utilisateur créé avec succès !",
            data
        };

    } catch (error) {
        return {
            success: false,
            status: 500,
            message: `Erreur de l'opération : ${error}`
        };
    }
}


async function getalluser(){
    try {
        const pool = await connectDB();
        const query = `SELECT u.*,
       s.raisonsociale as societe
       from Utilisateur u
       left join Societe s on u.idsociete = s.idsociete`;
        const result = await pool.request().query(query);

        return {
            success :true,
            status:200, 
            data : result.recordsets[0],
            message : "Eléments trouvés avec succès!"}
    } catch (error) {
        return {success:false,status:500,message:`Erreur de recuperation: ${error}`.cyan.bold};
    }
}

//Get one
async function getoneuser(iduser){
    try {
        const pool = await connectDB();
        const query = "SELECT * FROM utilisateur where idutilisateur = @idutilisateur";
        const result = await pool.request()
        .input('idutilisateur',db.sql.UniqueIdentifier,iduser)
        .query(query);

        if(!result){
            return {success:false,status:404,message:"Utilisateur non trouvé"};
        }

        return {
            success:true,
            status:200,
            data:result.recordset[0],
            message : "Element trouvé avec succès!"}
    } catch (error) {
        return {success:false,status:500,message:`Erreur de recuperation: ${error}`.cyan.bold};
    }
}

async function deleteuser(iduser)
{
          
          try {
              const pool = await connectDB();
              const query = "DELETE FROM utilisateur where idutilisateur = @idutilisateur";
              const result = await pool.request()
              .input('idutilisateur', sql.UniqueIdentifier,iduser)
              .query(query);
              return {success:true,status:200,message:"Suppression effectuée avec succès!"}
          } catch (error) {
              return {success:false,status:500,message:`Erreur lors de la suppression : ${error}`.cyan.bold}; 
          }
}

//fonctionnalités métier User

//login
// LOGIN
async function login(login, password) {
try{
    const pool = await connectDB();

        const query =`SELECT u.*, 
        s.idsociete,
        s.codesociete,
        s.raisonsociale,
        
        dref.iddevise  AS devise_ref_id,
        dref.codedevise      AS devise_ref_code,
        dref.intitule  AS devise_ref_intitule ,
        
        drep.iddevise  AS devise_rep_id,
        drep.codedevise      AS devise_rep_code,
        drep.intitule    AS devise_rep_intitule, 
        r.idrole,
        r.code,
        r.libelle,
        d.iddepartement,
        d.codedept,
        d.libelle as libelledept

        FROM Utilisateur u
        INNER JOIN Societe s 
            ON s.idsociete = u.idsociete
        
        left join utilisateur_role ur 
        on ur.idutilisateur=u.idutilisateur

        left join role r on ur.idrole = r.idrole

        left join utilisateurdepartement ud
        on ud.idutilisateur = u.idutilisateur

        left join departement d on ud.iddepartement = d.iddepartement

        LEFT JOIN Devise dref 
            ON dref.iddevise = s.iddevisereference

        LEFT JOIN Devise drep 
            ON drep.iddevise = s.iddevisereporting

        WHERE u.login = @login`;

        const result = await pool.request()
            .input("login", db.sql.NVarChar(50), login)
            .query(query);

        if (result.recordset.length === 0) {
            return {status:404, success: false, message: "Utilisateur introuvable" };
        }

        const userdb = result.recordset[0];
        //const user = result.recordset[0];
        const user = {
            codesociete :  result.recordset[0].codesociete,
            raisonsociale : result.recordset[0].raisonsociale,
            idutilisateur: result.recordset[0].idutilisateur,
            login: result.recordset[0].login,
            nom: result.recordset[0].nom,
            prenom: result.recordset[0].prenom,
            typeentitesociete: result.recordset[0].typeentitesociete,
            typeentitesite : result.recordset[0].typeentitesite,
            typeentitedepartement : result.recordset[0].typeentitedepartement,
            acheteur : result.recordset[0].acheteur,
            devise_ref_code : result.recordset[0].devise_ref_code,
            devise_ref_intitule : result.recordset[0].devise_ref_intitule,
            devise_rep_code : result.recordset[0].devise_ref_code,
            devise_rep_intitule : result.recordset[0].devise_ref_intitule,
            roles: [],
            departements : []
        };

            const roles = {};
            const departements = {};

            result.recordset.forEach(row => {

            if (row.idrole) {
                roles[row.idrole] = {
                idrole: row.idrole,
                code: row.code,
                libelle: row.libelle
                };
            }

            if (row.iddepartement) {
                departements[row.iddepartement] = {
                iddepartement: row.iddepartement,
                codedept: row.codedept,
                libelle: row.libelledept
                };
            }
            });

            user.roles = Object.values(roles);
            user.departements = Object.values(departements);






        // Vérifier mot de passe
        const isOk = await argon2.verify(userdb.password, password);
        if (!isOk) {
            return {status:500, success: false, message: "Mot de passe incorrect" };
        }



        // Payload du token
        const payload = {
            id: user.idutilisateur,
            login: user.login,
            roles : user.roles.map(r => r.coderole),
            departements : user.departements.map(d=>d.codedept)
        };


    
      
        // Access Token : court
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        
        // Refresh Token : long
        const refreshToken = jwt.sign(
            payload,
            process.env.JWT_SECRET_REFRESH,
            { expiresIn: "30d" }
        );
       
        // Stockage du refresh token (hashé)
        const hashedRefresh = await argon2.hash(refreshToken);

             await pool.request()
            .input("userid", db.sql.UniqueIdentifier, user.idutilisateur)
            .input("token", db.sql.NVarChar(255), hashedRefresh)
            .query(`
                INSERT INTO REFRESH_TOKEN(idutilisateur, token)
                VALUES (@userid, @token)
            `);  
            
            console.log(user);

        return {
            success: true,
            status : 200,
            message: "Connexion réussie",
            data: user,
            token: token,
            refreshToken: refreshToken
        };

    } catch (error) {
        return { status:500, success: false, message: "Erreur serveur : " + error };
    }
}


async function refreshtoken (refreshToken){
    if (!refreshToken) {
        return { status: 401, success: false, message: "Refresh token manquant" };
    }

    try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH);

        const pool = await connectDB();

        // Récupération liste
        const result = await pool.request().query("SELECT * FROM REFRESH_TOKEN");

        const found = result.recordset.find(rt =>
            argon2.verify(rt.token, refreshToken)
        );

        if (!found) {
            return { status: 403, success: false, message: "Refresh token invalide" };
        }

        const newToken = jwt.sign(
            { id: decoded.id, login: decoded.login },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return {
            status: 200,
            success: true,
            token: newToken
        };
    } catch (error) {
            return { status: 500, success: false, message: "Erreur serveur" };
    }
}

async function logout(refreshToken){
     if (!refreshToken) {
            return { status: 400, success: false, message: "Refresh token manquant" };
        }

        try {
            const pool = await connectDB();

            // Supprimer le refresh token lié à l'utilisateur
            await pool.request()
                .query("DELETE FROM REFRESH_TOKEN");

            return { status: 200, success: true, message: "Déconnexion réussie" };

        } catch (error) {
            return { status: 500, success: false, message: "Erreur lors du logout" };
        }
}



module.exports = {
    upsertuser,
    getalluser,
    getoneuser,
    deleteuser,
    login,
    refreshtoken,
    logout
}



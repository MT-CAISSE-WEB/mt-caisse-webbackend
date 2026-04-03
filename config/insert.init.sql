DECLARE @now DATETIME = GETDATE();
DECLARE @user NVARCHAR(50) = 'SYSTEM';

INSERT INTO Devise (codedevise, intitule, codeiso, actif, createdat, createdby)
SELECT * FROM (
    VALUES 
    ('USD', 'Dollar américain', 'USD', 1, @now, @user),
    ('CDF', 'Franc congolais', 'CDF', 1, @now, @user),
    ('XAF', 'Franc CFA', 'XAF', 1, @now, @user)
) AS d(codedevise, intitule, codeiso, actif, createdat, createdby)
WHERE NOT EXISTS (
    SELECT 1 FROM Devise dv WHERE dv.codedevise = d.codedevise
);

DECLARE @idDeviseCDF UNIQUEIDENTIFIER;
DECLARE @idDeviseUSD UNIQUEIDENTIFIER;

SELECT @idDeviseCDF = iddevise FROM Devise WHERE codedevise = 'CDF';
SELECT @idDeviseUSD = iddevise FROM Devise WHERE codedevise = 'USD';

INSERT INTO Societe (
    iddevisereference,
    iddevisereporting,
    codesociete,
    raisonsociale,
    sigle,
    email,
    telephone,
    adresse,
    suivibudgetaire,
    createdat,
    createdby
)
SELECT 
    @idDeviseCDF,
    @idDeviseUSD,
    'SOC001',
    'Plantation et huilerie du congo',
    'PHC',
    'contactphc@phc-congo.com',
    '000000000',
    'Kinshasa Gombe sur le boulevard 30 juin',
    1,
    GETDATE(),
    'SYSTEM'
WHERE NOT EXISTS (
    SELECT 1 FROM Societe WHERE codesociete = 'SOC001'
);

INSERT INTO Motif (codemotif, libellemotif, createdat, createdby)
SELECT * FROM (
    VALUES 
    ('MOT001', 'Budget non autorisé', GETDATE(), 'SYSTEM'),
    ('MOT002', 'Budget non défini ', GETDATE(), 'SYSTEM'),
    ('MOT003', 'Ligne budgétaire clôtueré', GETDATE(), 'SYSTEM'),
    ('MOT004', 'Demande incomplète', GETDATE(), 'SYSTEM'),
    ('MOT005', 'Pièces justificatives manquantes', GETDATE(), 'SYSTEM'),
    ('MOT006', 'Demande non conforme aux procédures', GETDATE(), 'SYSTEM'),
    ('MOT007', 'Montant incohérent', GETDATE(), 'SYSTEM'),
    ('MOT008', 'Hors périmètre budgétaire', GETDATE(), 'SYSTEM'),
    ('MOT009', 'Demande non prioritaire', GETDATE(), 'SYSTEM')
) AS m(codemotif, libellemotif, createdat, createdby)
WHERE NOT EXISTS (
    SELECT 1 FROM Motif mo WHERE mo.codemotif = m.codemotif
);


INSERT INTO role (code, libelle, createdat, createdby)
SELECT * FROM (
    VALUES 
    ('00', 'Super administrateur', GETDATE(), 'SYSTEM'),
    ('01', 'Administrateur system', GETDATE(), 'SYSTEM'),
    ('04', 'Caissier', GETDATE(), 'SYSTEM'),
    ('02', 'Superviseur caisse', GETDATE(), 'SYSTEM'),
    ('05', 'Demandeur', GETDATE(), 'SYSTEM'),
    ('03', 'Comptable', GETDATE(), 'SYSTEM')
) AS r(code, libelle, createdat, createdby)
WHERE NOT EXISTS (
    SELECT 1 FROM role rl WHERE rl.code = r.code
);


INSERT INTO permission (code, description, createdat, createdby)
SELECT * FROM (
    VALUES 
    ('CREATE_CAISSE', 'Créer une opération de caisse', GETDATE(), 'SYSTEM'),
    ('VALIDATE_CAISSE', 'Valider une opération', GETDATE(), 'SYSTEM')
) AS p(code, description, createdat, createdby)
WHERE NOT EXISTS (
    SELECT 1 FROM permission pe WHERE pe.code = p.code
);

INSERT INTO ModeleCompteur (
    codemodelecompteur,
    libelle,
    typedocument,
    sequence_1,
    prefixe_1,
    sequence_2,
    prefixe_2,
    createdat,
    createdby
)
SELECT * FROM (
    VALUES 
    ('CPT00', 'Compteur des demandes', 'demande', 'constante', 'DEC', 'site', null, GETDATE(), 'SYSTEM'),
    ('CPT01', 'Compteur des opérations', 'opération de caisse', 'site', null, 'constante', 'OPE', GETDATE(), 'SYSTEM')
) AS mc(codemodelecompteur, libelle, typedocument, sequence_1, prefixe_1, createdat, createdby)
WHERE NOT EXISTS (
    SELECT 1 FROM ModeleCompteur m WHERE m.codemodelecompteur = mc.codemodelecompteur
);

DECLARE @idSociete UNIQUEIDENTIFIER;
SELECT @idSociete = idsociete  FROM Societe WHERE codesociete = 'SOC001';

INSERT INTO Site (
    idsociete,
    codesite,
    libelle,
    email,
    telephone,
    adresse,
    createdat,
    createdby
)
SELECT * FROM (
    VALUES 
    (@idSociete, 'SIEGE', 'Siège kinshasa', 'kinshasa@phc-congo.com', null, 'Kinshasa - Gombe', @now, @user),
    (@idSociete, 'LOKUTU', 'Lokutu', 'lokutu@phc-congo.com', null, 'Lokutu - RDC', @now, @user)
) AS s(idsociete, codesite, libelle, email, telephone, adresse, createdat, createdby)
WHERE NOT EXISTS (
    SELECT 1 FROM Site st WHERE st.codesite = s.codesite
);

DECLARE @idSite UNIQUEIDENTIFIER;
SELECT @idSite = idsite FROM Site WHERE codesite = 'SIEGE';

DECLARE @password NVARCHAR(255);
SET @password = CONVERT(NVARCHAR(255), HASHBYTES('SHA2_256', 'dolimex@caisse'), 2);
-- mot de passe générique = dolimex@caisse,

INSERT INTO Utilisateur (
    codeutilisateur,
    idsociete,
    idsite,
    nom,
    prenom,
    adresse,
    telephone,
    email,
    login,
    password,
    typeentitesite,
    typeentitedepartement,
    typeentitesociete,
    acheteur,
    createdat,
    createdby
)
SELECT 
    'ADMIN001',
    @idSociete,
    @idSite,
    'ADMIN',
    'SYSTEM',
    'Kinshasa',
    null,
    'admin@phc-congo.com',
    'dolimex',
    '$argon2id$v=19$m=65536,t=3,p=4$g1WSR4kLiWhMf++eCPxxQA$VgLI0gAU+spJ8A/7H9PVmcGg8UH3CPzgl/6Dqe+S0Zs',
    1,
    1,
    1,
    1,
    @now,
    @user
WHERE NOT EXISTS (
    SELECT 1 FROM Utilisateur WHERE login = 'dolimex'
);

DECLARE @idrole INT
DECLARE @iduser UNIQUEIDENTIFIER

SELECT @idrole = idrole FROM Role WHERE code = '00'
SELECT @iduser = idutilisateur FROM Utilisateur WHERE login = 'dolimex'

INSERT INTO Utilisateur_role (
    idutilisateur,
    idrole,
    createdat,
    createdby
    )
SELECT
    @iduser,
    @idrole,
    @now,
    @user
WHERE NOT EXISTS (
    SELECT 1 
    FROM utilisateur_role ur
    WHERE ur.idutilisateur = @iduser 
    AND ur.idrole = @idrole
);
-- USE MTCAISSEWEB;
-- -- OK
-- IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Devise')
-- BEGIN
--     CREATE TABLE Devise (
--         iddevise UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
--         codedevise NVARCHAR(3) UNIQUE,
--         intitule NVARCHAR(150),
--         codeiso NVARCHAR(150),
--         actif INT DEFAULT 0,
--         createdat Datetime,
--         createdby NVARCHAR(50),
--         updatedat Datetime,
--         updatedby NVARCHAR(50)
--     );
-- END

-- -- ============================================
-- -- 2️⃣ Tauxdevise (dépend de Devise)
-- -- ============================================

-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Societe')
BEGIN
    CREATE TABLE Societe (
        idsociete UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		iddevisereference UNIQUEIDENTIFIER,
		iddevisereporting UNIQUEIDENTIFIER,
		codesociete nvarchar(50) unique,
		raisonsociale NVARCHAR(150),
		sigle NVARCHAR(50),
		rccm NVARCHAR(50),
		numnui NVARCHAR(50),
		email NVARCHAR(30),
		telephone NVARCHAR(20),
		logo NVARCHAR(50),
		adresse NVARCHAR(200),
		suivibudgetaire INT DEFAULT 0,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (iddevisereference) REFERENCES Devise(iddevise),
		FOREIGN KEY (iddevisereporting) REFERENCES Devise(iddevise),
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CentreAnalytique')
BEGIN
    CREATE TABLE CentreAnalytique (
        idcentreanalytique UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        idsociete UNIQUEIDENTIFIER,
        codecentreanalytique NVARCHAR(50) UNIQUE,
        libelle NVARCHAR(150),
        actif INT DEFAULT 0,
        createdat Datetime,
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (idsociete) REFERENCES Societe(idsociete)
    );
END

-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Site')
BEGIN
    CREATE TABLE Site (
        idsite UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idsociete UNIQUEIDENTIFIER,
		codesite nvarchar(50) unique,
		codeanalytique UNIQUEIDENTIFIER NULL,
		libelle NVARCHAR(150),
		email NVARCHAR(30),
		telephone NVARCHAR(20),
		adresse NVARCHAR(200),
		estcentreanalytique INT DEFAULT 0,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (codeanalytique) REFERENCES CentreAnalytique(idcentreanalytique),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );
END


---Ajout role et permission à completer chez vous
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'role')
BEGIN
CREATE TABLE role (
    idrole INT PRIMARY KEY IDENTITY(1,1),
	code VARCHAR(50),
    libelle VARCHAR(50) NOT NULL,
	createdby NVARCHAR(50),
    createdat Datetime,
	updatedat Datetime,
	updatedby NVARCHAR(50)
);
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'permission')
BEGIN
CREATE TABLE permission (
    idpermission INT PRIMARY KEY IDENTITY(1,1),
    code VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
	createdby NVARCHAR(50),
    createdat Datetime,
	updatedat Datetime,
	updatedby NVARCHAR(50)
);
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'role_permission')
BEGIN
CREATE TABLE role_permission (
    idrole INT NOT NULL,
    idpermission INT NOT NULL,
	createdby NVARCHAR(50),
    createdat Datetime,
	updatedat Datetime,
	updatedby NVARCHAR(50),
    PRIMARY KEY (idrole, idpermission),
    FOREIGN KEY (idrole) REFERENCES role(idrole),
    FOREIGN KEY (idpermission) REFERENCES permission(idpermission)
);
END


-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Utilisateur')
BEGIN
    CREATE TABLE Utilisateur (
		idutilisateur UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		codeutilisateur NVARCHAR(24) UNIQUE,
		idsociete UNIQUEIDENTIFIER,
		nom NVARCHAR(100),
		prenom NVARCHAR(100),
		adresse NVARCHAR(100),
		telephone NVARCHAR(50),
		email NVARCHAR(50) unique,
		login NVARCHAR(50) unique,
		password NVARCHAR(255),
		typeentitesite INT DEFAULT 0,
		typeentitedepartement INT DEFAULT 0,
		typeentitesociete INT DEFAULT 0,
		acheteur INT DEFAULT 0,
		idrole INT DEFAULT 0,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		foreign key (idsociete) references Societe(idsociete),
		foreign key (idrole) references role(idrole)
    );
END



---refresh token a ajouter aussi
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name='Refresh_token')
BEGIN
	CREATE TABLE Refresh_token (
		idutilisateur UNIQUEIDENTIFIER,
		token NVARCHAR(150),
		foreign key (idutilisateur) references Utilisateur(idutilisateur)
	);
END

-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Departement')
BEGIN
    CREATE TABLE Departement (
        iddepartement UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idsociete UNIQUEIDENTIFIER,
		idsite UNIQUEIDENTIFIER,
		responsable UNIQUEIDENTIFIER,
		libelle NVARCHAR(150),
		email NVARCHAR(30),
		telephone NVARCHAR(20),
		adresse NVARCHAR(200),
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (idsite) REFERENCES Site(idsite),
		FOREIGN KEY (responsable) REFERENCES Utilisateur(idutilisateur),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );
END

-- FIN INIT JUNIOR






IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PlanComptable')
BEGIN
    CREATE TABLE PlanComptable (
        idcompte UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        idsociete UNIQUEIDENTIFIER,
        numcompte NVARCHAR(50) UNIQUE,
        libelle NVARCHAR(150),
        ventillable INT DEFAULT 1,
        auxiliaire INT DEFAULT 1,
        actif INT DEFAULT 1,
        suivibudgetaire INT DEFAULT 0,
        suivibudgetairemensuel INT DEFAULT 0,
        createdat Datetime,
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (idsociete) REFERENCES Societe(idsociete)
    );
END

-- ============================================
-- 5️⃣ NatureOperation (dépend de PlanComptable et Societe)
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NatureOperation')
BEGIN
    CREATE TABLE NatureOperation (
        idnature UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        codenature NVARCHAR(50) UNIQUE,
        idsociete UNIQUEIDENTIFIER,
        idcompte UNIQUEIDENTIFIER,
        libelle NVARCHAR(150),
        decajustifier INT DEFAULT 0,
        imputationtiers INT DEFAULT 0,
        actif INT DEFAULT 1,
        demandedecaissement INT DEFAULT 0,
        typeoperation NVARCHAR(50),
        createdat Datetime,
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
        FOREIGN KEY (idcompte) REFERENCES PlanComptable(idcompte)
    );
END


-- ============================================
-- 15️⃣ AffectationAnalytique (dépend de Sites, Departement, CentreAnalytique, NatureOperation, Societe)
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Affectation')
BEGIN
    CREATE TABLE Affectation (
        idaffectation UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        idsociete UNIQUEIDENTIFIER,
        idsite UNIQUEIDENTIFIER,
        iddepartement UNIQUEIDENTIFIER,
        idcentreanalytique UNIQUEIDENTIFIER NULL,
        idnature UNIQUEIDENTIFIER NULL,
        actif INT DEFAULT 1,
        createdat Datetime,
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
        FOREIGN KEY (idsite) REFERENCES Site(idsite),
        FOREIGN KEY (iddepartement) REFERENCES Departement(iddepartement),
        FOREIGN KEY (idcentreanalytique) REFERENCES CentreAnalytique(idcentreanalytique),
        FOREIGN KEY (idnature) REFERENCES NatureOperation(idnature)
    );
END


IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Tiers')
BEGIN
    CREATE TABLE Tiers (
        idtiers UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        codetiers NVARCHAR(24) UNIQUE,
        idsociete UNIQUEIDENTIFIER,
        designation NVARCHAR(150),
        typetiers NVARCHAR(50),
        actif INT DEFAULT 1,
        createdat Datetime,
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50)
        FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );
END

-- FIN INIT RICHARD


-- ============================================
-- 13️⃣ CircuitValidation (dépend de Sites, Departement, Societe)
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CircuitValidation')
BEGIN
    CREATE TABLE CircuitValidation (
        idcircuitvalidation UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        codecircuitvalidation NVARCHAR(24) UNIQUE,
        typeentite NVARCHAR(100),
        typeaction NVARCHAR(100),
        idsociete UNIQUEIDENTIFIER,
        idsite UNIQUEIDENTIFIER,
        iddepartement UNIQUEIDENTIFIER,
        nombrevalidateur INT NOT NULL,
        actif INT DEFAULT 1,
        createdat Datetime,
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
        FOREIGN KEY (idsite) REFERENCES Site(idsite),
        FOREIGN KEY (iddepartement) REFERENCES Departement(iddepartement)
    );
END


-- ============================================
-- 11️⃣ Budget (dépend de Sites, Societe, Budget parent)
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Budget')
BEGIN
    CREATE TABLE Budget (
        idbudget UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        codebudget NVARCHAR(24) UNIQUE,
        idbudgetparent UNIQUEIDENTIFIER NULL,
        typebudget NVARCHAR(10),
        datedebut DATETIME,
        datefin DATETIME,
        actif INT DEFAULT 0,
        cloture INT DEFAULT 0,
        valide INT DEFAULT 0,
        idcircuitvalidation UNIQUEIDENTIFIER,
        dernierniveau INT,
        niveauactuel INT,
        validedept INT,
        datevalidedept DATETIME,
        validesite INT,
        datevalidesite DATETIME,
        validesociete INT,
        datevalidesociete DATETIME,
        idsite UNIQUEIDENTIFIER,
        idsociete UNIQUEIDENTIFIER,
        createdat DATETIME DEFAULT GETDATE(),
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (idsite) REFERENCES Site(idsite),
        FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
        FOREIGN KEY (idbudgetparent) REFERENCES Budget(idbudget),
        FOREIGN KEY (idcircuitvalidation) REFERENCES CircuitValidation(idcircuitvalidation)
    );
END

-- ============================================
-- 12️⃣ BudgetDepartementNature (dépend de Budget, Departement, NatureOperation)
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BudgetDepartementNature')
BEGIN
    CREATE TABLE BudgetDepartementNature (
        idbudgetdepartementnature UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        idbudget UNIQUEIDENTIFIER,
        iddepartement UNIQUEIDENTIFIER,
        idnature UNIQUEIDENTIFIER,
        montantprevisiondept DECIMAL(22, 9),
        montantprevisionsite DECIMAL(22, 9),
        montantprevisionsociete DECIMAL(22, 9),
        totalconsocloture DECIMAL(22, 9),
        soldecloture DECIMAL(22, 9),
        createdat Datetime DEFAULT GETDATE(),
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (idbudget) REFERENCES Budget(idbudget),
        FOREIGN KEY (iddepartement) REFERENCES Departement(iddepartement),
        FOREIGN KEY (idnature) REFERENCES NatureOperation(idnature)
    );
END

-- ============================================
-- 17️⃣ EnteteDemande (dépend de Utilisateur, CircuitValidation, Sites, Departement, Societe, Devise)
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EnteteDemande')
BEGIN
    CREATE TABLE EnteteDemande (
        iddemande UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        codedemande NVARCHAR(50) UNIQUE,
        iddemandeur UNIQUEIDENTIFIER,
        typedemande NVARCHAR(50),
        libelledemande NVARCHAR(200),
        datedemande DATETIME,
        decaisse INT DEFAULT 0,
        solde INT DEFAULT 0,
        statut NVARCHAR(50),
        idcircuit UNIQUEIDENTIFIER,
        idsociete UNIQUEIDENTIFIER,
        idsite UNIQUEIDENTIFIER,
        iddepartement UNIQUEIDENTIFIER,
        iddevise UNIQUEIDENTIFIER,
        createdat Datetime,
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (iddemandeur) REFERENCES Utilisateur(idutilisateur),
        FOREIGN KEY (idcircuit) REFERENCES CircuitValidation(idcircuitvalidation),
        FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
        FOREIGN KEY (idsite) REFERENCES Site(idsite),
        FOREIGN KEY (iddepartement) REFERENCES Departement(iddepartement),
        FOREIGN KEY (iddevise) REFERENCES Devise(iddevise)
    );
END

-- ============================================
-- 18️⃣ LigneDemande (dépend de EnteteDemande, NatureOperation, Budget, CentreAnalytique, Sites, Societe)
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LigneDemande')
BEGIN
    CREATE TABLE LigneDemande (
        idlignedemande UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        iddemande UNIQUEIDENTIFIER,
        numligne INT UNIQUE,
        libellelignedemande NVARCHAR(255),
        montantdemande DECIMAL(22, 9),
        idnature UNIQUEIDENTIFIER,
        idbudget UNIQUEIDENTIFIER DEFAULT NULL,
        idcentre UNIQUEIDENTIFIER,
        idsociete UNIQUEIDENTIFIER,
        idsite UNIQUEIDENTIFIER,
        createdat Datetime DEFAULT GETDATE(),
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (iddemande) REFERENCES EnteteDemande(iddemande),
        FOREIGN KEY (idnature) REFERENCES NatureOperation(idnature),
        FOREIGN KEY (idbudget) REFERENCES Budget(idbudget),
        FOREIGN KEY (idcentre) REFERENCES CentreAnalytique(idcentreanalytique),
        FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
        FOREIGN KEY (idsite) REFERENCES Site(idsite)
    );
END

-- ============================================
-- 19️⃣ DetailsDemande (dépend de LigneDemande, EnteteDemande, Societe)
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DetailsDemande')
BEGIN
    CREATE TABLE DetailsDemande (
        iddetailsdemande UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        iddemande UNIQUEIDENTIFIER,
        idlignedemande UNIQUEIDENTIFIER,
        idsociete UNIQUEIDENTIFIER,
        description NVARCHAR(255),
        quantite DECIMAL(22, 9),
        montant DECIMAL(22, 9),
        createdat Datetime DEFAULT GETDATE(),
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (iddemande) REFERENCES EnteteDemande(iddemande),
        FOREIGN KEY (idlignedemande) REFERENCES LigneDemande(idlignedemande),
        FOREIGN KEY (idsociete) REFERENCES Societe(idsociete)
    );
END

-- FIN INIT FERREOL




IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Journal')
BEGIN
    CREATE TABLE Journal (
        idjournal UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        codejournal NVARCHAR(24) UNIQUE,
        idsociete UNIQUEIDENTIFIER,
        designation NVARCHAR(150),
        actif INT DEFAULT 1,
        createdat Datetime,
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50)
        FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );
END

-- ============================================
-- Caisse (dépend de Societe, Devise, Sites, Journal, PlanComptable)
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Caisse')
BEGIN
    CREATE TABLE Caisse (
        idcaisse UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        codecaisse NVARCHAR(24) UNIQUE,
        libelle NVARCHAR(100),
        idjournal UNIQUEIDENTIFIER,
        iddevise UNIQUEIDENTIFIER,
        idsite UNIQUEIDENTIFIER,
        idsociete UNIQUEIDENTIFIER,
        idcompte UNIQUEIDENTIFIER,
        dateinitialisation Datetime,
        soldeinitialisation Decimal(22,9),
        seuilmnimal Decimal(22,9),
        actif INT DEFAULT 1,
        createdat Datetime,
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
        FOREIGN KEY (iddevise) REFERENCES Devise(iddevise),
        FOREIGN KEY (idsite) REFERENCES Site(idsite),
        FOREIGN KEY (idjournal) REFERENCES Journal(idjournal),
        FOREIGN KEY (idcompte) REFERENCES PlanComptable(idcompte)
    );
END


-- ============================================
-- 🔟 UtilisateurCaisse (dépend de Utilisateur, Caisse, Societe)
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UtilisateurCaisse')
BEGIN
    CREATE TABLE UtilisateurCaisse (
        idutilisateurcaisse UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        idcaisse UNIQUEIDENTIFIER,
        idutilisateur UNIQUEIDENTIFIER,
        idsociete UNIQUEIDENTIFIER,
        actif INT DEFAULT 1,
        createdat Datetime,
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (idcaisse) REFERENCES Caisse(idcaisse),
        FOREIGN KEY (idutilisateur) REFERENCES Utilisateur(idutilisateur),
        FOREIGN KEY (idsociete) REFERENCES Societe(idsociete)
    );
END



-- ============================================
-- 21️⃣ EnteteOperationCaisse (dépend de EnteteDemande, Societe)
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EnteteOperationCaisse')
BEGIN
    CREATE TABLE EnteteOperationCaisse (
        idoperation UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        codeoperation NVARCHAR(50) UNIQUE,
        iddemande UNIQUEIDENTIFIER,
        idsociete UNIQUEIDENTIFIER,
        idsite UNIQUEIDENTIFIER,
        iddevise UNIQUEIDENTIFIER,
        dateoperation DATETIME,
        montant DECIMAL(22,9),
        createdat Datetime,
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (iddemande) REFERENCES EnteteDemande(iddemande),
        FOREIGN KEY (iddevise) REFERENCES Devise(iddevise),
        FOREIGN KEY (idsite) REFERENCES Site(idsite),
        FOREIGN KEY (idsociete) REFERENCES Societe(idsociete)
    );
END

-- ============================================
-- 22️⃣ LigneOperationCaisse (dépend de EnteteOperationCaisse, NatureOperation, CentreAnalytique, Tiers, Societe)
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LigneOperationCaisse')
BEGIN
    CREATE TABLE LigneOperationCaisse (
        idligneoperation UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        idoperation UNIQUEIDENTIFIER,
        idnature UNIQUEIDENTIFIER,
        idcentre UNIQUEIDENTIFIER,
        idsociete UNIQUEIDENTIFIER,
        libelle NVARCHAR(255),
        montantoperation DECIMAL(22,9),
        comptabilise INT,
        numpiececomptable NVARCHAR(50),
        datecomptabilisation DATETIME,
        idtiers UNIQUEIDENTIFIER,
        createdat Datetime,
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (idoperation) REFERENCES EnteteOperationCaisse(idoperation) ON DELETE CASCADE,
        FOREIGN KEY (idnature) REFERENCES NatureOperation(idnature),
        FOREIGN KEY (idcentre) REFERENCES CentreAnalytique(idcentreanalytique),
        FOREIGN KEY (idtiers) REFERENCES Tiers(idtiers),
        FOREIGN KEY (idsociete) REFERENCES Societe(idsociete)
    );
END

-- ============================================
-- 62️ CaissePeriode (dépend de EnteteOperationCaisse, Caisse)
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CaissePeriode')
BEGIN
    CREATE TABLE CaissePeriode (
        idperiode UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        idcaisse UNIQUEIDENTIFIER,
        dateperiode DATETIME,
        soldeouverture DECIMAL(22,9),
        soldefermeture DECIMAL(22,9),
        montantphysique DECIMAL(22,9),   -- comptage manuel
        ecart DECIMAL(22,9),
        statut NVARCHAR(20) DEFAULT 'non ouverte',            -- OUVERT / FERME / VALIDE
        validatedat DATETIME,
        validatedby NVARCHAR(50),
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
        FOREIGN KEY (idcaisse) REFERENCES Caisse(idcaisse),
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TypeOperation')
BEGIN
    CREATE TABLE TypeOperation (
		idtypeoperation UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		codtypeoperation NVARCHAR(50),
		idoperation UNIQUEIDENTIFIER,
        idperiode UNIQUEIDENTIFIER,
		idsociete UNIQUEIDENTIFIER,
		idsite UNIQUEIDENTIFIER,
		idcaisse UNIQUEIDENTIFIER,
		montant DECIMAL(21,9),
        taux DECIMAL(18,13),
        montantref DECIMAL(21,9),
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
        FOREIGN KEY (idoperation) REFERENCES EnteteOperationCaisse(idoperation) ON DELETE CASCADE,
		FOREIGN KEY (idcaisse) REFERENCES Caisse(idcaisse),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
		FOREIGN KEY (idsite) REFERENCES Site(idsite),
        FOREIGN KEY (idperiode) REFERENCES CaissePeriode(idperiode),
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Compteurs')
BEGIN
    CREATE TABLE Compteurs (
		prefixe NVARCHAR(10) NOT NULL,
		annee INT NOT NULL,
		mois INT NOT NULL,
		jour INT NOT NULL,
		compteur INT NOT NULL DEFAULT 0,
        createdat Datetime,
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
		PRIMARY KEY (prefixe, annee, mois, jour)
	);
END

-- FIN INIT CHADO



-- ============================================
-- 14️⃣ CircuitValidateur (dépend de Utilisateur, Societe)
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CircuitValidateur')
BEGIN
    CREATE TABLE CircuitValidateur (
        idcircuitvalidateur UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        codecircuitvalidateur NVARCHAR(24) UNIQUE,
        idutilisateur UNIQUEIDENTIFIER,
        idsociete UNIQUEIDENTIFIER,
        idcircuitvalidation UNIQUEIDENTIFIER,
        rangvalidation INT,
        createdat Datetime,
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (idutilisateur) REFERENCES Utilisateur(idutilisateur),
        FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
        FOREIGN KEY (idcircuitvalidation) REFERENCES CircuitValidation(idcircuitvalidation)
    );
END


-- ============================================
-- 20️⃣ ValidationDemande (dépend de EnteteDemande, Societe)
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ValidationDemande')
BEGIN
    CREATE TABLE ValidationDemande (
        idvalidationdemande UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        iddemande UNIQUEIDENTIFIER,
        idsociete UNIQUEIDENTIFIER,
        datevalidation DATETIME,
        createdat Datetime,
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (iddemande) REFERENCES EnteteDemande(iddemande),
        FOREIGN KEY (idsociete) REFERENCES Societe(idsociete)
    );
END

-- FIN INIT GIL



-- En ce qui concerne la gestion des demandes

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UtilisateurDepartement')
BEGIN
    CREATE TABLE UtilisateurDepartement (
		iduserdepartement UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idutilisateur UNIQUEIDENTIFIER,
		iddepartement UNIQUEIDENTIFIER,
		idsociete UNIQUEIDENTIFIER,
		debutactivite Datetime,
		finactivite Datetime,
		createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (iddepartement) REFERENCES Departement(iddepartement),
		FOREIGN KEY (idutilisateur) REFERENCES Utilisateur(idutilisateur),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete)
    );
END

-- FIN INIT DENIS

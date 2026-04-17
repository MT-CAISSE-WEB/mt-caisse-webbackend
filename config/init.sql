-- USE MTCAISSEWEB;
-- -- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Devise')
BEGIN
    CREATE TABLE Devise (
        iddevise UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        codedevise NVARCHAR(3) UNIQUE,
        intitule NVARCHAR(150),
        codeiso NVARCHAR(150),
        actif INT DEFAULT 0,
        createdat Datetime,
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Motif')
BEGIN
    CREATE TABLE Motif (
		idmotif UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		codemotif NVARCHAR(50) UNIQUE,
		libellemotif NVARCHAR(150),
		createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PieceJointe')
BEGIN
    CREATE TABLE PieceJointe (
		idpiecejointe UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		urlpiece NVARCHAR(150) UNIQUE,
		nomtable NVARCHAR(50),
        idtable UNIQUEIDENTIFIER,
        dossier NVARCHAR(50),
		createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ModeleCompteur')
BEGIN
    CREATE TABLE ModeleCompteur (
		idmodelecompteur UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		codemodelecompteur NVARCHAR(50) UNIQUE,
		libelle NVARCHAR(50),
        typedocument NVARCHAR(50) NOT NULL,
        sequence_1 NVARCHAR(50),
        prefixe_1 NVARCHAR(50),
        sequence_2 NVARCHAR(50),
        prefixe_2 NVARCHAR(50),
		createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
    );
END

-- -- ============================================
-- -- 2️⃣ Tauxdevise (dépend de Devise)
-- -- ============================================
-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Tauxdevise')
BEGIN
    CREATE TABLE Tauxdevise (
        idtauxdevise UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		iddeviseorigine UNIQUEIDENTIFIER,
		iddevisedestination UNIQUEIDENTIFIER,
        codetauxdevise NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(150),
		typecours NVARCHAR(50),
        datecours Datetime,
		coefficient DECIMAL(18,9),
		coefficientinverse DECIMAL(18,9),
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (iddeviseorigine) REFERENCES Devise(iddevise),
		FOREIGN KEY (iddevisedestination) REFERENCES Devise(iddevise),
    );
END


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
		email NVARCHAR(50),
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


-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Site')
BEGIN
    CREATE TABLE Site (
        idsite UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idsociete UNIQUEIDENTIFIER,
		codesite nvarchar(50) unique,
		libelle NVARCHAR(150),
		email NVARCHAR(30),
		telephone NVARCHAR(20),
		adresse NVARCHAR(200),
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		idcentreanalytique UNIQUEIDENTIFIER NULL,
		estcentreanalytique INT DEFAULT 0,
		FOREIGN KEY (idcentreanalytique) REFERENCES CentreAnalytique(idcentreanalytique),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete)
    );
END



IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Utilisateur')
BEGIN
    CREATE TABLE Utilisateur (
		idutilisateur UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		codeutilisateur NVARCHAR(24) UNIQUE,
		idsociete UNIQUEIDENTIFIER,
        idsite uniqueidentifier,
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
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		foreign key (idsociete) references Societe(idsociete),
        foreign key (idsite) references Site(idsite)
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

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'utilisateur_role')
BEGIN
CREATE TABLE utilisateur_role (
    idutilisateur UNIQUEIDENTIFIER,
    idrole INT NOT NULL,
	createdby NVARCHAR(50),
    createdat Datetime,
	updatedat Datetime,
	updatedby NVARCHAR(50),
    PRIMARY KEY (idutilisateur, idrole),
    FOREIGN KEY (idrole) REFERENCES role(idrole),
    FOREIGN KEY (idutilisateur) REFERENCES Utilisateur(idutilisateur)
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
        codedept NVARCHAR(50) UNIQUE,
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
        libelle NVARCHAR(100),
        typeentite NVARCHAR(100),
        typeaction NVARCHAR(100),
        idsociete UNIQUEIDENTIFIER,
        idsite UNIQUEIDENTIFIER,
        actif INT DEFAULT 1,
        createdat Datetime,
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
        FOREIGN KEY (idsite) REFERENCES Site(idsite)
    );
END

-- ============================================
--  CircuitEtape 
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Circuitetape')
BEGIN
    CREATE TABLE Circuitetape (
        idcircuitetape UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        idcircuitvalidation UNIQUEIDENTIFIER,
        rang INT,
        nombrevalidateur INT,
        createdat Datetime,
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (idcircuitvalidation) REFERENCES CircuitValidation(idcircuitvalidation)
    );
END

-- ============================================
--  EtapeValidateur 
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Etapevalidateur')
BEGIN
    CREATE TABLE Etapevalidateur (
        idcircuitetape UNIQUEIDENTIFIER,
        idutilisateur UNIQUEIDENTIFIER,
        createdat Datetime,
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        PRIMARY KEY (idcircuitetape,idutilisateur)
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
        statut INT DEFAULT 0,
        niveauactuel INT DEFAULT 1,
        taux DECIMAL(22, 9),
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
        numligne INT,
        libellelignedemande NVARCHAR(255),
        montantdemande DECIMAL(22, 9),
        montantref DECIMAL(22, 9),
        budgetconso DECIMAL(22, 9),
        preengage DECIMAL(22, 9),
        engage DECIMAL(22, 9),
        realise DECIMAL(22, 9),
        idnature UNIQUEIDENTIFIER,
        idbudget UNIQUEIDENTIFIER DEFAULT NULL,
        idcentre UNIQUEIDENTIFIER,
        idtiers UNIQUEIDENTIFIER,
        idsociete UNIQUEIDENTIFIER,
        idsite UNIQUEIDENTIFIER,
        createdat Datetime DEFAULT GETDATE(),
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (iddemande) REFERENCES EnteteDemande(iddemande) ON DELETE CASCADE,
        FOREIGN KEY (idnature) REFERENCES NatureOperation(idnature),
        FOREIGN KEY (idtiers) REFERENCES Tiers(idtiers),
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
        FOREIGN KEY (iddemande) REFERENCES EnteteDemande(iddemande) ON DELETE CASCADE,
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
        idutilisateurcaisse UNIQUEIDENTIFIER PRIMARY KEY,
        idcaisse UNIQUEIDENTIFIER,
        idutilisateur UNIQUEIDENTIFIER,
        idsociete UNIQUEIDENTIFIER,
        actif INT DEFAULT 1,
        createdat DATETIME,
        createdby NVARCHAR(50),
        updatedat DATETIME,
        updatedby NVARCHAR(50),
        CONSTRAINT UQ_UtilisateurCaisse_idcaisse_idutilisateur UNIQUE (idcaisse, idutilisateur),
        FOREIGN KEY (idcaisse) REFERENCES Caisse(idcaisse) ON DELETE CASCADE,
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
        dateoperation_date AS CAST(dateoperation AS DATE),
        montant DECIMAL(22,9),
        montant_str AS CAST(montant AS NVARCHAR(50)),
        justifiee INT DEFAULT 0,
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

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ligneoperationCaisse')
BEGIN
    CREATE TABLE ligneoperationCaisse (
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

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CaisseBilletage')
BEGIN
    CREATE TABLE CaisseBilletage (
        idbilletage UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        idperiode UNIQUEIDENTIFIER,
        valeur DECIMAL(21,9),      -- valeur billet ou pièce
        quantite INT,
        montant DECIMAL(21,9),     -- valeur * quantite
        type NVARCHAR(20),         -- BILLET / PIECE
        createdat DATETIME,
        createdby NVARCHAR(50),
        FOREIGN KEY (idperiode) REFERENCES CaissePeriode(idperiode)
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

-- IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ValidationDemande')
-- BEGIN
--     CREATE TABLE ValidationDemande (
--         idvalidationdemande UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
--         iddemande UNIQUEIDENTIFIER,
--         idsociete UNIQUEIDENTIFIER,
--         datevalidation DATETIME,
--         createdat Datetime,
--         createdby NVARCHAR(50),
--         updatedat Datetime,
--         updatedby NVARCHAR(50),
--         FOREIGN KEY (iddemande) REFERENCES EnteteDemande(iddemande),
--         FOREIGN KEY (idsociete) REFERENCES Societe(idsociete)
--     );
-- END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ValidationDemande')
BEGIN
    CREATE TABLE ValidationDemande (
        idvalidationdemande UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        iddemande UNIQUEIDENTIFIER,
        idcircuitvalidation UNIQUEIDENTIFIER,
        idcircuitetape UNIQUEIDENTIFIER,
        idutilisateur UNIQUEIDENTIFIER,
        idmotif UNIQUEIDENTIFIER,
        decision NVARCHAR(20), -- APPROUVE | REJETE | EN_ATTENTE
        commentaire NVARCHAR(255),
        datevalidation DATETIME,
        rang  INT Default null,
        createdat DATETIME DEFAULT GETDATE(),
        createdby NVARCHAR(50),
        FOREIGN KEY (iddemande) REFERENCES EnteteDemande(iddemande),
        FOREIGN KEY (idmotif) REFERENCES Motif(idmotif),
        FOREIGN KEY (idcircuitvalidation) REFERENCES CircuitValidation(idcircuitvalidation),
        FOREIGN KEY (idcircuitetape) REFERENCES Circuitetape(idcircuitetape),
        FOREIGN KEY (idutilisateur) REFERENCES Utilisateur(idutilisateur)
    );
END

-- FIN INIT GIL

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ValidationBudget')
BEGIN
    CREATE TABLE ValidationBudget (
        idvalidationbudget UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        idbudget UNIQUEIDENTIFIER,
        idcircuitvalidation UNIQUEIDENTIFIER,
        idcircuitetape UNIQUEIDENTIFIER,
        idutilisateur UNIQUEIDENTIFIER,
        idmotif UNIQUEIDENTIFIER,
        decision NVARCHAR(20), -- APPROUVE | REJETE | EN_ATTENTE
        commentaire NVARCHAR(255),
        datevalidation DATETIME,
        rang  INT Default null,
        createdat DATETIME DEFAULT GETDATE(),
        createdby NVARCHAR(50),
        FOREIGN KEY (idbudget) REFERENCES Budget(idbudget),
        FOREIGN KEY (idmotif) REFERENCES Motif(idmotif),
        FOREIGN KEY (idcircuitvalidation) REFERENCES CircuitValidation(idcircuitvalidation),
        FOREIGN KEY (idcircuitetape) REFERENCES Circuitetape(idcircuitetape),
        FOREIGN KEY (idutilisateur) REFERENCES Utilisateur(idutilisateur)
    );
END



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

-- FIN INIT DENIS 🔟 UtilisateurCaisse (dépend de Utilisateur, Caisse, Societe)
-- ============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UtilisateurCaisse')
BEGIN
    CREATE TABLE UtilisateurCaisse (
        idutilisateurcaisse UNIQUEIDENTIFIER PRIMARY KEY,
        idcaisse UNIQUEIDENTIFIER,
        idutilisateur UNIQUEIDENTIFIER,
        idsociete UNIQUEIDENTIFIER,
        actif INT DEFAULT 1,
        createdat DATETIME,
        createdby NVARCHAR(50),
        updatedat DATETIME,
        updatedby NVARCHAR(50),
        CONSTRAINT UQ_UtilisateurCaisse_idcaisse_idutilisateur UNIQUE (idcaisse, idutilisateur),
        FOREIGN KEY (idcaisse) REFERENCES Caisse(idcaisse),
        FOREIGN KEY (idutilisateur) REFERENCES Utilisateur(idutilisateur),
        FOREIGN KEY (idsociete) REFERENCES Societe(idsociete)
    );
END

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
        FOREIGN KEY (idcircuitvalidation) REFERENCES CircuitValidation(idcircuitvalidation) ON DELETE CASCADE
    );
END


-- ============================================
-- 20️⃣ ValidationDemande (dépend de EnteteDemande, Societe)
-- ============================================

-- IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ValidationDemande')
-- BEGIN
--     CREATE TABLE ValidationDemande (
--         idvalidationdemande UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
--         iddemande UNIQUEIDENTIFIER,
--         idsociete UNIQUEIDENTIFIER,
--         datevalidation DATETIME,
--         createdat Datetime,
--         createdby NVARCHAR(50),
--         updatedat Datetime,
--         updatedby NVARCHAR(50),
--         FOREIGN KEY (iddemande) REFERENCES EnteteDemande(iddemande),
--         FOREIGN KEY (idsociete) REFERENCES Societe(idsociete)
--     );
-- END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ValidationDemande')
BEGIN
    CREATE TABLE ValidationDemande (
        idvalidationdemande UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        iddemande UNIQUEIDENTIFIER,
        idcircuitvalidation UNIQUEIDENTIFIER,
        idcircuitetape UNIQUEIDENTIFIER,
        idutilisateur UNIQUEIDENTIFIER,
        decision NVARCHAR(20), -- APPROUVE | REJETE | EN_ATTENTE
        commentaire NVARCHAR(255),
        datevalidation DATETIME,
        rang INT NOT NULL,
        createdat DATETIME DEFAULT GETDATE(),
        createdby NVARCHAR(50),
        FOREIGN KEY (iddemande) REFERENCES EnteteDemande(iddemande),
        FOREIGN KEY (idcircuitvalidation) REFERENCES CircuitValidation(idcircuitvalidation),
        FOREIGN KEY (idcircuitetape) REFERENCES Circuitetape(idcircuitetape),
        FOREIGN KEY (idutilisateur) REFERENCES Utilisateur(idutilisateur)
    );
END

-- FIN INIT GIL


-- En ce qui concerne la gestion des demandes
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UtilisateurDepartement')
BEGIN
    CREATE TABLE UtilisateurDepartement (
		idutilisateur UNIQUEIDENTIFIER,
		iddepartement UNIQUEIDENTIFIER,
		createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
        PRIMARY KEY (idutilisateur,iddepartement),
		FOREIGN KEY (iddepartement) REFERENCES Departement(iddepartement) ON DELETE CASCADE,
		FOREIGN KEY (idutilisateur) REFERENCES Utilisateur(idutilisateur),
    );
END
-- FIN INIT DENIS

-- Justificatif opération
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'JustificatifOperation')
BEGIN
    CREATE TABLE JustificatifOperation (
        idjustificatifoperation UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        codejustificatif NVARCHAR(24) UNIQUE,
        idoperation UNIQUEIDENTIFIER,
        iddevise UNIQUEIDENTIFIER,
        taux DECIMAL(22, 9),
        tauxinverse DECIMAL(22, 9),
        date DATETIME Default GETDATE(),
        montantjustificatif DECIMAL(22, 9),
        commentaire NVARCHAR(255),
        createdat Datetime default GETDATE(),
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (idoperation) REFERENCES EnteteOperationCaisse(idoperation) ON DELETE CASCADE,
        FOREIGN KEY (iddevise) REFERENCES Devise(iddevise)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DetailsJustificatifOperation')
BEGIN
    CREATE TABLE DetailsJustificatifOperation (
        iddetailsjustificatifoperation UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        idjustificatif UNIQUEIDENTIFIER,
        idnature UNIQUEIDENTIFIER,
        idcentreanalytique UNIQUEIDENTIFIER,
        idtiers UNIQUEIDENTIFIER,
        montantdetail DECIMAL(22, 9),
        montantref DECIMAL(22, 9),
        comptabilise INT,
        numpiececomptable NVARCHAR(50),
        datecomptabilisation DATETIME,
        createdat Datetime default GETDATE(),
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (idjustificatif) REFERENCES JustificatifOperation(idjustificatifoperation) ON DELETE CASCADE,
        FOREIGN KEY (idnature) REFERENCES NatureOperation(idnature),
        FOREIGN KEY (idcentreanalytique) REFERENCES CentreAnalytique(idcentreanalytique),
        FOREIGN KEY (idtiers) REFERENCES Tiers(idtiers)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Transfertfond')
BEGIN
    CREATE TABLE Transfertfond (
        idtransfert UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        codetransfert NVARCHAR(24) UNIQUE,
        typesource NVARCHAR(20),
        idsourcebanque UNIQUEIDENTIFIER,
        idsourcecaisse UNIQUEIDENTIFIER,
        typedestination NVARCHAR(20),
        iddestination UNIQUEIDENTIFIER,
        taux DECIMAL(22, 9),
        montant DECIMAL(22, 9),
        montantref DECIMAL(22, 9),
        datetransfert DATETIME NOT NULL,
        description NVARCHAR(100),
        statut INT DEFAULT 0,
        createdat Datetime default GETDATE(),
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (iddestination) REFERENCES Caisse(idcaisse),
        FOREIGN KEY (idsourcebanque) REFERENCES banque(idbanque),
        FOREIGN KEY (idsourcecaisse) REFERENCES Caisse(idcaisse)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ParametreComptable')
BEGIN
    CREATE TABLE ParametreComptable (
        idparametrecomptable UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        idsociete UNIQUEIDENTIFIER UNIQUE,
        idjournal UNIQUEIDENTIFIER NULL,
        idcompte UNIQUEIDENTIFIER NULL,
        urldossier NVARCHAR(255),
        createdat Datetime default GETDATE(),
        createdby NVARCHAR(50),
        updatedat Datetime,
        updatedby NVARCHAR(50),
        FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
        FOREIGN KEY (idjournal) REFERENCES Journal(idjournal),
        FOREIGN KEY (idcompte) REFERENCES PlanComptable(idcompte)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Appconfig')
BEGIN
    CREATE TABLE AppConfig (
    code NVARCHAR(50) PRIMARY KEY,
    valeur NVARCHAR(100) NOT NULL,
    description NVARCHAR(255),
    createdat Datetime DEFAULT GETDATE(),
    createdby NVARCHAR(50),
    updatedat Datetime,
    updatedby NVARCHAR(50)
    );
END
IF NOT EXISTS (
    SELECT 1 
    FROM AppConfig 
    WHERE code = 'APP_INITIALIZED'
)
BEGIN
    INSERT INTO AppConfig (code, valeur)
    VALUES ('APP_INITIALIZED', '0');
END

-- Index sur CentreAnalytique(idcentreanalytique)
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_CentreAnalytique_Id'
    AND object_id = OBJECT_ID('CentreAnalytique')
)
BEGIN
    CREATE INDEX IX_CentreAnalytique_Id
    ON CentreAnalytique(idcentreanalytique);
END

-- Index sur Tiers(idtiers)
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_Tiers_Id'
    AND object_id = OBJECT_ID('Tiers')
)
BEGIN
    CREATE INDEX IX_Tiers_Id
    ON Tiers(idtiers);
END

-- Index sur Devise(codedevise)
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_Devise_Code'
    AND object_id = OBJECT_ID('Devise')
)
BEGIN
    CREATE INDEX IX_Devise_Code
    ON Devise(codedevise)
    INCLUDE (iddevise);
END

-- Index sur NatureOperation(idnature)
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_NatureOperation_Id'
    AND object_id = OBJECT_ID('NatureOperation')
)
BEGIN
    CREATE INDEX IX_NatureOperation_Id
    ON NatureOperation(idnature);
END

-- Index sur TypeOperation(idoperation)
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_TypeOperation_IdOperation'
    AND object_id = OBJECT_ID('TypeOperation')
)
BEGIN
    CREATE INDEX IX_TypeOperation_IdOperation
    ON TypeOperation(idoperation);
END

-- Index sur LigneOperationCaisse(idoperation)
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_LigneOperationCaisse_IdOperation'
    AND object_id = OBJECT_ID('LigneOperationCaisse')
)
BEGIN
    CREATE INDEX IX_LigneOperationCaisse_IdOperation
    ON LigneOperationCaisse(idoperation)
    INCLUDE (idligneoperation, idnature,idcentre,idtiers,montantoperation);
END

-- Index sur EnteteOperationCaisse(dateoperation_date)
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_EnteteOperationCaisse_Date'
    AND object_id = OBJECT_ID('EnteteOperationCaisse')
)
BEGIN
    CREATE INDEX IX_EnteteOperationCaisse_Date
    ON EnteteOperationCaisse(dateoperation_date);
END

-- Index sur EnteteOperationCaisse(createdat DESC, idsite)
IF NOT EXISTS(
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_EnteteOperationCaisse_other'
    AND object_id = OBJECT_ID('EnteteOperationCaisse')
)
BEGIN
    CREATE INDEX IX_EnteteOperationCaisse_other
    ON EnteteOperationCaisse(createdat DESC, idsite)
    INCLUDE (
        idoperation,
        codeoperation,
        montant,
        iddevise,
        idsociete,
        dateoperation
    );
END

-- Index sur EnteteOperationCaisse(codeoperation, montant_str);
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_EnteteOperationCaisse_Search'
    AND object_id = OBJECT_ID('EnteteOperationCaisse')
)
BEGIN
    CREATE INDEX IX_EnteteOperationCaisse_Search
    ON EnteteOperationCaisse(codeoperation, montant_str);
END

-- Index sur EnteteOperationCaisse(dateoperation)
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_operation_date'
    AND object_id = OBJECT_ID('EnteteOperationCaisse')
)
BEGIN
    CREATE INDEX IX_operation_date
    ON EnteteOperationCaisse(dateoperation);
END

-- Index sur TypeOperation(idoperation)
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_typeoperation_operation'
    AND object_id = OBJECT_ID('TypeOperation')
)
BEGIN
    CREATE INDEX IX_typeoperation_operation
    ON TypeOperation(idoperation);
END

-- Index sur JustificatifOperation(idoperation)
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_justificatif_operation'
    AND object_id = OBJECT_ID('JustificatifOperation')
)
BEGIN
    CREATE INDEX IX_justificatif_operation
    ON JustificatifOperation(idoperation);
END

-- Index sur DetailsJustificatifOperation(idjustificatif)
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_detailjustificatif'
    AND object_id = OBJECT_ID('DetailsJustificatifOperation')
)
BEGIN
    CREATE INDEX IX_detailjustificatif
    ON DetailsJustificatifOperation(idjustificatif);
END

-- Index sur ligneoperationCaisse(idoperation)
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_ligneoperation'
    AND object_id = OBJECT_ID('ligneoperationCaisse')
)
BEGIN
    CREATE INDEX IX_ligneoperation
    ON ligneoperationCaisse(idoperation);
END

-- Index sur typeoperation(idoperation, codtypeoperation)
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_TypeOperation_operation_code'
    AND object_id = OBJECT_ID('TypeOperation')
)
BEGIN
    CREATE INDEX IX_TypeOperation_operation_code
    ON TypeOperation(idoperation, codtypeoperation);
END

-- Index sur EnteteOperationCaisse(idsociete, idsite, createdat)
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_operation_societe_site'
    AND object_id = OBJECT_ID('EnteteOperationCaisse')
)
BEGIN
    CREATE INDEX IX_operation_societe_site
    ON EnteteOperationCaisse(idsociete, idsite, createdat);
END

-- Index sur LigneDemande(iddemande)
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_LigneDemande_IdDemande'
    AND object_id = OBJECT_ID('LigneDemande')
)
BEGIN
    CREATE INDEX IX_LigneDemande_IdDemande
    ON LigneDemande(iddemande)
    INCLUDE (idlignedemande, numligne, idnature, idcentre, montantdemande);
END

-- Index sur EnteteDemande(createdat DESC, idsite)
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_EnteteDemande_Main'
    AND object_id = OBJECT_ID('EnteteDemande')
)
BEGIN
    CREATE INDEX IX_EnteteDemande_Main
    ON EnteteDemande(createdat DESC, idsite)
    INCLUDE (iddemande, codedemande, libelledemande, idsociete, iddevise, iddepartement, idcircuit);
END

-- Index sur EnteteDemande(codedemande, libelledemande)
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_EnteteDemande_Search'
    AND object_id = OBJECT_ID('EnteteDemande')
)
BEGIN
    CREATE INDEX IX_EnteteDemande_Search
    ON EnteteDemande(codedemande, libelledemande);
END

-- Index sur DetailsDemande(idlignedemande)
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE name = 'IX_DetailsDemande_Ligne'
    AND object_id = OBJECT_ID('DetailsDemande ')
)
BEGIN
    CREATE INDEX IX_DetailsDemande_Ligne
    ON DetailsDemande(idlignedemande)
    INCLUDE (quantite, montant, description);
END

IF NOT EXISTS (
    SELECT 1 
    FROM sys.procedures 
    WHERE name = 'GenererNumeroOperation'
)
BEGIN
    EXEC('
        CREATE PROCEDURE GenererNumeroOperation
            @prefixe NVARCHAR(10),
            @annee INT,
            @mois INT,
            @jour INT,
            @numero NVARCHAR(50) OUTPUT
        AS
        BEGIN
            SET NOCOUNT ON;

            DECLARE @compteur INT;

            BEGIN TRANSACTION;

            -- Créer le compteur s''il n''existe pas
            IF NOT EXISTS (
                SELECT 1 
                FROM Compteurs
                WHERE prefixe = @prefixe
                  AND annee   = @annee
                  AND mois    = @mois
                  AND jour    = @jour
            )
            BEGIN
                INSERT INTO Compteurs(prefixe, annee, mois, jour, compteur)
                VALUES (@prefixe, @annee, @mois, @jour, 0);
            END

            -- Incrémenter le compteur
            UPDATE Compteurs
            SET compteur = compteur + 1
            WHERE prefixe = @prefixe
              AND annee   = @annee
              AND mois    = @mois
              AND jour    = @jour;

            SELECT @compteur = compteur
            FROM Compteurs
            WHERE prefixe = @prefixe
              AND annee   = @annee
              AND mois    = @mois
              AND jour    = @jour;

            COMMIT TRANSACTION;

            -- Génération du numéro final
            SET @numero =
                @prefixe + ''-'' +
                CAST(@annee AS NVARCHAR) + ''-'' +
                RIGHT(''00'' + CAST(@mois AS NVARCHAR), 2) + ''-'' +
                RIGHT(''00'' + CAST(@jour AS NVARCHAR), 2) + ''-'' +
                RIGHT(''000'' + CAST(@compteur AS NVARCHAR), 3);
        END
    ');
END
-- GO

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
) AS mc(codemodelecompteur, libelle, typedocument, sequence_1, prefixe_1, sequence_2, prefixe_2, createdat, createdby)
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

-- ==========================================================================================
--  Comptabilisation des opérations de caisse 
-- ==========================================================================================
-- ============================================
--  Table Ecriture Comptable 
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EcritureComptable')
BEGIN
    CREATE TABLE EcritureComptable (
		idecriture UNIQUEIDENTIFIER,
        ref_ecriture NVARCHAR(255),

        idtypeoperation UNIQUEIDENTIFIER null,
        codtypeoperation NVARCHAR(255) null,

        idjournal UNIQUEIDENTIFIER,
        journal NVARCHAR(255),

        date_operation DATETIME,
		createdby NVARCHAR(50),
        createdat DATETIME,
		updatedby NVARCHAR(50),
        updatedat Datetime,
        PRIMARY KEY (idecriture),
    
		FOREIGN KEY (idtypeoperation) references TypeOperation,
		FOREIGN KEY (idjournal) references Journal
	);
END

-- ============================================
--  Ecriture Ligne Comptable 
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EcritureLigneComptable')
BEGIN
    CREATE TABLE EcritureLigneComptable (
        idligneecriture UNIQUEIDENTIFIER,
		idecriture UNIQUEIDENTIFIER,

        idnature uniqueidentifier null,
        nature nvarchar(255) null,

        idcentreanalytique UNIQUEIDENTIFIER null,
        centreanalytique nvarchar (255) null,

        idcompte UNIQUEIDENTIFIER,
        compte nvarchar(255),

        idtiers UNIQUEIDENTIFIER null,
        tiers nvarchar(255) null,

        numligne INT,
        typeecriture NVARCHAR(50),
        libelle NVARCHAR(255),
        debit DECIMAL(22,9),
        credit DECIMAL(22,9),
        etat NVARCHAR(20), -- PROVISOIRE, VALIDE, ANNULE

        iddevise UNIQUEIDENTIFIER,
        devise nvarchar(50),
        montantdevise DECIMAL(22,9),
        taux DECIMAL(18,6),
        montantbase DECIMAL(22,9),

		createdby NVARCHAR(50),
        createdat DATETIME,
		updatedby NVARCHAR(50),
        updatedat Datetime,
        PRIMARY KEY ( idligneecriture ),
		FOREIGN KEY (idecriture) references ecriturecomptable,
        foreign key (iddevise) references Devise(iddevise),
        foreign key (idcentreanalytique) references CentreAnalytique(idcentreanalytique),
        foreign key (idcompte) references PlanComptable,
        foreign key (idtiers) references tiers(idtiers),
        foreign key (idnature) references NatureOperation(idnature)

    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PieceComptableSequence')
BEGIN
CREATE TABLE PieceComptableSequence (
    id INT IDENTITY PRIMARY KEY,
    journal NVARCHAR(10),
    datepiece NVARCHAR(10),
    sequence INT
);
END
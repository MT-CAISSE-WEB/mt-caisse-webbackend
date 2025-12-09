-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Devise')
BEGIN
    CREATE TABLE Devise (
		iddevise UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        code NVARCHAR(3) UNIQUE,
		intitule NVARCHAR(150),
		codeIso NVARCHAR(150),
		actif INT DEFAULT 0,
		createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
    );
END

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
		coefficient DECIMAL(13,12),
		coefficientinverse DECIMAL(13,12),
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

-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CentreAnalytique')
BEGIN
    CREATE TABLE CentreAnalytique (
        idcentreanalytique UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idsociete UNIQUEIDENTIFIER,
		code NVARCHAR(50) UNIQUE,
		libelle NVARCHAR(150),
		actif INT DEFAULT 0,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
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
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		foreign key (idsociete) references Societe(idsociete)
    );
END

---OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name='refresh_token')
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

-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PlanComptable')
BEGIN
    CREATE TABLE PlanComptable (
        idcompte UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
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
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );
END

-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NatureOperation')
BEGIN
    CREATE TABLE NatureOperation (
        idnature UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		codenature NVARCHAR(50) UNIQUE,
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
		idcompte UNIQUEIDENTIFIER,
		numcompte NVARCHAR(50),
		libelle NVARCHAR(150),
		avanceAjustifier INT DEFAULT 1,
		imputationTiers INT DEFAULT 1,
		actif INT DEFAULT 1,
		demandeDecaissement INT DEFAULT 0,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
		FOREIGN KEY (idcompte) REFERENCES PlanComptable(idcompte),
		FOREIGN KEY (numcompte) REFERENCES PlanComptable(numcompte)
    );
END

-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AffectationAnalytique')
BEGIN
    CREATE TABLE AffectationAnalytique (
        idaffectation UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
		idsite UNIQUEIDENTIFIER,
		codesite NVARCHAR(50),
		iddepartement UNIQUEIDENTIFIER,
		codedept NVARCHAR(50),
		idcentre UNIQUEIDENTIFIER,
		codecentre NVARCHAR(50),
		idnature UNIQUEIDENTIFIER,
		codenature NVARCHAR(50),
		actif INT DEFAULT 1,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
		FOREIGN KEY (idsite) REFERENCES Site(idsite),
		FOREIGN KEY (iddepartement) REFERENCES Departement(iddepartement),
		FOREIGN KEY (idcentre) REFERENCES CentreAnalytique(idcentreanalytique),
		FOREIGN KEY (idnature) REFERENCES NatureOperation(idnature)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DepartementNature')
BEGIN
    CREATE TABLE DepartementNature (
        iddepartementnature UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idsociete UNIQUEIDENTIFIER,
		iddepartement UNIQUEIDENTIFIER,
		idnature UNIQUEIDENTIFIER,
		actif INT DEFAULT 1,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
		FOREIGN KEY (iddepartement) REFERENCES Departement(iddepartement),
		FOREIGN KEY (idnature) REFERENCES NatureOperation(idnature)
    );
END

-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CircuitValidation')
BEGIN
    CREATE TABLE CircuitValidation (
        idcircuit UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		code NVARCHAR(24) UNIQUE,
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
		idsite UNIQUEIDENTIFIER,
		codesite NVARCHAR(50),
		typeentite NVARCHAR(100),
		-- CHECK (typeentite IN ('Site', 'Societe')),
		typeaction NVARCHAR(100),
		-- CHECK (typeaction IN ('Appro Caisse', 'Budget', 'Demande de d�caissement')),
		iddepartement UNIQUEIDENTIFIER,
		codedept NVARCHAR(50),
		actif INT DEFAULT 1,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
		FOREIGN KEY (idsite) REFERENCES Site(idsite),
		FOREIGN KEY (iddepartement) REFERENCES Departement(iddepartement),
    );
END

-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CircuitValidateur')
BEGIN
    CREATE TABLE CircuitValidateur (
        idcircuitvalidateur UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		codecircuitvalidateur nvarchar(50),
		idutilisateur UNIQUEIDENTIFIER,
		idsociete UNIQUEIDENTIFIER,
		rangvalidation INT,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (idutilisateur) REFERENCES Utilisateur(idutilisateur),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );
END

-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Tiers')
BEGIN
    CREATE TABLE Tiers (
        idtiers UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		codetiers NVARCHAR(24) UNIQUE,
		designation NVARCHAR(150),
		typetiers NVARCHAR(50),
		--  CHECK (type IN ('Client', 'Fournisseur', 'Salari�', 'Autres')),
		actif INT DEFAULT 1,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
    );
END

-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Journal')
BEGIN
    CREATE TABLE Journal (
        idjournal UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		codejournal NVARCHAR(24) UNIQUE,
		designation NVARCHAR(150),
		actif INT DEFAULT 1,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
    );
END

-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Caisse')
BEGIN
    CREATE TABLE Caisse (
        idcaisse UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		codecaisse NVARCHAR(24) UNIQUE,
		libelle NVARCHAR(100),
		idjournal UNIQUEIDENTIFIER,
		codejournal NVARCHAR(24),
		iddevise UNIQUEIDENTIFIER,
		codedevise NVARCHAR(3),
		idsite UNIQUEIDENTIFIER,
		codesite NVARCHAR(50),
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
		idcompte UNIQUEIDENTIFIER,
		numcompte NVARCHAR(50),
		actif INT DEFAULT 1,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
		FOREIGN KEY (iddevise) REFERENCES Devise(iddevise),
		FOREIGN KEY (idsite) REFERENCES Site(idsite),
		FOREIGN KEY (idjournal) REFERENCES Journal(idjournal),
		FOREIGN KEY (idcompte) REFERENCES PlanComptable(idcompte),
    );
END

-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UtilisateurCaisse')
BEGIN
    CREATE TABLE UtilisateurCaisse (
        idcaisse UNIQUEIDENTIFIER,
		codecaisse NVARCHAR(24),
		idutilisateur UNIQUEIDENTIFIER,
		codeutilisateur NVARCHAR(24),
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
		actif INT DEFAULT 1,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		CONSTRAINT PK_User_Caisse PRIMARY KEY (idcaisse, idutilisateur),
		FOREIGN KEY (idcaisse) REFERENCES Caisse(idcaisse),
		FOREIGN KEY (idutilisateur) REFERENCES Utilisateur(idutilisateur),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );
END

-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Budget')
BEGIN
    CREATE TABLE Budget (
		idbudget UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		code NVARCHAR(24) UNIQUE,
		idbudgetparent NVARCHAR(50),
		typebudget NVARCHAR(50),
		-- CHECK (typebudget IN ('Annuel', 'Mensuel')),
		datedebut DATETIME,
		datefin DATETIME,
		actif INT,
		cloture INT DEFAULT 1,
		valide INT DEFAULT 1,
		-- codecircuit NVARCHAR,
		dernierniveau NVARCHAR(1),
		niveauactuel NVARCHAR(1),
		validedept NVARCHAR(1),
		datevalidedept DATETIME,
		validesite NVARCHAR(1),
		datevalidesite DATETIME,
		validesociete NVARCHAR(1),
		datevalidesociete DATETIME,
		idsite UNIQUEIDENTIFIER,
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
		codesite NVARCHAR(50),
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (idsite) REFERENCES Site(idsite),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );
END


-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BudgetDepartementNature')
BEGIN
    CREATE TABLE BudgetDepartementNature (
		idbudget UNIQUEIDENTIFIER,
		codebudget NVARCHAR(24),
		iddepartement UNIQUEIDENTIFIER,
		codedept NVARCHAR(50),
		idnature UNIQUEIDENTIFIER,
		codenature NVARCHAR(50),
		montantprevisiondept DECIMAL(13,12),
		montantprevisionsite DECIMAL(13,12),
		montantprevisionsociete DECIMAL(13,12),
		totalconsocloture DECIMAL(13,12),
		soldecloture DECIMAL(13,12),
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (idbudget) REFERENCES Budget(idbudget),
		FOREIGN KEY (iddepartement) REFERENCES Departement(iddepartement),
		FOREIGN KEY (idnature) REFERENCES NatureOperation(idnature),
    );
END


-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EnteteDemande')
BEGIN
    CREATE TABLE EnteteDemande (
		iddemande UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		codedemande NVARCHAR(50) UNIQUE,
		iddemandeur UNIQUEIDENTIFIER,
		codedemandeur NVARCHAR(24),
		typedemande NVARCHAR(50),
		-- CHECK (typedemande IN ('D�caissement', 'Appro caisse')),
		libelledemande NVARCHAR,
		datedemande DATETIME,
		decaisse INT DEFAULT 1,
		solde INT DEFAULT 1,
		idcircuit UNIQUEIDENTIFIER,
		codecircuit NVARCHAR(24),
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
		idsite UNIQUEIDENTIFIER,
		codesite NVARCHAR(50),
		iddepartement UNIQUEIDENTIFIER,
		codedept NVARCHAR(50),
		iddevise UNIQUEIDENTIFIER,
		codedevise NVARCHAR(3),
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (iddemandeur) REFERENCES Utilisateur(idutilisateur),
		FOREIGN KEY (idcircuit) REFERENCES CircuitValidation(idcircuit),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
		FOREIGN KEY (idsite) REFERENCES Site(idsite),
		FOREIGN KEY (iddepartement) REFERENCES Departement(iddepartement),
		FOREIGN KEY (iddevise) REFERENCES Devise(iddevise),
    );
END

-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LigneDemande')
BEGIN
    CREATE TABLE LigneDemande (
		idlignedemande UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		iddemande UNIQUEIDENTIFIER,
		codedemande NVARCHAR(50),
		numligne INT UNIQUE,
		libellelignedemande NVARCHAR,
		montantdemande DECIMAL(13,12),
		idnature UNIQUEIDENTIFIER,
		codenature NVARCHAR(50),
		idbudget UNIQUEIDENTIFIER DEFAULT NULL,
		codebudget NVARCHAR(24),
		idcentre UNIQUEIDENTIFIER,
		codecentre NVARCHAR(50),
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
		idsite UNIQUEIDENTIFIER,
		codesite NVARCHAR(50),
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (iddemande) REFERENCES EnteteDemande(iddemande),
		FOREIGN KEY (idnature) REFERENCES NatureOperation(idnature),
		FOREIGN KEY (idbudget) REFERENCES Budget(idbudget),
		FOREIGN KEY (idcentre) REFERENCES CentreAnalytique(idcentreanalytique),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
		FOREIGN KEY (idsite) REFERENCES Site(idsite),
    );
END


-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DetailsDemande')
BEGIN
    CREATE TABLE DetailsDemande (
		iddetailsdemande UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		iddemande UNIQUEIDENTIFIER,
		codedemande NVARCHAR(50),
		numligne INT,
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
		descriptionn NVARCHAR,
		quantite DECIMAL(13,12),
		montant DECIMAL(13,12),
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (iddemande) REFERENCES EnteteDemande(iddemande),
		FOREIGN KEY (numligne) REFERENCES LigneDemande(numligne),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );
END

-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ValidationDemande')
BEGIN
    CREATE TABLE ValidationDemande (
		idvalidationdemande UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		iddemande UNIQUEIDENTIFIER,
		codedemande NVARCHAR(50),
		idutilisateur UNIQUEIDENTIFIER,
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
		datevalidation DATETIME,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (iddemande) REFERENCES EnteteDemande(iddemande),
		FOREIGN KEY (idutilisateur) REFERENCES Utilisateur(idutilisateur),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );
END

-- OK
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EnteteOperationCaisse')
BEGIN
    CREATE TABLE EnteteOperationCaisse (
		idoperation UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		codeoperation NVARCHAR(50) UNIQUE,
		iddemande UNIQUEIDENTIFIER,
		codedemande NVARCHAR(50),
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
		-- idcaisse UNIQUEIDENTIFIER,
		-- codecaisse NVARCHAR(24),
		dateoperation DATETIME,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (iddemande) REFERENCES EnteteDemande(iddemande),
		-- FOREIGN KEY (idcaisse) REFERENCES Caisse(idcaisse),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LigneOperationCaisse')
BEGIN
    CREATE TABLE LigneOperationCaisse (
		idligneoperation UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idoperation UNIQUEIDENTIFIER,
		codeoperation  NVARCHAR(50),
		idnature UNIQUEIDENTIFIER,
		codenature NVARCHAR(50),
		idcentre UNIQUEIDENTIFIER,
		codecentre NVARCHAR(50),
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
		iddevise UNIQUEIDENTIFIER,
		codedevise NVARCHAR(50),
		libelle NVARCHAR,
		montantoperation DECIMAL(13,12),
		comptabilise INT,
		numpiececomptable NVARCHAR,
		datecomptabilisation DATETIME,
		idtiers UNIQUEIDENTIFIER,
		codetiers NVARCHAR(24),
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (idoperation) REFERENCES EnteteOperationCaisse(idoperation),
		FOREIGN KEY (idnature) REFERENCES NatureOperation(idnature),
		FOREIGN KEY (idcentre) REFERENCES CentreAnalytique(idcentreanalytique),
		FOREIGN KEY (idtiers) REFERENCES Tiers(idtiers),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );
END
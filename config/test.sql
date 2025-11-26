USE MTCAISSEWEB
-- OK

-- O
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


-- OK

    CREATE TABLE Tauxdevise (
        idtauxdevise UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		iddeviseorigine UNIQUEIDENTIFIER,
		codedevori NVARCHAR(3),
		iddevisedestination UNIQUEIDENTIFIER,
		codedevdest NVARCHAR(3),
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



-- OK
    CREATE TABLE Societe (
        idsociete UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        codesociete NVARCHAR(50) UNIQUE,
		iddevisereference UNIQUEIDENTIFIER,
		codedevisereference NVARCHAR(3),
		iddevisereporting UNIQUEIDENTIFIER,
		codedevisereporting NVARCHAR(3),
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


    CREATE TABLE Utilisateur (
		idutilisateur UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		code NVARCHAR(24) UNIQUE,
		nom NVARCHAR(100),
		prenom NVARCHAR(100),
		adresse NVARCHAR(100),
		telephone NVARCHAR(50),
		email NVARCHAR(50),
		typeentitesite INT DEFAULT 0,
		typeentitedepartement INT DEFAULT 0,
		typeentitesociete INT DEFAULT 0,
		acheteur INT DEFAULT 0,
		iddepartement UNIQUEIDENTIFIER NULL,
        codedept NVARCHAR(50) NULL,
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		-- FOREIGN KEY (iddepartement) REFERENCES Departement(iddepartement),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );


-- OK

    CREATE TABLE CentreAnalytique (
        idcentreanalytique UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
		code NVARCHAR(50) UNIQUE,
		libelle NVARCHAR(150),
		actif INT DEFAULT 0,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );


-- 
    CREATE TABLE Sites (
        idsite UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
		idcentre UNIQUEIDENTIFIER,
		codeanalytique NVARCHAR(50) NULL,
		codesite NVARCHAR(50) UNIQUE,
		libelle NVARCHAR(150),
		email NVARCHAR(30),
		telephone NVARCHAR(20),
		adresse NVARCHAR(200),
		estcentreanalytique INT DEFAULT 0,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (idcentre) REFERENCES CentreAnalytique(idcentreanalytique),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );

-- OK
 
    CREATE TABLE Departement (
        iddepartement UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
		idsite UNIQUEIDENTIFIER,
		codesite NVARCHAR(50),
		responsable UNIQUEIDENTIFIER NULL,
		codedept NVARCHAR(50) UNIQUE,
		libelle NVARCHAR(150),
		email NVARCHAR(30),
		telephone NVARCHAR(20),
		adresse NVARCHAR(200),
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (idsite) REFERENCES Sites(idsite),
		FOREIGN KEY (responsable) REFERENCES Utilisateur(idutilisateur),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );

	ALTER TABLE Utilisateur
	ADD CONSTRAINT FK_Utilisateur_Departement
	FOREIGN KEY (iddepartement) REFERENCES Departement(iddepartement);

-- OK

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



-- OK
 
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



-- OK
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
		FOREIGN KEY (idsite) REFERENCES Sites(idsite),
		FOREIGN KEY (iddepartement) REFERENCES Departement(iddepartement),
		FOREIGN KEY (idcentre) REFERENCES CentreAnalytique(idcentreanalytique),
		FOREIGN KEY (idnature) REFERENCES NatureOperation(idnature)
    );



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



-- OK
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
		-- CHECK (typeaction IN ('Appro Caisse', 'Budget', 'Demande de décaissement')),
		iddepartement UNIQUEIDENTIFIER,
		codedept NVARCHAR(50),
		actif INT DEFAULT 1,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
		FOREIGN KEY (idsite) REFERENCES Sites(idsite),
		FOREIGN KEY (iddepartement) REFERENCES Departement(iddepartement),
    );



-- OK
    CREATE TABLE CircuitValidateur (
        idcircuitvalidateur UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		code NVARCHAR(24) UNIQUE,
		idutilisateur UNIQUEIDENTIFIER,
		codeutilisateur NVARCHAR(24),
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
		rangvalidation INT,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (idutilisateur) REFERENCES Utilisateur(idutilisateur),
		FOREIGN KEY (codeutilisateur) REFERENCES Utilisateur(code),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );



-- 
    CREATE TABLE Tiers (
        idtiers UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		codetiers NVARCHAR(24) UNIQUE,
		designation NVARCHAR(150),
		typetiers NVARCHAR(50),
		--  CHECK (type IN ('Client', 'Fournisseur', 'Salarié', 'Autres')),
		actif INT DEFAULT 1,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
    );



-- OK
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



-- O
    CREATE TABLE Caisse (
        idcaisse UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		codecaisse NVARCHAR(24) UNIQUE,
		libelle NVARCHAR(100),
		idjournal UNIQUEIDENTIFIER NULL,
		codejournal NVARCHAR(24),
		iddevise UNIQUEIDENTIFIER NULL,
		codedevise NVARCHAR(3),
		idsite UNIQUEIDENTIFIER NULL,
		codesite NVARCHAR(50),
		idsociete UNIQUEIDENTIFIER NULL,
		codesociete NVARCHAR(50),
		idcompte UNIQUEIDENTIFIER NULL,
		numcompte NVARCHAR(50),
		actif INT DEFAULT 1,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
		FOREIGN KEY (iddevise) REFERENCES Devise(iddevise),
		FOREIGN KEY (idsite) REFERENCES Sites(idsite),
		FOREIGN KEY (idjournal) REFERENCES Journal(idjournal),
		FOREIGN KEY (idcompte) REFERENCES PlanComptable(idcompte),
    );



-- OK
    CREATE TABLE UtilisateurCaisse (
		idutilsateurcaisse UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
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
		FOREIGN KEY (idcaisse) REFERENCES Caisse(idcaisse),
		FOREIGN KEY (idutilisateur) REFERENCES Utilisateur(idutilisateur),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );



-- O
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
		codecircuit NVARCHAR,
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
		FOREIGN KEY (idsite) REFERENCES Sites(idsite),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );



-- OK
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



-- OK
    CREATE TABLE EnteteDemande (
		iddemande UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		codedemande NVARCHAR(50) UNIQUE,
		iddemandeur UNIQUEIDENTIFIER,
		codedemandeur NVARCHAR(24),
		typedemande NVARCHAR(50),
		-- CHECK (typedemande IN ('Décaissement', 'Appro caisse')),
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
		FOREIGN KEY (idsite) REFERENCES Sites(idsite),
		FOREIGN KEY (iddepartement) REFERENCES Departement(iddepartement),
		FOREIGN KEY (iddevise) REFERENCES Devise(iddevise),
    );



-- OK
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
		FOREIGN KEY (idsite) REFERENCES Sites(idsite),
    );



-- OK
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



-- OK
    CREATE TABLE ValidationDemande (
		idvalidationdemande UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		iddemande UNIQUEIDENTIFIER,
		codedemande NVARCHAR(50),
		codeutilisateur NVARCHAR(24),
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
		datevalidation DATETIME,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (iddemande) REFERENCES EnteteDemande(iddemande),
		FOREIGN KEY (codeutilisateur) REFERENCES Utilisateur(code),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );



-- OK
    CREATE TABLE EnteteOperationCaisse (
		idoperation UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		codeoperation NVARCHAR(50) UNIQUE,
		iddemande UNIQUEIDENTIFIER NULL,
		codedemande NVARCHAR(50) NULL,
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
		idsite UNIQUEIDENTIFIER,
		codesite NVARCHAR(50),
		dateoperation DATETIME,
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (iddemande) REFERENCES EnteteDemande(iddemande),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
		FOREIGN KEY (idsite) REFERENCES Sites(idsite),
    );



-- OK
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
		idsite UNIQUEIDENTIFIER,
		codesite NVARCHAR(50),
		iddevise UNIQUEIDENTIFIER,
		codedevise NVARCHAR(50),
		libelle NVARCHAR(255),
		montantoperation DECIMAL(22,9),
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
		FOREIGN KEY (idsite) REFERENCES Sites(idsite),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
    );



    CREATE TABLE TypeOperation (
		idtypeoperation UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		codtypeoperation NVARCHAR(50),
		idoperation UNIQUEIDENTIFIER,
		codeoperation NVARCHAR(50),
		idsociete UNIQUEIDENTIFIER,
		codesociete NVARCHAR(50),
		idsite UNIQUEIDENTIFIER,
		codesite NVARCHAR(50),
		idcaisse UNIQUEIDENTIFIER,
		codecaisse NVARCHAR(24),
		montant DECIMAL(21, 9),
        createdat Datetime,
		createdby NVARCHAR(50),
		updatedat Datetime,
		updatedby NVARCHAR(50),
		FOREIGN KEY (idcaisse) REFERENCES Caisse(idcaisse),
		FOREIGN KEY (idsociete) REFERENCES Societe(idsociete),
		FOREIGN KEY (idsite) REFERENCES Sites(idsite),
    );

	CREATE SEQUENCE SeqNumeroOperation
		START WITH 1
		INCREMENT BY 1;

	CREATE TABLE Compteurs (
		prefixe NVARCHAR(10) NOT NULL,
		annee INT NOT NULL,
		compteur INT NOT NULL DEFAULT 0,
		PRIMARY KEY (prefixe, annee)
	);


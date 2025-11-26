IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Ttable')
BEGIN
    CREATE TABLE Ttable (
        id INT,
		idTtable UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(200),
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ChampTable')
BEGIN
    CREATE TABLE ChampTable (
        id INT,
		idChampTable UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idTtable UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(200),
		typeChamp NVARCHAR(50),
		taille NVARCHAR(50),
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idTtable) REFERENCES Ttable(idTtable) ON DELETE CASCADE
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FamilleFormulaire')
BEGIN
    CREATE TABLE FamilleFormulaire (
        id INT,
		idFamilleFormulaire UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(200),
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Groupe')
BEGIN
    CREATE TABLE Groupe (
        id INT,
		idGroupe UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(200),
		typeGroupe INT,
		etat INT,
		dateDebut Datetime,
		dateFin Datetime,
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TableFormulaire')
BEGIN
    CREATE TABLE TableFormulaire (
        id INT,
		idTableFormulaire UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idFamilleFormulaire UNIQUEIDENTIFIER,
		idMasterTable UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(200),
		form NVARCHAR(200),
		typeForm NVARCHAR(200),
		hide NVARCHAR(200),
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idFamilleFormulaire) REFERENCES FamilleFormulaire(idFamilleFormulaire),
		FOREIGN KEY (idMasterTable) REFERENCES TableFormulaire(idTableFormulaire)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Privilege')
BEGIN
    CREATE TABLE Privilege (
        id INT,
		idPrivilege UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idTableFormulaire UNIQUEIDENTIFIER,
		idGroupe UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(200),
		selectAccess INT,
		updateAccess INT,
		deleteAccess INT,
		insertAccess INT,
		dateDebut Datetime,
		dateFin Datetime,
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idTableFormulaire) REFERENCES TableFormulaire(idTableFormulaire),
		FOREIGN KEY (idGroupe) REFERENCES Groupe(idGroupe)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TUser')
BEGIN
    CREATE TABLE TUser (
        id INT,
		idUser UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idSociete UNIQUEIDENTIFIER,
		idSites UNIQUEIDENTIFIER,
		idGroupe UNIQUEIDENTIFIER,
		idDiagrammeUnit UNIQUEIDENTIFIER,
        matricule NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(200),
		etat INT,
		typeUser INT,
		motDePasse NVARCHAR(200),
		nbrEssai INT,
		nbrAccess INT,
		portailAccess INT,
		changerMdp INT,
		debutValidite Datetime,
		finValidite Datetime,
		inactivite INT,
		validiteMdp INT,
		userQuestion NVARCHAR(200),
		userReponse NVARCHAR(200),
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idSociete) REFERENCES TableFormulaire(idTableFormulaire),
		FOREIGN KEY (idSites) REFERENCES Groupe(idGroupe),
		FOREIGN KEY (idDiagrammeUnit) REFERENCES Groupe(idGroupe),
		FOREIGN KEY (idGroupe) REFERENCES Groupe(idGroupe)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Axe')
BEGIN
    CREATE TABLE Axe (
        id INT,
		idAxe UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(150),
		formatSection NVARCHAR(50),
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Devise')
BEGIN
    CREATE TABLE Devise (
        id INT,
		idDevise UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(150),
		codeIso NVARCHAR(150),
		actif INT,
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Pays')
BEGIN
    CREATE TABLE Pays (
        id INT,
		idPays UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idDevise UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(150),
		codeIso NVARCHAR(150),
		actif INT,
		codeTelephonique NVARCHAR(10),
		tailleCompteBancaire NVARCHAR(50),
		tailleCodeBanque NVARCHAR(50),
		tailleCleRib NVARCHAR(10),
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idDevise) REFERENCES Devise(idDevise) ON DELETE CASCADE
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Societe')
BEGIN
    CREATE TABLE Societe (
        id INT,
        idSociete UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idDeviseRef UNIQUEIDENTIFIER,
		idPays UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		intituleComplet NVARCHAR(150),
		raisonSociale NVARCHAR(150),
		sigle NVARCHAR(50),
		intituleReduit NVARCHAR(150),
		numCNSS NVARCHAR(150),
		numNUI NVARCHAR(150),
		responsable NVARCHAR(150),
		email NVARCHAR(30),
		codePostal NVARCHAR(20),
		telephone NVARCHAR(20),
		logo NVARCHAR(50),
		adresse NVARCHAR(200),
		adresseLine1 NVARCHAR(200),
		adresseLine2 NVARCHAR(200),
		monoDevise INT,
		gestionBilletage INT,
		dte1 NVARCHAR(200),
		dte2 NVARCHAR(200),
		dte3 NVARCHAR(200),
		dte4 NVARCHAR(200),
		var1 NVARCHAR(200),
		var2 NVARCHAR(200),
		var3 NVARCHAR(200),
		var4 NVARCHAR(200),
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idPays) REFERENCES Pays(idPays),
		FOREIGN KEY (idDeviseRef) REFERENCES Devise(idDevise)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Site')
BEGIN
    CREATE TABLE Sites (
        id INT,
        idSites UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idSociete UNIQUEIDENTIFIER,
		idPays UNIQUEIDENTIFIER,
		code NVARCHAR(50) UNIQUE,
        intituleComplet NVARCHAR(150),
		raisonSociale NVARCHAR(150),
		sigle NVARCHAR(50),
		intituleReduit NVARCHAR(150),
		numCNSS NVARCHAR(150),
		numNUI NVARCHAR(150),
		responsable NVARCHAR(150),
		email NVARCHAR(30),
		codePostal NVARCHAR(20),
		telephone NVARCHAR(20),
		adresse NVARCHAR(200),
		adresseLine1 NVARCHAR(200),
		adresseLine2 NVARCHAR(200),
		dte1 NVARCHAR(200),
		dte2 NVARCHAR(200),
		dte3 NVARCHAR(200),
		dte4 NVARCHAR(200),
		var1 NVARCHAR(200),
		var2 NVARCHAR(200),
		var3 NVARCHAR(200),
		var4 NVARCHAR(200),
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idPays) REFERENCES Pays(idPays),
		FOREIGN KEY (idSociete) REFERENCES Societe(idSociete)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Section')
BEGIN
    CREATE TABLE Section (
        id INT,
        idSection UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idAxe UNIQUEIDENTIFIER,
		idSite UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(150),
		actif INT,
        suiviBudgetaire INT,
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idAxe) REFERENCES Axe(idAxe),
		FOREIGN KEY (idSite) REFERENCES Sites(idSites)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TService')
BEGIN
    CREATE TABLE TService (
        id INT,
        idTservice UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idSociete UNIQUEIDENTIFIER,
		idPays UNIQUEIDENTIFIER,
		idSites UNIQUEIDENTIFIER,
		idSection UNIQUEIDENTIFIER,
		code NVARCHAR(50) UNIQUE,
        intituleComplet NVARCHAR(150),
		raisonSociale NVARCHAR(150),
		sigle NVARCHAR(50),
		intituleReduit NVARCHAR(150),
		responsable NVARCHAR(150),
		email NVARCHAR(30),
		codePostal NVARCHAR(20),
		telephone NVARCHAR(20),
		adresse NVARCHAR(200),
		adresseLine1 NVARCHAR(200),
		adresseLine2 NVARCHAR(200),
		dte1 NVARCHAR(200),
		dte2 NVARCHAR(200),
		dte3 NVARCHAR(200),
		dte4 NVARCHAR(200),
		var1 NVARCHAR(200),
		var2 NVARCHAR(200),
		var3 NVARCHAR(200),
		var4 NVARCHAR(200),
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idPays) REFERENCES Pays(idPays),
		FOREIGN KEY (idSociete) REFERENCES Societe(idSociete),
		FOREIGN KEY (idSites) REFERENCES Sites(idSites),
		FOREIGN KEY (idSection) REFERENCES Section(idSection)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CompteGeneral')
BEGIN
    CREATE TABLE CompteGeneral (
        id INT,
        idCompteGeneral UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idSectionAnalytique UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(150),
		actif INT,
        suiviBudgetaire INT,
		collectif INT,
		typeCompte NVARCHAR(50),
		classe NVARCHAR(10),
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idSectionAnalytique) REFERENCES Section(idSection),
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Banque')
BEGIN
    CREATE TABLE Banque (
        id INT,
        idBanque UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idPays UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(150),
		codeBic NVARCHAR(50),
        domiciliation NVARCHAR(50),
		swift NVARCHAR(50),
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idPays) REFERENCES Pays(idPays)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CompteBancaire')
BEGIN
    CREATE TABLE CompteBancaire (
        id INT,
        idCompteBancaire UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idDevise UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(150),
		numero NVARCHAR(50),
        cleRib NVARCHAR(10),
		idBanque UNIQUEIDENTIFIER,
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idDevise) REFERENCES Devise(idDevise),
		FOREIGN KEY (idBanque) REFERENCES Banque(idBanque) ON DELETE CASCADE
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Billet')
BEGIN
    CREATE TABLE Billet (
        id INT,
        idBillet UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idDevise UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(150),
		typeBillet NVARCHAR(50),
        valeurEnDevise DECIMAL(20,12),
		valeurEnRef DECIMAL(20,12),
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idDevise) REFERENCES Devise(idDevise) ON DELETE CASCADE
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CoursDevise')
BEGIN
    CREATE TABLE CoursDevise (
        id INT,
        idCoursDevise UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idDeviseOrigine UNIQUEIDENTIFIER,
		idDeviseDestination UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(150),
		typeCours NVARCHAR(50),
        dateCours Datetime,
		coefficient DECIMAL(13,12),
		coefficientInverse DECIMAL(13,12),
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idDeviseOrigine) REFERENCES Devise(idDevise) ON DELETE CASCADE,
		FOREIGN KEY (idDeviseDestination) REFERENCES Devise(idDevise) ON DELETE CASCADE
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CentreGestion')
BEGIN
    CREATE TABLE CentreGestion (
        id INT,
		idCentreGestion UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idSociete UNIQUEIDENTIFIER,
		idSites UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(150),
		actif INT,
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idSociete) REFERENCES Societe(idSociete) ON DELETE CASCADE,
		FOREIGN KEY (idSites) REFERENCES Sites(idSites)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CategorieTiers')
BEGIN
    CREATE TABLE CategorieTiers (
        id INT,
		idcategorieTiers UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(150),
		collectif INT,
		idCompteGeneral UNIQUEIDENTIFIER,
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idCompteGeneral) REFERENCES CompteGeneral(idCompteGeneral)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Tiers')
BEGIN
    CREATE TABLE Tiers (
        id INT,
        idTiers UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idCategorieTiers UNIQUEIDENTIFIER,
		idPays UNIQUEIDENTIFIER,
		idCompteGeneral UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(200),
		raisonSociale NVARCHAR(200),
		actif INT,
        encoursAutorise DECIMAL(20,12),
		controleEncours INT,
		adresse NVARCHAR(200),
		adresseLine1 NVARCHAR(200),
		adresseLine2 NVARCHAR(200),
		banque NVARCHAR(100),
		domiciliation NVARCHAR(100),
		codeBic NVARCHAR(20),
		numeroCompte NVARCHAR(50),
		cleRib NVARCHAR(10),
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idPays) REFERENCES Pays(idPays),
		FOREIGN KEY (idCompteGeneral) REFERENCES CompteGeneral(idCompteGeneral),
		FOREIGN KEY (idCategorieTiers) REFERENCES CategorieTiers(idCategorieTiers) ON DELETE CASCADE
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FamilleNatureOperation')
BEGIN
    CREATE TABLE FamilleNatureOperation (
        id INT,
        idFamilleNatureOperation UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(150),
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TypeOperation')
BEGIN
    CREATE TABLE TypeOperation (
        id INT,
        idTypeOperation UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(150),
		codePieceComptable NVARCHAR(10),
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NatureOperation')
BEGIN
    CREATE TABLE NatureOperation (
        id INT,
        idNatureOperation UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idCompteGeneral UNIQUEIDENTIFIER,
		idTypeOperation UNIQUEIDENTIFIER,
		idTiers UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(150),
		actif INT,
		imputationTiers INT,
		suiviBudgetaire INT,
		justification INT,
		demandeDecaissement INT,
		codePieceComptable NVARCHAR(10),
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idCompteGeneral) REFERENCES CompteGeneral(idCompteGeneral),
		FOREIGN KEY (idTypeOperation) REFERENCES TypeOperation(idTypeOperation),
		FOREIGN KEY (idTiers) REFERENCES Tiers(idTiers),
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'JournalComptable')
BEGIN
    CREATE TABLE JournalComptable (
        id INT,
        idJournalComptable UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idCompteGeneral UNIQUEIDENTIFIER,
		idSite UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(150),
		actif INT,
		typeJournal NVARCHAR(10),
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idCompteGeneral) REFERENCES CompteGeneral(idCompteGeneral),
		FOREIGN KEY (idSite) REFERENCES Sites(idSites),
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ParametreDossier')
BEGIN
    CREATE TABLE ParametreDossier (
        id INT,
		idParametreDossier UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        idSociete UNIQUEIDENTIFIER,
		idSites UNIQUEIDENTIFIER,
		idJournalJustif UNIQUEIDENTIFIER,
		idJournalAchat UNIQUEIDENTIFIER,
		Liaison INT,
		journalJustif INT,
		journalAchat INT,
		gestionWorkflow INT,
		nbrValidateur INT,
		formatReçu NVARCHAR(50),
		modeleReçu NVARCHAR(50),
		nbrReçuImpression INT,
		repPiceJointe NVARCHAR(100),
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idJournalJustif) REFERENCES JournalComptable(idJournalComptable),
		FOREIGN KEY (idJournalAchat) REFERENCES JournalComptable(idJournalComptable),
		FOREIGN KEY (idSociete) REFERENCES Societe(idSociete),
		FOREIGN KEY (idSites) REFERENCES Sites(idSites)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ParametreComptable')
BEGIN
    CREATE TABLE ParametreComptable (
        id INT,
		idParametreComptable UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        idSociete UNIQUEIDENTIFIER,
		idSites UNIQUEIDENTIFIER,
		controlPreEng INT,
		depassementBudget INT,
		journalAchat INT,
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idSociete) REFERENCES Societe(idSociete),
		FOREIGN KEY (idSites) REFERENCES Sites(idSites)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Budget')
BEGIN
    CREATE TABLE Budget (
        id INT,
        idBudget UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idSociete UNIQUEIDENTIFIER,
		idAxe UNIQUEIDENTIFIER,
		idDevise UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(150),
		actif INT,
		parAxe INT,
		parSite INT,
		parNatureOperation INT,
		typeControle NVARCHAR(10),
		dateDebut Datetime,
		dateFin Datetime,
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idSociete) REFERENCES Societe(idSociete),
		FOREIGN KEY (idAxe) REFERENCES Axe(idAxe),
		FOREIGN KEY (idDevise) REFERENCES Devise(idDevise)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VersionBudget')
BEGIN
    CREATE TABLE VersionBudget (
        id INT,
        idVersionBudget UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idBudget UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(150),
		actif INT,
		definitf INT,
		parDefaut INT,
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idBudget) REFERENCES Budget(idBudget),
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EnteteLigneBudget')
BEGIN
    CREATE TABLE EnteteLigneBudget (
        id INT,
        idEnteteLigneBudget UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idBudget UNIQUEIDENTIFIER,
		idVersionBudget UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(150),
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idBudget) REFERENCES Budget(idBudget),
		FOREIGN KEY (idVersionBudget) REFERENCES VersionBudget(idVersionBudget),
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DetailLigneBudget')
BEGIN
    CREATE TABLE DetailLigneBudget (
        id INT,
        idDetailLigneBudget UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idEnteteLigneBudget UNIQUEIDENTIFIER,
		idSociete UNIQUEIDENTIFIER,
		idBudget UNIQUEIDENTIFIER,
		idVersionBudget UNIQUEIDENTIFIER,
		idSite UNIQUEIDENTIFIER,
		idNatureOperation UNIQUEIDENTIFIER,
		idSection UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(150),
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idEnteteLigneBudget) REFERENCES EnteteLigneBudget(idEnteteLigneBudget),
		FOREIGN KEY (idSociete) REFERENCES Societe(idSociete),
		FOREIGN KEY (idBudget) REFERENCES Budget(idBudget),
		FOREIGN KEY (idVersionBudget) REFERENCES VersionBudget(idVersionBudget),
		FOREIGN KEY (idSite) REFERENCES Sites(idSites),
		FOREIGN KEY (idNatureOperation) REFERENCES NatureOperation(idNatureOperation),
		FOREIGN KEY (idSection) REFERENCES Section(idSection)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Caisse')
BEGIN
    CREATE TABLE Caisse (
        id INT,
        idCaisse UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idJournalComptable UNIQUEIDENTIFIER,
		idSociete UNIQUEIDENTIFIER,
		idSite UNIQUEIDENTIFIER,
		idDevisePrincipale UNIQUEIDENTIFIER,
		idDeviseSecondaire UNIQUEIDENTIFIER,
		idCompteBancaireAppro UNIQUEIDENTIFIER,
		idSection UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(150),
		actif INT,
		typeCaisse NVARCHAR(10),
		statut NVARCHAR(10),
		seuilMinimal Decimal(18,13),
		plafond Decimal(18,13),
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idJournalComptable) REFERENCES JournalComptable(idJournalComptable),
		FOREIGN KEY (idSociete) REFERENCES Societe(idSociete),
		FOREIGN KEY (idSite) REFERENCES Sites(idSites),
		FOREIGN KEY (idDevisePrincipale) REFERENCES Devise(idDevise),
		FOREIGN KEY (idDeviseSecondaire) REFERENCES Devise(idDevise),
		FOREIGN KEY (idCompteBancaireAppro) REFERENCES CompteBancaire(idCompteBancaire),
		FOREIGN KEY (idSection) REFERENCES Section(idSection)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DateJournee')
BEGIN
    CREATE TABLE DateJournee (
        id INT,
        idDateJournee UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idCaisse UNIQUEIDENTIFIER,
		idSociete UNIQUEIDENTIFIER,
		idSite UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(150),
		dateCaisse Datetime,
		soldeOpen Decimal(18,13),
		soldeClose Decimal(18,13),
		etat INT,
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idCaisse) REFERENCES Caisse(idCaisse),
		FOREIGN KEY (idSociete) REFERENCES Societe(idSociete),
		FOREIGN KEY (idSite) REFERENCES Sites(idSites)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Diagramme')
BEGIN
    CREATE TABLE Diagramme (
        id INT,
		idDiagramme UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		code NVARCHAR(50) UNIQUE,
        intitule NVARCHAR(100),
		typeDiagramme NVARCHAR(100),
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DiagrammeCaisse')
BEGIN
    CREATE TABLE DiagrammeCaisse (
        id INT,
		idDiagrammeCaisse UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        idDiagramme UNIQUEIDENTIFIER,
		idDiagrammeParent UNIQUEIDENTIFIER,
		idDiagrammeEnfant UNIQUEIDENTIFIER,
		idCaisse UNIQUEIDENTIFIER,
		code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(100),
		niveau INT,
		suiviBudget INT,
		totalisation NVARCHAR(100),
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idDiagramme) REFERENCES Diagramme(idDiagramme),
		FOREIGN KEY (idDiagrammeParent) REFERENCES DiagrammeCaisse(idDiagrammeCaisse),
		FOREIGN KEY (idDiagrammeEnfant) REFERENCES DiagrammeCaisse(idDiagrammeCaisse),
		FOREIGN KEY (idCaisse) REFERENCES Caisse(idCaisse)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DiagrammeOperation')
BEGIN
    CREATE TABLE DiagrammeOperation (
        id INT,
		idDiagrammeOperation UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        idDiagramme UNIQUEIDENTIFIER,
		idDiagrammeParent UNIQUEIDENTIFIER,
		idDiagrammeEnfant UNIQUEIDENTIFIER,
		idNatureOperation UNIQUEIDENTIFIER,
		code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(100),
		niveau INT,
		suiviBudget INT,
		totalisation NVARCHAR(100),
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idDiagramme) REFERENCES Diagramme(idDiagramme),
		FOREIGN KEY (idDiagrammeParent) REFERENCES DiagrammeOperation(idDiagrammeOperation),
		FOREIGN KEY (idDiagrammeEnfant) REFERENCES DiagrammeOperation(idDiagrammeOperation),
		FOREIGN KEY (idNatureOperation) REFERENCES NatureOperation(idNatureOperation)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DiagrammeUnit')
BEGIN
    CREATE TABLE DiagrammeUnit (
        id INT,
		idDiagrammeUnit UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        idDiagramme UNIQUEIDENTIFIER,
		idDiagrammeParent UNIQUEIDENTIFIER,
		idDiagrammeEnfant UNIQUEIDENTIFIER,
		idSociete UNIQUEIDENTIFIER,
		idSites UNIQUEIDENTIFIER,
		idTservice UNIQUEIDENTIFIER,
		code NVARCHAR(50) UNIQUE,
		intitule NVARCHAR(100),
		niveau INT,
		suiviBudget INT,
		totalisation NVARCHAR(100),
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idDiagramme) REFERENCES Diagramme(idDiagramme),
		FOREIGN KEY (idDiagrammeParent) REFERENCES DiagrammeUnit(idDiagrammeUnit),
		FOREIGN KEY (idDiagrammeEnfant) REFERENCES DiagrammeUnit(idDiagrammeUnit),
		FOREIGN KEY (idSociete) REFERENCES Societe(idSociete),
		FOREIGN KEY (idSites) REFERENCES Sites(idSites),
		FOREIGN KEY (idTservice) REFERENCES Tservice(idTservice)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RegleWorkflow')
BEGIN
    CREATE TABLE RegleWorkflow (
        id INT,
		idRegleWorkflow UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idSociete UNIQUEIDENTIFIER,
		idDiagramme UNIQUEIDENTIFIER,
		code NVARCHAR(50) UNIQUE,
        intitule NVARCHAR(100),
		unitOrg INT,
		analytique INT,
		natureOperation INT,
		nbrValidateur INT,
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idSociete) REFERENCES Societe(idSociete),
		FOREIGN KEY (idDiagramme) REFERENCES Diagramme(idDiagramme)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RegleAffectationWorkflow')
BEGIN
    CREATE TABLE RegleAffectationWorkflow (
        id INT,
		idRegleAffectationWorkflow UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idRegleWorkflow UNIQUEIDENTIFIER,
		idDiagramme UNIQUEIDENTIFIER,
		idDiagrammeUnit UNIQUEIDENTIFIER,
		idSites UNIQUEIDENTIFIER,
		idNatureOperation UNIQUEIDENTIFIER,
		idSection UNIQUEIDENTIFIER,
		idUser UNIQUEIDENTIFIER,
		niveau INT,
		validateurN1 NVARCHAR(100),
		validateurN2 NVARCHAR(100),
		validateurN3 NVARCHAR(100),
		validateurN4 NVARCHAR(100),
		validateurN5 NVARCHAR(100),
		validateurN6 NVARCHAR(100),
		validateurN7 NVARCHAR(100),
		validateurN8 NVARCHAR(100),
		validateurN9 NVARCHAR(100),
		validateurN0 NVARCHAR(100),
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idRegleWorkflow) REFERENCES RegleWorkflow(idRegleWorkflow),
		FOREIGN KEY (idDiagramme) REFERENCES Diagramme(idDiagramme),
		FOREIGN KEY (idDiagrammeUnit) REFERENCES DiagrammeUnit(idDiagrammeUnit),
		FOREIGN KEY (idSites) REFERENCES Sites(idSites),
		FOREIGN KEY (idNatureOperation) REFERENCES NatureOperation(idNatureOperation),
		FOREIGN KEY (idSection) REFERENCES Section(idSection),
		FOREIGN KEY (idUser) REFERENCES TUser(idUser)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'HistoriqueWorkflow')
BEGIN
    CREATE TABLE HistoriqueWorkflow (
        id INT,
		idHistoriqueWorkflow UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idRegleWorkflow UNIQUEIDENTIFIER,
		idRegleAffectationWorkflow UNIQUEIDENTIFIER,
		idDiagramme UNIQUEIDENTIFIER,
		idDiagrammeUnit UNIQUEIDENTIFIER,
		idSociete UNIQUEIDENTIFIER,
		idSites UNIQUEIDENTIFIER,
		idNatureOperation UNIQUEIDENTIFIER,
		idSection UNIQUEIDENTIFIER,
		idUser UNIQUEIDENTIFIER,
		idTtable UNIQUEIDENTIFIER,
		idChampTable UNIQUEIDENTIFIER,
		niveau INT,
		document NVARCHAR(100),
		statut INT,
		validateurN1 NVARCHAR(100),
		validateurN2 NVARCHAR(100),
		validateurN3 NVARCHAR(100),
		validateurN4 NVARCHAR(100),
		validateurN5 NVARCHAR(100),
		validateurN6 NVARCHAR(100),
		validateurN7 NVARCHAR(100),
		validateurN8 NVARCHAR(100),
		validateurN9 NVARCHAR(100),
		validateurN0 NVARCHAR(100),
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idRegleWorkflow) REFERENCES RegleWorkflow(idRegleWorkflow),
		FOREIGN KEY (idDiagramme) REFERENCES Diagramme(idDiagramme),
		FOREIGN KEY (idDiagrammeUnit) REFERENCES DiagrammeUnit(idDiagrammeUnit),
		FOREIGN KEY (idSites) REFERENCES Sites(idSites),
		FOREIGN KEY (idNatureOperation) REFERENCES NatureOperation(idNatureOperation),
		FOREIGN KEY (idSection) REFERENCES Section(idSection),
		FOREIGN KEY (idUser) REFERENCES TUser(idUser),
		FOREIGN KEY (idSociete) REFERENCES Societe(idSociete),
		FOREIGN KEY (idTtable) REFERENCES Ttable(idTtable),
		FOREIGN KEY (idChampTable) REFERENCES ChampTable(idChampTable)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EnteteEngagement')
BEGIN
    CREATE TABLE EnteteEngagement (
        id INT,
        idEnteteEngagement UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idSociete UNIQUEIDENTIFIER,
		idSites UNIQUEIDENTIFIER,
		idDateJournee UNIQUEIDENTIFIER,
		idDevise UNIQUEIDENTIFIER,
		idCaisse UNIQUEIDENTIFIER,
		idTiers UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		libelle NVARCHAR(150),
		operationCaisse INT,
		typeDemande INT,
		typeEngagement INT,
		dateEngagement Datetime,
		typeDocument NVARCHAR(150),
		typeCoursDevise NVARCHAR(150),
		numDocument NVARCHAR(150),
		coursDevise Decimal(18,13),
		coursDeviseInverse Decimal(18,13),
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idSociete) REFERENCES Societe(idSociete),
		FOREIGN KEY (idSites) REFERENCES Sites(idSites),
		FOREIGN KEY (idDatejournee) REFERENCES DateJournee(idDatejournee),
		FOREIGN KEY (idTiers) REFERENCES Tiers(idTiers),
		FOREIGN KEY (idCaisse) REFERENCES Caisse(idCaisse),
		FOREIGN KEY (idDevise) REFERENCES Devise(idDevise)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DetailEngagement')
BEGIN
    CREATE TABLE DetailEngagement (
        id INT,
        idDetailEngagement UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idEnteteEngagement UNIQUEIDENTIFIER,
		idSociete UNIQUEIDENTIFIER,
		idSites UNIQUEIDENTIFIER,
		idDateJournee UNIQUEIDENTIFIER,
		idDevise UNIQUEIDENTIFIER,
		idCaisse UNIQUEIDENTIFIER,
		idTiers UNIQUEIDENTIFIER,
		idAxe UNIQUEIDENTIFIER,
		idSection UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		libelle NVARCHAR(150),
		operationCaisse INT,
		typeDemande INT,
		typeEngagement INT,
		sens INT,
		dateEngagement Datetime,
		typeDocument NVARCHAR(150),
		typeCoursDevise NVARCHAR(150),
		numDocument NVARCHAR(150),
		coursDevise Decimal(18,13),
		coursDeviseInverse Decimal(18,13),
		montantRef Decimal(18,13),
		montant Decimal(18,13),
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idSociete) REFERENCES Societe(idSociete),
		FOREIGN KEY (idSites) REFERENCES Sites(idSites),
		FOREIGN KEY (idDatejournee) REFERENCES DateJournee(idDatejournee),
		FOREIGN KEY (idAxe) REFERENCES Axe(idAxe),
		FOREIGN KEY (idSection) REFERENCES Section(idSection),
		FOREIGN KEY (idTiers) REFERENCES Tiers(idTiers),
		FOREIGN KEY (idCaisse) REFERENCES Caisse(idCaisse),
		FOREIGN KEY (idDevise) REFERENCES Devise(idDevise)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EnteteDemandeDecaissement')
BEGIN
    CREATE TABLE EnteteDemandeDecaissement (
        id INT,
        idEnteteDemandeDecaissement UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idSociete UNIQUEIDENTIFIER,
		idSites UNIQUEIDENTIFIER,
		idAxe UNIQUEIDENTIFIER,
		idUser UNIQUEIDENTIFIER,
		idDevise UNIQUEIDENTIFIER,
		idCaisseOrigine UNIQUEIDENTIFIER,
		idCaisseDestination UNIQUEIDENTIFIER,
		idDateJournee UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		libelle NVARCHAR(150),
		operationCaisse INT,
		typeDemande INT,
		etat INT,
		dateDemande Datetime,
		signee INT,
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idSociete) REFERENCES Societe(idSociete),
		FOREIGN KEY (idSites) REFERENCES Sites(idSites),
		FOREIGN KEY (idAxe) REFERENCES Axe(idAxe),
		FOREIGN KEY (idUser) REFERENCES TUser(idUser),
		FOREIGN KEY (idCaisseOrigine) REFERENCES Caisse(idCaisse),
		FOREIGN KEY (idCaisseDestination) REFERENCES Caisse(idCaisse),
		FOREIGN KEY (idDevise) REFERENCES Devise(idDevise),
		FOREIGN KEY (idDateJournee) REFERENCES DateJournee(idDateJournee)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DetailDemandeDecaissement')
BEGIN
    CREATE TABLE DetailDemandeDecaissement (
        id INT,
        idDetailDemandeDecaissementt UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idEnteteDemandeDecaissement UNIQUEIDENTIFIER,
		idSociete UNIQUEIDENTIFIER,
		idSites UNIQUEIDENTIFIER,
		idAxe UNIQUEIDENTIFIER,
		idSection UNIQUEIDENTIFIER,
		idUser UNIQUEIDENTIFIER,
		idDevise UNIQUEIDENTIFIER,
		idCaisse UNIQUEIDENTIFIER,
		idNatureOperation UNIQUEIDENTIFIER,
		idTiers UNIQUEIDENTIFIER,
		idDateJournee UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		libelle NVARCHAR(150),
		operationCaisse INT,
		taxe NVARCHAR(50),
		typeDemande INT,
		etat INT,
		typeCours NVARCHAR(50),
		tauxDevise Decimal(18,13),
		tauxDeviseInverse Decimal(18,13),
		dateDemande Datetime,
		baseCalculTaxe Decimal(18,13),
		baseTaxe Decimal(18,13),
		montantLigneHt Decimal(18,13),
		montantLigneTaxe Decimal(18,13),
		montantLigneTtc Decimal(18,13),
		signee INT,
		ligneOperationCaisse INT,
		depassementBudget INT,
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idEnteteDemandeDecaissement) REFERENCES EnteteDemandeDecaissement(idEnteteDemandeDecaissement),
		FOREIGN KEY (idSociete) REFERENCES Societe(idSociete),
		FOREIGN KEY (idSites) REFERENCES Sites(idSites),
		FOREIGN KEY (idAxe) REFERENCES Axe(idAxe),
		FOREIGN KEY (idSection) REFERENCES Section(idSection),
		FOREIGN KEY (idUser) REFERENCES TUser(idUser),
		FOREIGN KEY (idCaisse) REFERENCES Caisse(idCaisse),
		FOREIGN KEY (idNatureOperation) REFERENCES NatureOperation(idNatureOperation),
		FOREIGN KEY (idTiers) REFERENCES Tiers(idTiers),
		FOREIGN KEY (idDevise) REFERENCES Devise(idDevise),
		FOREIGN KEY (idDateJournee) REFERENCES DateJournee(idDateJournee)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EnteteOperation')
BEGIN
    CREATE TABLE EnteteOperation (
        id INT,
		idEnteteOperation UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idTypeOperation UNIQUEIDENTIFIER,
		idDateJournee UNIQUEIDENTIFIER,
		idCompteBancaire UNIQUEIDENTIFIER,
		idCentreGestion UNIQUEIDENTIFIER,
		idSociete UNIQUEIDENTIFIER,
		idSites UNIQUEIDENTIFIER,
		idNatureOperation UNIQUEIDENTIFIER,
		idUser UNIQUEIDENTIFIER,
		idCaisse UNIQUEIDENTIFIER,
		idDevise UNIQUEIDENTIFIER,
		idJournal UNIQUEIDENTIFIER,
		idCoursDevise UNIQUEIDENTIFIER,
		typeCours NVARCHAR(200),
		libelleOperation NVARCHAR(200),
		numCheque NVARCHAR(200),
		numReçu NVARCHAR(200),
		statut INT,
		signee INT,
		comptabilisee INT,
		text1 NVARCHAR(100),
		text2 NVARCHAR(100),
		text3 NVARCHAR(100),
		text4 NVARCHAR(100),
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idTypeOperation) REFERENCES TypeOperation(idTypeOperation),
		FOREIGN KEY (idDateJournee) REFERENCES DateJournee(idDateJournee),
		FOREIGN KEY (idCompteBancaire) REFERENCES CompteBancaire(idCompteBancaire),
		FOREIGN KEY (idSites) REFERENCES Sites(idSites),
		FOREIGN KEY (idNatureOperation) REFERENCES NatureOperation(idNatureOperation),
		FOREIGN KEY (idUser) REFERENCES TUser(idUser),
		FOREIGN KEY (idSociete) REFERENCES Societe(idSociete),
		FOREIGN KEY (idCentreGestion) REFERENCES CentreGestion(idCentreGestion),
		FOREIGN KEY (idJournal) REFERENCES JournalComptable(idJournalComptable),
		FOREIGN KEY (idDevise) REFERENCES Devise(idDevise),
		FOREIGN KEY (idCoursDevise) REFERENCES CoursDevise(idCoursDevise)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DetailOperation')
BEGIN
    CREATE TABLE DetailOperation (
        id INT,
		idDetailOperation UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idEnteteOperation UNIQUEIDENTIFIER,
		idTypeOperation UNIQUEIDENTIFIER,
		idDateJournee UNIQUEIDENTIFIER,
		idCompteBancaire UNIQUEIDENTIFIER,
		idCentreGestion UNIQUEIDENTIFIER,
		idSociete UNIQUEIDENTIFIER,
		idSites UNIQUEIDENTIFIER,
		idNatureOperation UNIQUEIDENTIFIER,
		idSection UNIQUEIDENTIFIER,
		idUser UNIQUEIDENTIFIER,
		idCaisse UNIQUEIDENTIFIER,
		idDeviseOp UNIQUEIDENTIFIER,
		idDeviseRef UNIQUEIDENTIFIER,
		idDeviseRep UNIQUEIDENTIFIER,
		idJournal UNIQUEIDENTIFIER,
		idTiers UNIQUEIDENTIFIER,
		idCoursDevise UNIQUEIDENTIFIER,
		coursInverse NVARCHAR(200),
		ligneOperation INT,
		typeCours NVARCHAR(200),
		libelleOperation NVARCHAR(200),
		numCheque NVARCHAR(200),
		numReçu NVARCHAR(200),
		taxe NVARCHAR(200),
		baseTaxe Decimal(18,14),
		baseCalculTaxe Decimal(18,14),
		montantDeviseHt Decimal(18,14),
		montantDeviseTaxe Decimal(18,14),
		montantDeviseTtc Decimal(18,14),
		montantDeviseRefHt Decimal(18,14),
		montantDeviseRefTaxe Decimal(18,14),
		montantDeviseRefTtc Decimal(18,14),
		montantDeviseRepHt Decimal(18,14),
		montantDeviseRepTaxe Decimal(18,14),
		montantDeviseRepTtc Decimal(18,14),
		statut INT,
		signee INT,
		comptabilisee INT,
		text1 NVARCHAR(100),
		text2 NVARCHAR(100),
		text3 NVARCHAR(100),
		text4 NVARCHAR(100),
		createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idTypeOperation) REFERENCES TypeOperation(idTypeOperation),
		FOREIGN KEY (idDateJournee) REFERENCES DateJournee(idDateJournee),
		FOREIGN KEY (idCompteBancaire) REFERENCES CompteBancaire(idCompteBancaire),
		FOREIGN KEY (idSites) REFERENCES Sites(idSites),
		FOREIGN KEY (idNatureOperation) REFERENCES NatureOperation(idNatureOperation),
		FOREIGN KEY (idSection) REFERENCES Section(idSection),
		FOREIGN KEY (idUser) REFERENCES TUser(idUser),
		FOREIGN KEY (idSociete) REFERENCES Societe(idSociete),
		FOREIGN KEY (idCentreGestion) REFERENCES CentreGestion(idCentreGestion),
		FOREIGN KEY (idJournal) REFERENCES JournalComptable(idJournalComptable),
		FOREIGN KEY (idTiers) REFERENCES Tiers(idTiers),
		FOREIGN KEY (idDeviseOp) REFERENCES Devise(idDevise),
		FOREIGN KEY (idDeviseRef) REFERENCES Devise(idDevise),
		FOREIGN KEY (idDeviseRep) REFERENCES Devise(idDevise),
		FOREIGN KEY (idCoursDevise) REFERENCES CoursDevise(idCoursDevise)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EnteteEcriture')
BEGIN
    CREATE TABLE EnteteEcriture (
        id INT,
        idEnteteEcriture UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idSociete UNIQUEIDENTIFIER,
		idSites UNIQUEIDENTIFIER,
		idDateJournee UNIQUEIDENTIFIER,
		idDevise UNIQUEIDENTIFIER,
		idDeviseRef UNIQUEIDENTIFIER,
		idJournal UNIQUEIDENTIFIER,
		idTiers UNIQUEIDENTIFIER,
		idTypeOperation UNIQUEIDENTIFIER,
		idEngagement UNIQUEIDENTIFIER,
		idEnteteOperation UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		libelle NVARCHAR(150),
		operationCaisse INT,
		dateEngagement Datetime,
		typeCours NVARCHAR(150),
		numDocument NVARCHAR(150),
		coursDevise Decimal(18,13),
		coursDeviseInverse Decimal(18,13),
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idSociete) REFERENCES Societe(idSociete),
		FOREIGN KEY (idSites) REFERENCES Sites(idSites),
		FOREIGN KEY (idDatejournee) REFERENCES DateJournee(idDatejournee),
		FOREIGN KEY (idTiers) REFERENCES Tiers(idTiers),
		FOREIGN KEY (idJournal) REFERENCES JournalComptable(idJournalComptable),
		FOREIGN KEY (idEnteteOperation) REFERENCES EnteteOperation(idEnteteOperation),
		FOREIGN KEY (idTypeOperation) REFERENCES TypeOperation(idTypeOperation),
		FOREIGN KEY (idEngagement) REFERENCES EnteteEngagement(idEnteteEngagement),
		FOREIGN KEY (idDevise) REFERENCES Devise(idDevise),
		FOREIGN KEY (idDeviseRef) REFERENCES Devise(idDevise)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DetailEcriture')
BEGIN
    CREATE TABLE DetailEcriture (
        id INT,
        idDetailEcriture UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idEnteteEcriture UNIQUEIDENTIFIER,
		idSociete UNIQUEIDENTIFIER,
		idSites UNIQUEIDENTIFIER,
		idDateJournee UNIQUEIDENTIFIER,
		idDevise UNIQUEIDENTIFIER,
		idDeviseRef UNIQUEIDENTIFIER,
		idJournal UNIQUEIDENTIFIER,
		idTiers UNIQUEIDENTIFIER,
		idTypeOperation UNIQUEIDENTIFIER,
		idEnteteOperation UNIQUEIDENTIFIER,
		idEngagement UNIQUEIDENTIFIER,
		idNatureOperation UNIQUEIDENTIFIER,
		idCompteGeneral UNIQUEIDENTIFIER,
		idAxe UNIQUEIDENTIFIER,
		idSection UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		libelle NVARCHAR(150),
		operationCaisse INT,
		ligneEcriture INT,
		sens INT,
		dateEngagement Datetime,
		dateOperation Datetime,
		typeCours NVARCHAR(150),
		numDocument NVARCHAR(150),
		coursDevise Decimal(18,13),
		coursDeviseInverse Decimal(18,13),
		taxe NVARCHAR(200),
		baseTaxe Decimal(18,14),
		baseCalculTaxe Decimal(18,14),
		montantDeviseHt Decimal(18,14),
		montantDeviseTaxe Decimal(18,14),
		montantDeviseTtc Decimal(18,14),
		montantDeviseRefHt Decimal(18,14),
		montantDeviseRefTaxe Decimal(18,14),
		montantDeviseRefTtc Decimal(18,14),
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idSociete) REFERENCES Societe(idSociete),
		FOREIGN KEY (idSites) REFERENCES Sites(idSites),
		FOREIGN KEY (idDatejournee) REFERENCES DateJournee(idDatejournee),
		FOREIGN KEY (idTiers) REFERENCES Tiers(idTiers),
		FOREIGN KEY (idNatureOperation) REFERENCES NatureOperation(idNatureOperation),
		FOREIGN KEY (idCompteGeneral) REFERENCES CompteGeneral(idCompteGeneral),
		FOREIGN KEY (idAxe) REFERENCES Axe(idAxe),
		FOREIGN KEY (idSection) REFERENCES Section(idSection),
		FOREIGN KEY (idJournal) REFERENCES JournalComptable(idJournalComptable),
		FOREIGN KEY (idEnteteOperation) REFERENCES EnteteOperation(idEnteteOperation),
		FOREIGN KEY (idTypeOperation) REFERENCES TypeOperation(idTypeOperation),
		FOREIGN KEY (idEngagement) REFERENCES EnteteEngagement(idEnteteEngagement),
		FOREIGN KEY (idDevise) REFERENCES Devise(idDevise),
		FOREIGN KEY (idDeviseRef) REFERENCES Devise(idDevise)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Commentaires')
BEGIN
    CREATE TABLE Commentaires (
        id INT,
        idCommentaires UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idTtable UNIQUEIDENTIFIER,
		idUser UNIQUEIDENTIFIER,
		idCommentaire UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		libelle NVARCHAR(150),
		typeObjet NVARCHAR(150),
		objetId NVARCHAR(150),
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idTtable) REFERENCES Ttable(idTtable),
		FOREIGN KEY (idUser) REFERENCES TUser(idUser),
		FOREIGN KEY (idCommentaire) REFERENCES Commentaires(idCommentaires)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PieceJointe')
BEGIN
    CREATE TABLE PieceJointe (
        id INT,
        idPieceJointe UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		idTtable UNIQUEIDENTIFIER,
		idUser UNIQUEIDENTIFIER,
        code NVARCHAR(50) UNIQUE,
		libelle NVARCHAR(150),
		typeObjet NVARCHAR(150),
		objetId NVARCHAR(150),
		cheminPiece NVARCHAR(150),
		urlDossier NVARCHAR(150),
        createdAt Datetime,
		createdBy NVARCHAR(50),
		updatedAt Datetime,
		updatedBy NVARCHAR(50),
		FOREIGN KEY (idTtable) REFERENCES Ttable(idTtable),
		FOREIGN KEY (idUser) REFERENCES TUser(idUser)
    );
END
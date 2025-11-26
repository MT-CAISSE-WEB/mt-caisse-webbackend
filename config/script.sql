CREATE OR ALTER PROCEDURE GenererNumeroOperation
    @prefixe NVARCHAR(10),
    @annee INT,
    @numero NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @compteur INT;

    BEGIN TRANSACTION;

    -- Créer compteur si inexistant
    IF NOT EXISTS (
        SELECT 1 FROM Compteurs WHERE prefixe = @prefixe AND annee = @annee
    )
    BEGIN
        INSERT INTO Compteurs(prefixe, annee, compteur)
        VALUES(@prefixe, @annee, 0);
    END

    -- Incrémenter
    UPDATE Compteurs
    SET compteur = compteur + 1
    WHERE prefixe = @prefixe AND annee = @annee;

    SELECT @compteur = compteur 
    FROM Compteurs
    WHERE prefixe = @prefixe AND annee = @annee;

    COMMIT TRANSACTION;

    -- Format final
    SET @numero = 
        @prefixe + '-' 
        + CAST(@annee AS NVARCHAR) + '-' 
        + RIGHT('000' + CAST(@compteur AS NVARCHAR), 3);
END

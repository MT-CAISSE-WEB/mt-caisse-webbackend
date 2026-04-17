const querytypeoperation = `SELECT 
    -- TYPE OPERATION
    t.idtypeoperation,
    t.codtypeoperation,
    t.idoperation,
    t.idperiode,
    t.idsociete,
    t.idsite,
    t.idcaisse,
    t.montant,
    t.taux,
    t.montantref,
    t.createdat,
    t.createdby,
    t.updatedat,
    t.updatedby,

    -- CAISSE
    c.idcaisse AS caisse_id,
    c.codecaisse,
    c.libelle AS caisse_libelle,
    c.idjournal,
    c.iddevise AS caisse_iddevise,
    c.idsite AS caisse_idsite,
    c.idsociete AS caisse_idsociete,
    c.idcompte,
    c.dateinitialisation,
    c.soldeinitialisation,
    c.seuilmnimal,
    c.actif,
    c.createdat AS caisse_createdat,
    c.createdby AS caisse_createdby,
    c.updatedat AS caisse_updatedat,
    c.updatedby AS caisse_updatedby,

    -- JOURNAL
    j.idjournal AS journal_id,
    j.codejournal,
    j.designation,

    -- PLAN COMPTABLE
    p.idcompte AS compte_id,
    p.numcompte,
    p.ventillable,
    p.auxiliaire,
    p.suivibudgetaire,
    p.suivibudgetairemensuel,

    -- devise 
    d.iddevise AS devise_id,
    d.codedevise,
    d.codeiso,
    d.intitule AS devise_libelle

FROM typeoperation t
inner join caisse c on t.idcaisse = c.idcaisse
inner join journal j on c.idjournal = j.idjournal
inner join plancomptable p on c.idcompte = p.idcompte
inner join devise d on c.iddevise = d.iddevise

WHERE t.idoperation = @idoperation`;

queryjustificatifdetailsbyid = `select
    j.iddetailsjustificatifoperation,
    j.idjustificatif,
    j.idnature,
    j.idcentreanalytique,
    j.idtiers,
    j.montantdetail,
    j.montantref,

    n.idnature AS nature_id,
    n.codenature AS nature_code,
    n.libelle AS nature_libelle,
    n.idcompte AS nature_idcompte,

    p.idcompte AS compte_id,
    p.numcompte,

    ca.idcentreanalytique AS centre_id,
    ca.codecentreanalytique,
    ca.libelle AS centre_libelle,

    t.idtiers AS tiers_id,
    t.codetiers,
    t.designation AS tiers_designation

    from DetailsJustificatifOperation j
    left join tiers t on j.idtiers = t.idtiers
    left join natureoperation n on j.idnature = n.idnature
    left join centreanalytique ca on j.idcentreanalytique = ca.idcentreanalytique
    inner join PlanComptable p on n.idcompte = p.idcompte
    where j.idjustificatif = @idjustificatif`; 


    

queryligneoperationbyidoperation =`select 
    l.idligneoperation,
    l.idoperation,
    l.idnature,
    l.idcentre,
    l.libelle,
    l.montantoperation,
    l.comptabilise,

    n.idnature AS nature_id,
    n.codenature AS nature_code,
    n.libelle AS nature_libelle,
    n.idcompte AS nature_idcompte,

    p.idcompte AS compte_id,
    p.numcompte,

    ca.idcentreanalytique AS centre_id,
    ca.codecentreanalytique,
    ca.libelle AS centre_libelle,

    t.idtiers AS tiers_id,
    t.codetiers,
    t.designation AS tiers_designation

from ligneoperationCaisse l
left join tiers t on l.idtiers = t.idtiers
left join natureoperation n on l.idnature = n.idnature
inner join PlanComptable p on n.idcompte = p.idcompte
left join centreanalytique ca on l.idcentre = ca.idcentreanalytique
where l.idoperation=@idoperation and (l.comptabilise = 0 or l.comptabilise is NULL)
`;

createligneecriture = ` INSERT INTO EcritureLigneComptable
        (
            idligneecriture,
            idecriture,
            numligne,
            idnature,
            nature,
            idcompte,
            compte,
            idcentreanalytique,
            centreanalytique,
            idtiers,
            tiers,
            debit,
            credit,
            etat,
            iddevise,
            devise,
            montantdevise,
            taux,
            montantbase,
            typeecriture,
            createdat,
            createdby
        )
        VALUES
        (
            @idligneecriture,
            @idecriture,
            @numligne,
            @idnature,
            @nature,
            @idcompte,
            @compte,
            @idcentreanalytique,
            @centreanalytique,
            @idtiers,
            @tiers,
            @debit,
            @credit,
            @etat,
            @iddevise,
            @devise,
            @montantdevise,
            @taux,
            @montantbase,
            @typeecriture,
            GETDATE(),
            'SYSTEM'
        )`
module.exports = {
    querytypeoperation,
    queryligneoperationbyidoperation,
    createligneecriture,
    queryjustificatifdetailsbyid
};
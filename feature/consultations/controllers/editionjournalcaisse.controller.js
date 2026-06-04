const asyncHandler = require("../../../shared/middlewares/async");
const consultationservice = require('../services/operationConsultation.service')
const ErrorResponse = require("../../../shared/utils/errorResponse");
const pdfjs = require("../../../shared/utils/pdf")


module.exports.get_journalcaisse = asyncHandler(async (req, res) => {
    try {
        const parms = req.body;
        const data = await consultationservice.editionjournal(parms.datedebut, parms.datefin, parms.idcaisse, parms.idsite);
        const pdfBuffer = await pdfjs.genererPdfJournal(data, parms.datedebut, parms.datefin, parms.utilisateur);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=journal-caisse.pdf');
        res.send(pdfBuffer);

    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Erreur génération PDF' });
    }
});
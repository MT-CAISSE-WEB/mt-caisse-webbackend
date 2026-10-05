const asyncHandler = require("../../../shared/middlewares/async");
const consultationservice = require('../services/operationConsultation.service')
const ErrorResponse = require("../../../shared/utils/errorResponse");
const pdfjs = require("../../../shared/utils/pdf")


module.exports.get_journalcaisse = asyncHandler(async (req, res) => {
    try {

        const parms = req.body;

        const data = await consultationservice.editionjournal(
            parms.datedebut,
            parms.datefin,
            parms.idcaisse,
            parms.idsite
        );

        if (parms.format === "xlsx") {

            const buffer = await pdfjs.genererXlsxJournal(
                data,
                parms.datedebut,
                parms.datefin,
                parms.utilisateur
            );

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );

            res.setHeader(
                "Content-Disposition",
                "attachment; filename=Journal_de_caisse.xlsx"
            );

            return res.send(buffer);
        }

        const buffer = await pdfjs.genererPdfJournal(
            data,
            parms.datedebut,
            parms.datefin,
            parms.utilisateur
        );

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            "inline; filename=journal-caisse.pdf"
        );

        return res.send(buffer);

    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message
        });
    }
});
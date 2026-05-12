const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");
const consultationservice = require('../services/operationConsultation.service')
const pdfjs = require("../../../shared/utils/pdf")

/**
 * Get journal de paiement
 */
module.exports.journalPaiementController = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const result = await consultationservice.journalPaiement(data.datedebut, data.datefin, data.caisse, data.idsite, data.typeentitesociete);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Get detail operation
 */
module.exports.detailOperationController = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const result = await consultationservice.detailOperation(data);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});


/**
 * Get Historique des opérations
 */
module.exports.historyController = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const result = await consultationservice.history(data.caisses, data.date);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Get dernieres opérations
 */
module.exports.getLastOpController = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const result = await consultationservice.getLastOperation(data.caisses, data.date, data.page, data.limit);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Get Tous les paiements
 */
module.exports.getAllpayment = asyncHandler(async(req, res, next) => {
  try {
    const result = await consultationservice.Allpaiement();
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Get Etat cloture caisse
 */
module.exports.etatclotureController = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const result = await consultationservice.getEtatCloture(data);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports.getEtatcloturePdf = asyncHandler(async (req, res) => {
    try {
        const data = req.body;
        const result = await consultationservice.getEtatCloture(data);
        const pdfBuffer = await pdfjs.genererPdfJournal(data, result.datedebut, result.datefin);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=cloture-caisse.pdf');
        res.send(pdfBuffer);

    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Erreur génération PDF' });
    }
});
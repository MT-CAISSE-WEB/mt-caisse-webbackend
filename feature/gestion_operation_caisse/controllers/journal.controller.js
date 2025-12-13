const journalservice = require("../services/journal.service");
const asyncHandler = require("../../../shared/middlewares/async");
const ErrorResponse = require("../../../shared/utils/errorResponse");

/**
 * Liste tous les journaux
 */
module.exports.get_journals = asyncHandler(async(req, res, next) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const search = req.query.search || null;
    const limit = req.query.limit || null;
    const actif = req.query.actif || null; 
    const journals = await journalservice.get_all_journals({page, limit , search, actif});
    res.json({ success: true, data: journals });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

/**
 * Un journal existant par son id
 */
module.exports.get_onejournal = asyncHandler(async(req, res, next) => {
  try {
    const idjournal  = req.params.id;
    const journal_ = await journalservice.get_by_idjournal(idjournal);
    res.json({ success: true, data: journal_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Crée un nouveau journal
 */
module.exports.create_journal = asyncHandler(async(req, res, next) => {
  try {
    const data = req.body;
    const new_journal = await journalservice.create_journal(data);
    res.status(201).json({ success: true, data: new_journal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Met à jour une journal existante
 */
module.exports.update_journal = asyncHandler(async(req, res, next) => {
  try {
    const idjournal  = req.params.id;
    const journal_ = await journalservice.update_journal(idjournal, req.body);
    res.json({ success: true, data: journal_ });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

/**
 * Supprime une journal
 */
module.exports.delete_journal = asyncHandler(async(req, res, next) => {
  try {
    const idjournal = req.params.id;
    console.log(idjournal)
    const journal_ = await journalservice.delete_journal(idjournal);
    res.json({ success: true, message: "journal supprimée" });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
});

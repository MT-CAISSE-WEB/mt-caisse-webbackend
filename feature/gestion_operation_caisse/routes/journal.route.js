const express = require('express');
const router = express.Router();
const journal_controller = require("../controllers/journal.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

// CRUD JOURNAL
router.get("/", authmiddleware.authentificatetoken, journal_controller.get_journals);
router.get("/:id", authmiddleware.authentificatetoken,journal_controller.get_onejournal);
router.post("/create/", authmiddleware.authentificatetoken, journal_controller.create_journal);
router.put("/update/:id", authmiddleware.authentificatetoken, journal_controller.update_journal);
router.delete("/delete/:id", authmiddleware.authentificatetoken, journal_controller.delete_journal);

module.exports = router;
const express = require('express');
const router = express.Router();
const journal_controller = require("../controllers/journal.controller");
//const auth = require("../shared/middlewares/auth");

// CRUD JOURNAL
router.get("/", journal_controller.get_journals);
router.get("/:id", journal_controller.get_onejournal);
router.post("/create/", journal_controller.create_journal);
router.put("/update/:id", journal_controller.update_journal);
router.delete("/delete/:id", journal_controller.delete_journal);

module.exports = router;
const express = require('express');
const router = express.Router();
const motif_controller = require("../controllers/motif.controller");

// CRUD motif
router.get("/", motif_controller.get_motifs);
router.get("/:id", motif_controller.get_onemotif);
router.post("/create/", motif_controller.createmotif);
router.put("/update/:id", motif_controller.update_motif);
router.delete("/delete/:id", motif_controller.delete_motif);

module.exports = router;
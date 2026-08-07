const express = require("express");
const router = express.Router();
const motif_controller = require("../controllers/motif.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

// CRUD motif
router.get(
  "/",
  authmiddleware.authentificatetoken,
  motif_controller.get_motifs,
);
router.get(
  "/:id",
  authmiddleware.authentificatetoken,
  motif_controller.get_onemotif,
);
router.post(
  "/create",
  authmiddleware.authentificatetoken,
  motif_controller.createmotif,
);
router.put(
  "/update/:id",
  authmiddleware.authentificatetoken,
  motif_controller.update_motif,
);
router.delete(
  "/delete/:id",
  authmiddleware.authentificatetoken,
  motif_controller.delete_motif,
);

module.exports = router;

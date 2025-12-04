const express = require("express");
const router = express.Router();
const utilisateurdepartement_controller = require("../controllers/usersdepartement.controller");

router.post("/create", utilisateurdepartement_controller.create_utilisateurdepartement);
router.get("/", utilisateurdepartement_controller.get_all_UtilisateurDepartements);
router.get("/:id", utilisateurdepartement_controller.get_oneutilisateurdepartement);
router.put("/update/:id", utilisateurdepartement_controller.update_utilisateurdepartement);
router.delete("/delete/:id", utilisateurdepartement_controller.delete_utilisateurdepartement);

module.exports = router;

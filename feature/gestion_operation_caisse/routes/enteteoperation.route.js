const express = require('express');
const router = express.Router();
const enteteoperation_controller = require("../controllers/enteteoperation.controller");
//const auth = require("../shared/middlewares/auth");

// CRUD ENTETE OPERATION
router.get("/", enteteoperation_controller.get_enteteoperations);
router.get("/:id", enteteoperation_controller.get_oneenteteoperation);
router.post("/create/", enteteoperation_controller.create_enteteoperation);
router.put("/update/:id", enteteoperation_controller.update_enteteoperation);
router.delete("/delete/:id", enteteoperation_controller.delete_enteteoperation);

module.exports = router;
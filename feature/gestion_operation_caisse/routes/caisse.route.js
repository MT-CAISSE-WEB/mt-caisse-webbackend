const express = require('express');
const router = express.Router();
const caisse_controller = require("../controllers/caisse.controller");
//const auth = require("../shared/middlewares/auth");

// CRUD CAISSE
router.get("/", caisse_controller.get_caisses);
router.get("/:id", caisse_controller.get_onecaisse);
router.post("/create/", caisse_controller.create_caisse);
router.put("/update/:id", caisse_controller.update_caisse);
router.delete("/delete/:id", caisse_controller.delete_caisse);

module.exports = router;

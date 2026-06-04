const router = require("express").Router();
const controller = require("../controllers/soldeByCaisse.controller");

router.get("/stats-caisse", controller.getStatsCaisse);

module.exports = router;

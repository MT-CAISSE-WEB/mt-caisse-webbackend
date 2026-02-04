const express = require("express");
const router = express.Router();

const controller = require("../controllers/justificatifOperation.controller");

router.post("/create", controller.create);
router.get("/", controller.findAll);
router.get("/:id", controller.findOne);
router.put("/update/:id", controller.update);
router.delete("/delete/:id", controller.delete);
router.post("/full/create", controller.createFull);


module.exports = router;

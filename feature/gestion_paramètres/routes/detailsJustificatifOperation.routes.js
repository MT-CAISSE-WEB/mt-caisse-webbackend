const express = require("express");
const router = express.Router();

const controller = require(
  "../controllers/detailsJustificatifOperation.controller"
);

/* CRUD complet */
router.post("/create", controller.create);
router.get("/", controller.findAll);
router.get("/:id", controller.findOne);
router.put("/update/:id", controller.update);
router.delete("/delete/:id", controller.delete);

module.exports = router;

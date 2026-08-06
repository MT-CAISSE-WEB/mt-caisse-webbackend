const express = require("express");
const router = express.Router();

const controller = require(
  "../controllers/detailsJustificatifOperation.controller"
);
const authmiddleware = require("../../../middlewares/auth.middlewre");

/* CRUD complet */
router.post("/create", authmiddleware.authentificatetoken, controller.create);
router.get("/", authmiddleware.authentificatetoken, controller.findAll);
router.get("/:id", authmiddleware.authentificatetoken, controller.findOne);
router.put("/update/:id", authmiddleware.authentificatetoken, controller.update);
router.delete("/delete/:id", authmiddleware.authentificatetoken, controller.delete);

module.exports = router;

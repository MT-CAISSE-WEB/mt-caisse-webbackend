const express = require('express');
const router = express.Router();
const circuitvalidateur_controller = require("../controllers/circuitvalidateur.controller");
//const auth = require("../shared/middlewares/auth");


// CRUD nature operation
router.get("/", circuitvalidateur_controller.get_circuitvalidateurs);
router.get("/:id", circuitvalidateur_controller.get_onecircuitvalidateur);
router.post("/create", circuitvalidateur_controller.create_circuitvalidateur);
router.put("/update/:id", circuitvalidateur_controller.update_circuitvalidateur);
router.delete("/delete/:id", circuitvalidateur_controller.delete_circuitvalidateur);

module.exports = router;

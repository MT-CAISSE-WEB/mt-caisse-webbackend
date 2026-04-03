const express = require('express');
const router = express.Router();
const circuitvalidation_controller = require("../controllers/circuitvalidation.controller");
//const auth = require("../shared/middlewares/auth");


// CRUD nature operation
router.get("/", circuitvalidation_controller.get_circuitvalidations);
router.get("/:id", circuitvalidation_controller.get_onecircuitvalidation);
router.post("/create", circuitvalidation_controller.create_circuitvalidation);
router.post("/", circuitvalidation_controller.createworkflow);
//router.put("/update/:id", circuitvalidation_controller.update_circuitvalidation);
router.put("/:idcircuitvalidation", circuitvalidation_controller.updateworkflow);
router.delete("/delete/:id", circuitvalidation_controller.delete_circuitvalidation);

module.exports = router;

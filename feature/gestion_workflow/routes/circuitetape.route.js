const express = require('express');
const router = express.Router();
const circuitetape_controller = require("../controllers/circuitetape.controller");
//const auth = require("../shared/middlewares/auth");


// CRUD nature operation
router.get("/", circuitetape_controller.get_circuitetapes);
router.get("/:id", circuitetape_controller.get_onecircuitetape);
router.post("/create", circuitetape_controller.create_circuitetape);
router.put("/update/:id", circuitetape_controller.update_circuitetape);
router.delete("/delete/:id", circuitetape_controller.delete_circuitetape);

module.exports = router;
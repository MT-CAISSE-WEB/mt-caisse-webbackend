const express = require('express');
const router = express.Router();
const operation_controller = require("../controllers/operation.controller");
//const auth = require("../shared/middlewares/auth");

// CRUD OPERATION
router.get("/", operation_controller.get_typeoperations);
router.get("/:id", operation_controller.get_onetypeoperation);
router.post("/create/", operation_controller.create_typeoperation);
router.put("/update/:id", operation_controller.update_typeoperation);
router.delete("/delete/:id", operation_controller.delete_typeoperation);

module.exports = router;
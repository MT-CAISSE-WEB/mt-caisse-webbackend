const express = require('express');
const router = express.Router();
const controller = require("../controllers/natureoperation.controller");

router.get("/", controller.get_natures);
router.get("/:idnature", controller.get_onenature);
router.post("/create", controller.create_nature);
router.put("/update/:idnature", controller.update_nature);
router.delete("/delete/:idnature", controller.delete_nature);

module.exports = router;

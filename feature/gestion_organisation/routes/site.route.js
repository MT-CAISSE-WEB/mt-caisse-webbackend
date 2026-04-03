const express = require('express');
const router = express.Router();
const sitecontroller = require("../controllers/site.controller");
const authmiddleware = require("../../../middlewares/auth.middlewre");

router.get("/Site",authmiddleware.authentificatetoken, sitecontroller.getallsites);
router.get("/Site/:id",authmiddleware.authentificatetoken, sitecontroller.getonesite);
router.post("/Site",authmiddleware.authentificatetoken, sitecontroller.upsertsite);
router.delete("/Site/:id",authmiddleware.authentificatetoken, sitecontroller.deletesite);

module.exports = router;

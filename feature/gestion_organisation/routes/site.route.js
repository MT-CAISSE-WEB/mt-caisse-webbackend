const express = require('express');
const router = express.Router();
const sitecontroller = require("../controllers/site.controller");

router.get("/Site", sitecontroller.getallsites);
router.get("/Site/:id", sitecontroller.getonesite);
router.post("/Site", sitecontroller.upsertsite);
router.delete("/Site/:id",sitecontroller.deletesite);

module.exports = router;
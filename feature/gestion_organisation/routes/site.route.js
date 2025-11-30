const express = require('express');
const router = express.Router();
const site_controller = require("../controllers/site.controller");
//const auth = require("../shared/middlewares/auth");

// Toutes les routes protégées par authentification
// router.use(auth.authMiddleware);

// CRUD nature operation
router.get("/", site_controller.get_sites);
router.get("/:id", site_controller.get_onesite);
router.post("/create/", site_controller.create_site);
router.put("/update/:id", site_controller.update_site);
router.delete("/delete/:id", site_controller.delete_site);

module.exports = router;

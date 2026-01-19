const express = require('express');
const router = express.Router();
const pieceJointe_controller = require("../controllers/pieceJointe.controller");

// CRUD pieceJointe
router.get("/", pieceJointe_controller.get_pieceJointes);
// router.get("/:id", pieceJointe_controller.get_onepieceJointe);
router.post("/create/", pieceJointe_controller.createpieceJointe);
// router.put("/update/:id", pieceJointe_controller.update_pieceJointe);
router.delete("/delete/:id", pieceJointe_controller.delete_pieceJointe);

module.exports = router;
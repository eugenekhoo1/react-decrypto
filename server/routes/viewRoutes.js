const express = require("express");
const router = express.Router();
const viewRoutes = require("../controllers/viewController");

router.get("/getclues", viewRoutes.getClues);

module.exports = router;

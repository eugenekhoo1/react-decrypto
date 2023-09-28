const express = require("express");
const router = express.Router();
const playerRoutes = require("../controllers/playerController");

router.post("/addplayer", playerRoutes.addPlayer);

module.exports = router;

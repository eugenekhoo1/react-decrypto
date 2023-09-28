const express = require("express");
const router = express.Router();
const gameRoutes = require("../controllers/gameController");

router.get("/newgame", gameRoutes.newGame);
router.get("/getgame/:gid", gameRoutes.getGame);
router.get("/getwords", gameRoutes.getWords);
router.post("/startgame", gameRoutes.startGame);
router.post("/nextround", gameRoutes.nextRound);
router.get("/getround/:gid", gameRoutes.getRoundInfo);
router.post("/postclue", gameRoutes.postClue);
router.post("/postdecode", gameRoutes.postDecode);
router.post("/postintercept", gameRoutes.postIntercept);
router.post("/endgame", gameRoutes.endGame);

module.exports = router;

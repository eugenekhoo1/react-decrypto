const express = require("express");
const router = express.Router();
const chatRoutes = require("../controllers/chatController");

router.get("/getmessages", chatRoutes.getChatMessages);
router.post("/sendmessage", chatRoutes.postChatMessage);

module.exports = router;

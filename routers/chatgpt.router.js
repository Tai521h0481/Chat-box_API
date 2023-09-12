const express = require("express");
const chatGPTRouter = express.Router();
const {chatBot} = require("../controllers/chatgpt.controller");

chatGPTRouter.post("/chat", chatBot);
module.exports = chatGPTRouter;
const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();
const { initiateBot } = require("../discordBot/botClientUtils");

const { JoinAnnouncement } = require("../models/joinAnnouncement");

router.post("/new-join", async (req, res) => { 
  const bot = await Bot.findById(req.body.botId);

  const newJoinAnnouncement = new JoinAnnouncement ({
    responseServer: req.body.responseServer,
    responseChannel: req.body.responseChannel,
    response: req.body.response,
  });

  bot.announcementModules.push(newJoinAnnouncement);

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

module.exports = router;
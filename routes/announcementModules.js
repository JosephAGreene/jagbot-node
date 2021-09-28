const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();
const { initiateBot } = require("../discordBot/botClientUtils");
const { Bot } = require("../models/bot");
const { Announcement } = require("../models/announcement");

router.post("/new-announcement", async (req, res) => { 
  const bot = await Bot.findById(req.body.botId);

  // Return 409 if announcement type already exists 
  // for the given serverId
  let serverCheck = false;
  const reqType = req.body.type;
  const reqServer = req.body.responseChannel.serverId;
  for(let i=0; i < bot.announcementModules.length; i++) {
    let type = bot.announcementModules[i].type;
    let server = bot.announcementModules[i].responseChannel.serverId;
    if(server === reqServer && type === reqType) {
      serverCheck = true;
      break;
    }
  }
  if(serverCheck) {
    return res.status(409).send("duplicate server");
  }

  const newAnnouncement = new Announcement ({
    type: req.body.type,
    responseChannel: req.body.responseChannel,
    responseType: req.body.responseType,
    response: req.body.response,
    embedTitle: req.body.embedTitle,
    embedLinkURL: req.body.embedLinkURL,
    embedColor: req.body.embedColor,
    embedThumbnailURL: req.body.embedThumbnailURL,
    embedMainImageURL: req.body.embedMainImageURL,
    embedDescription: req.body.embedDescription,
    embedFields: req.body.embedFields,
    embedFooter: req.body.embedFooter,
    embedFooterThumbnailURL: req.body.embedFooterThumbnailURL,
  });

  bot.announcementModules.push(newAnnouncement);

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

module.exports = router;
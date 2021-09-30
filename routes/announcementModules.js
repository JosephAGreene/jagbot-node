const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();
const { initiateBot } = require("../discordBot/botClientUtils");
const { Bot } = require("../models/bot");
const { Announcement } = require("../models/announcement");

router.delete("/", async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  const newAnnouncementModules = [];
  for (let i = 0; i < bot.announcementModules.length; i++) {
    if (String(bot.announcementModules[i]._id) !== String(req.body.moduleId)) {
      newAnnouncementModules.push(bot.announcementModules[i]);
    }
  }

  bot.announcementModules = newAnnouncementModules;

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

router.post("/new-announcement", async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  // Return 409 if announcement type already exists 
  // for the given serverId
  let serverCheck = false;
  const reqType = req.body.type;
  const reqServer = req.body.responseChannel.serverId;
  for (let i = 0; i < bot.announcementModules.length; i++) {
    let type = bot.announcementModules[i].type;
    let server = bot.announcementModules[i].responseChannel.serverId;
    if (server === reqServer && type === reqType) {
      serverCheck = true;
      break;
    }
  }
  if (serverCheck) {
    return res.status(409).send("duplicate server");
  }

  const newAnnouncement = new Announcement({
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

router.put("/update-announcement", async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  // If module exists, set moduleLocation to the module's index number
  let moduleLocation = -1;
  for (let i = 0; i < bot.announcementModules.length; i++) {
    if (String(bot.announcementModules[i]._id) === String(req.body.moduleId)) {
      moduleLocation = i;
      break;
    }
  }

  // If module doesn't exist, return 404
  if (moduleLocation < 0) {
    return res.sendStatus(404);
  }

  // Return 409 if announcement type already exists 
  // for the given serverId, ignoring whatever value already 
  // exists for the current module
  let serverCheck = false;
  const reqType = req.body.type;
  const reqServer = req.body.responseChannel.serverId;
  for (let i = 0; i < bot.announcementModules.length; i++) {
    if (String(bot.announcementModules[i]._id) !== String(req.body.moduleId)) {
      let type = bot.announcementModules[i].type;
      let server = bot.announcementModules[i].responseChannel.serverId;
      if (server === reqServer && type === reqType) {
        serverCheck = true;
        break;
      }
    }
  }
  if (serverCheck) {
    return res.status(409).send("duplicate server");
  }

  // Update module with new information
  bot.announcementModules.splice(moduleLocation, 1, {
    ...bot.announcementModules[moduleLocation],
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

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

module.exports = router;
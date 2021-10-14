const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();
const { initiateBot } = require("../discordBot/botClientUtils");
const { Bot } = require("../models/bot");

// Update a moderation module that conforms to the base moderation 
// model type (i.e. Ban, Kick, etc)
router.post("/update-base-moderation", async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  // If module exists, set moduleLocation to the module's index number
  let moduleLocation = -1;
  for (let i = 0; i < bot.moderationModules.length; i++) {
    if (String(bot.moderationModules[i]._id) === String(req.body.moduleId)) {
      moduleLocation = i;
      break;
    }
  }

  // If module doesn't exist, return 404
  if (moduleLocation < 0) {
    return res.sendStatus(404);
  }

  bot.moderationModules.splice(moduleLocation, 1, {
    ...bot.moderationModules[moduleLocation],
    enabled: req.body.enabled,
    command: req.body.command,
    allowedRoles: req.body.allowedRoles,
  });

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

router.post("/update-help-moderation", async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  // If module exists, set moduleLocation to the module's index number
  let moduleLocation = -1;
  for (let i = 0; i < bot.moderationModules.length; i++) {
    if (String(bot.moderationModules[i]._id) === String(req.body.moduleId)) {
      moduleLocation = i;
      break;
    }
  }

  // If module doesn't exist, return 404
  if (moduleLocation < 0) {
    return res.sendStatus(404);
  }

  bot.moderationModules.splice(moduleLocation, 1, {
    ...bot.moderationModules[moduleLocation],
    enabled: req.body.enabled,
    command: req.body.command,
    embedColor: req.body.embedColor,
    allowedRoles: req.body.allowedRoles,
  });

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

module.exports = router;
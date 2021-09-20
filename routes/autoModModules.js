const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { Bot } = require("../models/bot");
const { WordFilter } = require("../models/wordFilter");
const { InviteFilter } = require("../models/inviteFilter");
const { MassCapsFilter } = require("../models/massCapsFilter");
const { MassMentionsFilter } = require("../models/massMentionsFilter");
const { initiateBot } = require("../discordBot/botClientUtils");

router.post("/word-filter", async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  const newWordFilter = new WordFilter({
    enabled: req.body.enabled,
    ignoredRoles: req.body.ignoredRoles,
    triggerWords: req.body.triggerWords,
    delete: req.body.delete,
    warn: req.body.warn,
    response: req.body.response,
    location: req.body.location,
  });

  for (let i = 0; i < bot.scanModules.length; i++) {
    if (bot.scanModules[i].type === "word-filter") {
      bot.scanModules.splice(i, 1, newWordFilter);
      break;
    }
  }

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

router.post("/invite-filter", async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  const newInviteFilter = new InviteFilter({
    enabled: req.body.enabled,
    ignoredRoles: req.body.ignoredRoles,
    delete: req.body.delete,
    warn: req.body.warn,
    response: req.body.response,
    location: req.body.location,
  });

  for (let i = 0; i < bot.scanModules.length; i++) {
    if (bot.scanModules[i].type === "invite-filter") {
      bot.scanModules.splice(i, 1, newInviteFilter);
      break;
    }
  }

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

router.post("/masscaps-filter", async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  const newMassCapsFilter = new MassCapsFilter({
    enabled: req.body.enabled,
    ignoredRoles: req.body.ignoredRoles,
    delete: req.body.delete,
    warn: req.body.warn,
    response: req.body.response,
    location: req.body.location,
  });

  for (let i = 0; i < bot.scanModules.length; i++) {
    if (bot.scanModules[i].type === "masscaps-filter") {
      bot.scanModules.splice(i, 1, newMassCapsFilter);
      break;
    }
  }

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

router.post("/massmentions-filter", async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  const newMassMentionsFilter = new MassMentionsFilter({
    enabled: req.body.enabled,
    limit: req.body.limit,
    ignoredRoles: req.body.ignoredRoles,
    delete: req.body.delete,
    warn: req.body.warn,
    response: req.body.response,
    location: req.body.location,
  });

  for (let i = 0; i < bot.scanModules.length; i++) {
    if (bot.scanModules[i].type === "massmentions-filter") {
      bot.scanModules.splice(i, 1, newMassMentionsFilter);
      break;
    }
  }

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

module.exports = router;
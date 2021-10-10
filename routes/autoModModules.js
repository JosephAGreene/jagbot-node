const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { Bot } = require("../models/bot");
const { AutoRole } = require("../models/autoRole");
const { WordFilter } = require("../models/wordFilter");
const { InviteFilter } = require("../models/inviteFilter");
const { MassCapsFilter } = require("../models/massCapsFilter");
const { MassMentionsFilter } = require("../models/massMentionsFilter");
const { initiateBot } = require("../discordBot/botClientUtils");
const { inviteValid, capsValid, mentionsValid, wordValid } = require("../validators/autoModModules");

router.post("/auto-role", auth, async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  // If bot doesn't exist, return 404
  if (!bot) return res.sendStatus(404);

  // If bot doesn't belong to user, return 401
  if (String(bot.owner) !== String(req.user._id)) {
    return res.sendStatus(401);
  }

  const newAutoRole = new AutoRole({
    enabled: req.body.enabled,
    roles: req.body.roles,
  });

  for (let i = 0; i < bot.autoModModules.length; i++) {
    if (bot.autoModModules[i].type === "auto-role") {
      bot.autoModModules.splice(i, 1, newAutoRole);
      break;
    }
  }

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

router.post("/word-filter", [auth, validate(wordValid)], async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  // If bot doesn't exist, return 404
  if (!bot) return res.sendStatus(404);

  // If bot doesn't belong to user, return 401
  if (String(bot.owner) !== String(req.user._id)) {
    return res.sendStatus(401);
  }

  const newWordFilter = new WordFilter({
    enabled: req.body.enabled,
    ignoredRoles: req.body.ignoredRoles,
    triggerWords: req.body.triggerWords,
    delete: req.body.delete,
    warn: req.body.warn,
    response: req.body.response,
    responseLocation: req.body.responseLocation,
  });

  for (let i = 0; i < bot.autoModModules.length; i++) {
    if (bot.autoModModules[i].type === "word-filter") {
      bot.autoModModules.splice(i, 1, newWordFilter);
      break;
    }
  }

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

router.post("/invite-filter", [auth, validate(inviteValid)], async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  // If bot doesn't exist, return 404
  if (!bot) return res.sendStatus(404);

  // If bot doesn't belong to user, return 401
  if (String(bot.owner) !== String(req.user._id)) {
    return res.sendStatus(401);
  }

  const newInviteFilter = new InviteFilter({
    enabled: req.body.enabled,
    ignoredRoles: req.body.ignoredRoles,
    delete: req.body.delete,
    warn: req.body.warn,
    response: req.body.response,
    responseLocation: req.body.responseLocation,
  });

  for (let i = 0; i < bot.autoModModules.length; i++) {
    if (bot.autoModModules[i].type === "invite-filter") {
      bot.autoModModules.splice(i, 1, newInviteFilter);
      break;
    }
  }

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

router.post("/masscaps-filter", [auth, validate(capsValid)], async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  // If bot doesn't exist, return 404
  if (!bot) return res.sendStatus(404);

  // If bot doesn't belong to user, return 401
  if (String(bot.owner) !== String(req.user._id)) {
    return res.sendStatus(401);
  }

  const newMassCapsFilter = new MassCapsFilter({
    enabled: req.body.enabled,
    ignoredRoles: req.body.ignoredRoles,
    delete: req.body.delete,
    warn: req.body.warn,
    response: req.body.response,
    responseLocation: req.body.responseLocation,
  });

  for (let i = 0; i < bot.autoModModules.length; i++) {
    if (bot.autoModModules[i].type === "masscaps-filter") {
      bot.autoModModules.splice(i, 1, newMassCapsFilter);
      break;
    }
  }

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

router.post("/massmentions-filter", [auth, validate(mentionsValid)], async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  // If bot doesn't exist, return 404
  if (!bot) return res.sendStatus(404);

  // If bot doesn't belong to user, return 401
  if (String(bot.owner) !== String(req.user._id)) {
    return res.sendStatus(401);
  }

  const newMassMentionsFilter = new MassMentionsFilter({
    enabled: req.body.enabled,
    limit: (req.body.limit ? req.body.limit : 5),
    ignoredRoles: req.body.ignoredRoles,
    delete: req.body.delete,
    warn: req.body.warn,
    response: req.body.response,
    responseLocation: req.body.responseLocation,
  });

  for (let i = 0; i < bot.autoModModules.length; i++) {
    if (bot.autoModModules[i].type === "massmentions-filter") {
      bot.autoModModules.splice(i, 1, newMassMentionsFilter);
      break;
    }
  }

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

module.exports = router;
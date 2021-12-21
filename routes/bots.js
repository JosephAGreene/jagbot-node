const express = require("express");
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
const auth = require("../middleware/auth");
const { Bot } = require("../models/bot");
const { User } = require("../models/user");
const { WordFilter } = require("../models/wordFilter");
const { InviteFilter } = require("../models/inviteFilter");
const { MassCapsFilter } = require("../models/massCapsFilter");
const { MassMentionsFilter } = require("../models/massMentionsFilter");
const { AutoRole } = require("../models/autoRole");
const { BanModeration, SoftBanModeration, KickModeration, PurgeModeration, PingModeration, HelpModeration } = require("../models/moderation");
const {
  initiateBot,
  returnRoles,
  returnChannels,
  returnBotInfo,
  setBotUsername,
  setBotActivity,
  setBotAvatar,
  verifyBotToken,
  destroyBot,
} = require("../discordBot/botClientUtils");

// Get summary information for all bots that
// belong to a single user.
router.get("/summary", auth, async (req, res) => {
  let bots = await Bot.find({ owner: req.user._id });

  let botSummary = [];

  for (let i = 0; i < bots.length; i++) {
    let moduleCount = bots[i].customModules.length;
    for (let j = 0; j < bots[i].autoModModules.length; j++) {
      if (bots[i].autoModModules[j].enabled) {
        moduleCount++;
      }
    }
    let botInfo = await returnBotInfo(bots[i]._id, bots[i].botId, bots[i].botToken);
    botSummary.push({
      _id: bots[i]._id,
      creationDate: bots[i].creationDate,
      name: botInfo.name,
      avatarURL: botInfo.avatarUrl,
      enabled: botInfo.enabled,
      moduleCount: moduleCount,
    });
  }
  res.send(botSummary);
});

// To be called before taking a bot to the lab
// Will update bot name, avatarURL, serverRoles, and status
// before returning all the bot's info
router.post("/checkout-bot", async (req, res) => {
  let bot = await Bot.findById(req.body._id);

  bot.set('enabled', req.body.enabled);
  bot.set('avatarURL', req.body.avatarURL);
  bot.set('name', req.body.name);
  bot.set('serverRoles', await returnRoles(bot._id, bot.botToken));
  bot.set('serverChannels', await returnChannels(bot._id, bot.botToken));

  bot.save();

  res.send(bot);
});

router.post("/add-new-bot", async (req, res) => {
  let user = await User.findById(req.user._id).populate('bots');

  // If warningAcknowledged is false, return error
  if (!req.body.warningAcknowledged) {
    return res.status(418).send({ error: 'warningAcknowledged', message: "Acknowledgement is required!"});
  } else {
    user.warningAcknowledged = true;
  }

  // If prefix or token is already in use, return error
  let duplicatePrefix = false;
  let duplicateToken = false;
  for (let i = 0; i < user.bots.length; i++) {
    if (user.bots[i].prefix === req.body.prefix.trim()) {
      duplicatePrefix = true;
      break;
    }
    if (user.bots[i].botToken === req.body.botToken.trim()) {
      duplicateToken = true;
      break;
    }
  }
  if (duplicatePrefix) {
    return res.status(418).send({ error: 'prefix', message: 'Prefix is already in use for another bot you own!' });
  }
  if (duplicateToken) {
    return res.status(418).send({ error: 'token', message: 'Token is already in use for another bot you own!' });
  }

  // Verify bot's information with Discord
  const tokenResult = await verifyBotToken(req.body.botToken, true);

  // If an error property exists, then something went wrong with the 
  // bot verification with discord. Possible issues of interest include
  // an invalid bot token or bot tokens with improper intent settings. 
  if (tokenResult.error) {
    switch (tokenResult.type) {
      case 'botUserId':
        return res.status(418).send({ error: 'token', message: 'Token is invalid! You cannot use tokens from another bot application!' });
      case 'token':
        return res.status(418).send({ error: 'token', message: 'Token is invalid!' });
      case 'intent':
        return res.status(418).send({ error: 'token', message: 'Token does not possess required intents!' });
      default:
        return res.status(400).send(tokenResult.message);
    }
  }

  let bot = new Bot({
    owner: req.user._id,
    botToken: req.body.botToken,
    botId: tokenResult.botId,
    name: tokenResult.botName,
    prefix: req.body.prefix,
    moderationModules: [
      new BanModeration(),
      new SoftBanModeration(),
      new KickModeration(),
      new PurgeModeration(),
      new PingModeration(),
      new HelpModeration(),
    ],
    autoModModules: [
      new InviteFilter(),
      new MassCapsFilter(),
      new MassMentionsFilter(),
      new WordFilter(),
      new AutoRole(),
    ]
  });

  await bot.save();

  user.bots.push(bot._id);

  await user.save();

  initiateBot(bot);

  res.send(bot);
});

router.post("/server-roles", async (req, res) => {
  const bot = await Bot.findById(req.body._id);

  const serverRoles = await returnRoles(bot._id, bot.botToken);

  res.send(serverRoles);
});

router.post("/bot-channels", async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  const botChannels = await returnChannels(bot._id, bot.botToken);

  res.send(botChannels);
});

router.post("/update-prefix", async (req, res) => {
  let user = await User.findById(req.user._id).populate('bots', '_id prefix');
  let bot = await Bot.findById(req.body.botId);

  let dupePrefix = false;
  // Set dupePrefix to true if another bot already has the requested prefix
  for (let i = 0; i < user.bots.length; i++) {
    if ((String(user.bots[i]._id) !== String(req.body.botId)) && (user.bots[i].prefix === req.body.prefix)) {
      dupePrefix = true;
    } 
  }
  // If dupPrefix is true, then another bot already has the requested prefix
  if (dupePrefix) {
    return res.status(418).send('Prefix is already in use for another bot you own!');
  }

  bot.prefix = req.body.prefix;

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

router.post("/update-avatar", upload.single('avatar'), async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  const result = await setBotAvatar(req.body.botId, bot.botId, req.file.path);

  // remove file from uploads folder as it's not longer needed at this point
  fs.unlink(req.file.path, (err) => {
    if (err) {
      console.log(err.message);
    }
  });

  if (result.error) {
    switch (result.type) {
      case 'offline':
        return res.status(418).send('Avatar cannot be changed while bot is offline!');
      case 'rate limit':
        return res.status(418).send('You have been rate limited for changing avatars too quickly. Try again later.');
      case 'file size':
        return res.status(418).send('Something went wrong. Try again later.');
      default:
        return res.status(400).send(result.message);
    }
  }

  bot.avatarURL = result.avatarURL;

  await bot.save();

  res.send(bot);
});

router.post("/update-name", async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  const result = await setBotUsername(req.body.botId, req.body.name);
  
  if (result.error) {
    switch (result.type) {
      case 'rate limit':
        return res.status(418).send("You've been rate limited. Name changes are limited to 2 per hour.");
      case 'offline':
        return res.status(418).send('Bot name cannot be changed while bot is offline!');
      case 'unknown':
        return res.status(400).send(result.message);
      default:
        return res.status(400).send(result.message);
    }
  }

  bot.name = req.body.name;

  await bot.save();

  res.send(bot);
});

router.post("/update-token", async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  const result = await verifyBotToken(req.body.token, false, bot.botId);

  if (result.error) {
    switch (result.type) {
      case 'botUserId':
        return res.status(418).send('Token is invalid! You cannot use tokens from another bot application!');
      case 'token':
        return res.status(418).send('Token is invalid!');
      case 'intent':
        return res.status(418).send('Token does not possess required intents!');
      default:
        return res.status(400).send(result.message);
    }
  }

  bot.botToken = req.body.token;

  await bot.save();

  await destroyBot(bot._id);

  initiateBot(bot);

  res.send(bot);
});

router.post("/update-activity", async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  const result = await setBotActivity(bot._id, req.body.activityType, req.body.activityText);

  if (result.error) {
    switch (result.type) {
      case 'offline':
        return res.status(418).send('Bot activity cannot be changed while bot is offline!');
      case 'discord':
        return res.status(418).send('Something went wrong. Try again later.');
      default:
        return res.status(400).send('Unknown Error');
    }
  }

  bot.activityType = req.body.activityType;
  bot.activityText = req.body.activityType === "none" ? "" : req.body.activityText;

  await bot.save();

  res.send(bot);
});

router.post("/update-enabled", async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  // If requested enabled boolean already matches bot enabled boolean,
  // then desired outcome is already established. Throw an error.
  if (req.body.enabled === bot.enabled) {
    return res.status(418).send(`Bot is already ${bot.enabled ? 'enabled' : 'disabled'}`);
  }

  if (req.body.enabled) {
    bot.enabled = true;
    const restart = await initiateBot(bot);
    // If resart fails, then throw an error
    if (restart.error) {
      bot.enabled = false;
      await bot.save();
      if (restart.message.toLowerCase().includes('intent')) {
        return res.status(418).send("Privileged intents not properly set. Cannot enable bot.");
      }
      return res.status(418).send("Something went wrong. Cannot enable bot.");
    }
    // If restart is successfull, the set enabled and status to true and save
    bot.enabled = true;
    await bot.save();
  } else {
    // If request is to disabled bot, attempt to destroy it
    const destroyed = await destroyBot(bot._id);
    // If bot is destroyed successfully, set enabled and status to false and save
    if (!destroyed.error) {
      bot.enabled = false;
      await bot.save();
    } else {
      return res.status(418).send("Something went wrong. Cannot disable bot.")
    }
  }

  res.send(bot);
});

router.delete("/delete-bot", auth, async (req, res) => {
  let user = await User.findById(req.user._id);

  let botIndex = false;
  for (let i = 0; i < user.bots.length; i++) {
    if (String(user.bots[i]) === String(req.body.botId)) {
      botIndex = i;
      break;
    }
  }
  if (botIndex === false) {
    res.status(404).send('Bot not found under this owner.');
  }

  user.bots.splice(botIndex, 1);
  await user.save();

  let bot = await Bot.findByIdAndDelete(req.body.botId);

  res.status(200).send('Deleted');
});

module.exports = router;
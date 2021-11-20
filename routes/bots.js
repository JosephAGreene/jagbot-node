const express = require("express");
const router = express.Router();
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
  verifyBotWithDiscord, 
  returnRoles, 
  returnChannels, 
  returnBotInfo, 
  setBotUsername,
  setBotActivity,
  verifyBotToken,
  destroyBot, 
} = require("../discordBot/botClientUtils");

// Get summary information for all bots that
// belong to a single user.
router.get("/summary", auth, async (req, res) => {
  let bots = await Bot.find({owner: req.user._id});

  let botSummary = [];

  for (let i=0; i < bots.length; i++) {
    let moduleCount = bots[i].customModules.length;
    for (let j=0; j < bots[i].autoModModules.length; j++) {
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
      status: botInfo.status,
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
  
  bot.set('status', req.body.status);
  bot.set('avatarURL', req.body.avatarURL);
  bot.set('name', req.body.name);
  bot.set('serverRoles', await returnRoles(bot._id, bot.botToken));
  bot.set('serverChannels', await returnChannels(bot._id, bot.botToken));

  bot.save();

  res.send(bot);
});

router.post("/add-new-bot", async (req, res) => {
  let user = await User.findById(req.body.user);

  // Verify bot's information with Discord
  const botInfo = await verifyBotWithDiscord(req.body.botToken);

  // If an error property exists, then something went wrong with the 
  // bot verification with discord. Possible issues of interest include
  // an invalid bot token or bot tokens with improper intent settings. 
  if (botInfo.error) { return res.status(409).send(botInfo.error) };

  let bot = new Bot({
    owner: user,
    botToken: req.body.botToken,
    botId: botInfo.id,
    name: botInfo.name,
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

  bot = await bot.save();

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
  const bot = await Bot.findById(req.body.botId);

  bot.prefix = req.body.prefix;

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

router.post("/update-name", async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  const result = await setBotUsername(req.body.botId, req.body.name);

  if (result.status === 400) {
    return res.status(400).send(result.message);
  }

  if (result.status !== 200) {
    return res.status(result.status).send();
  }

  if (result.status === 200) {
    bot.name = req.body.name;
  }

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

router.post("/update-token", async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  const result = await verifyBotToken(req.body.token, bot.botId);
  
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

  // If requested enabled boolean already matches bot enabled and status boolean
  // then desired outcome is already established. Throw an error.
  if (req.body.enabled === bot.enabled && bot.status === bot.enabled) {
    return res.status(418).send(`Bot is already ${bot.enabled ? 'running' : 'disabled'}`);
  }

  if (req.body.enabled) {
    bot.enabled = true;
    const restart = await initiateBot(bot);
    // If resart fails, then throw an error
    if (!restart) {
      bot.enabled = false;
      bot.status = false;
      await bot.save();
      return res.status(418).send("Something went wrong. Cannot start bot.");
    }
    // If restart is successfull, the set enabled and status to true and save
    bot.status = true;
    await bot.save();
  } else {
    // If request is to disabled bot, attempt to destroy it
    const destroyed = await destroyBot(bot._id);
    // If bot is destroyed successfully, set enabled and status to false and save
    if (!destroyed.error) {
      bot.enabled = false;
      bot.status = false;
      await bot.save();
    } else {
      return res.status(418).send("Something went wrong. Cannot disable bot.")
    }
  }

  res.send(bot);
});

router.delete("/delete-bot", auth, async (req, res) => {
  console.log(req.user);
  console.log(req.body.botId);
  res.status(200).send('Deleted');
});

module.exports = router;
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { Bot } = require("../models/bot");
const { User } = require("../models/user");
const { WordFilter } = require("../models/wordFilter");
const { InviteFilter } = require("../models/inviteFilter");
const { MassCapsFilter } = require("../models/massCapsFilter");
const { MassMentionsFilter } = require("../models/massMentionsFilter");
const { SteamNews } = require("../models/steamNews");
const { initiateBot, verifyBotWithDiscord, returnRoles, returnChannels, returnBotInfo } = require("../discordBot/botClientUtils");

// Get summary information for all bots that
// belong to a single user.
router.get("/summary", auth, async (req, res) => {
  let bots = await Bot.find({owner: req.user._id});

  let botSummary = [];

  for (let i=0; i < bots.length; i++) {
    let moduleCount = bots[i].commandModules.length;
    for (let j=0; j < bots[i].scanModules.length; j++) {
      if (bots[i].scanModules[j].enabled) {
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
    scanModules: [
      new InviteFilter(),
      new MassCapsFilter(),
      new MassMentionsFilter(),
      new WordFilter(),
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


router.post("/steam-news", async (req, res) => {
  const bot = await Bot.findById(req.body._id);

  const newSteamNews = new SteamNews({
    command: req.body.command,
  });

  bot.commandModules.push(newSteamNews);

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

module.exports = router;
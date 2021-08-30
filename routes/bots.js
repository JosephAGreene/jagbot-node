const { Bot } = require("../models/bot");
const { User } = require("../models/user");
const { WordFilter } = require("../models/wordFilter");
const { InviteFilter } = require("../models/inviteFilter");
const { MassCapsFilter } = require("../models/massCapsFilter");
const { MassMentionsFilter } = require("../models/massMentionsFilter");
const { SteamNews } = require("../models/steamNews");
const express = require("express");
const router = express.Router();
const {initiateBot, verifyBotWithDiscord} = require("../discordBot/botClientUtils");

router.post("/new", async (req, res) => {
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
        ]
    });
  
  bot = await bot.save();

  user.bots.push(bot._id);

  await user.save();

  initiateBot(bot);

  res.send(bot);
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

// word-filter route is currently in testing. Not to be used in production.
router.post("/word-filter", async (req, res) => {
    const bot = await Bot.findById(req.body._id);

    const newWordFilter = new WordFilter({
        triggerWords: req.body.triggerWords,
        deleteUserMessage: req.body.deleteUserMessage,
        warnUser: req.body.warnUser,
        warningResponse: req.body.warningResponse,
        editUserMessage: req.body.editUserMessage,
        spamLimit: req.body.spamLimit,
        spamResponse: req.body.spamResponse,
    }); 

    bot.scanModules.push(newWordFilter);

    await bot.save();

    initiateBot(bot);

    res.send(bot);
});

router.post("/invite-filter", async (req, res) => {
    const bot = await Bot.findById(req.body._id);

    const newInviteFilter = new InviteFilter({
        deleteLink: req.body.deleteLink,
        response: req.body.response,
        location: req.body.location,
    }); 

    bot.scanModules.push(newInviteFilter);

    await bot.save();

    initiateBot(bot);

    res.send(bot);
});

router.post("/masscaps-filter", async (req, res) => {
  const bot = await Bot.findById(req.body._id);

  const newMassCapsFilter = new MassCapsFilter({
      enabled: req.body.enabled,
      delete: req.body.delete,
      response: req.body.response,
      location: req.body.location,
  }); 

  bot.scanModules.push(newMassCapsFilter);

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

router.post("/massmentions-filter", async (req, res) => {
  const bot = await Bot.findById(req.body._id);

  const newMassMentionsFilter = new MassMentionsFilter({
      enabled: req.body.enabled,
      limit: req.body.limit,
      delete: req.body.delete,
      response: req.body.response,
      location: req.body.location,
  }); 

  bot.scanModules.push(newMassMentionsFilter);

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

// Reorders bots scanModule array bese on order of scanModule _id recieved in req.body.order array
router.post("/scan-module-order", async (req, res) => {
    const bot = await Bot.findById(req.body._id);
    const newScanModuleOrder = req.body.order;
    const originalScanModules = bot.scanModules;
    
    let newScanModules = [];

    for (let i = 0; i < newScanModuleOrder.length; i++) {
        let newModuleId = newScanModuleOrder[i];

        for (let j = 0; j < originalScanModules.length; j++) {
            if (newModuleId == originalScanModules[j]._id) {
                newScanModules.push(originalScanModules[j]);
                break;
            }
        }

     }

    bot.scanModules = newScanModules;

    await bot.save();

    initiateBot(bot);

    res.send(bot);
});

module.exports = router;
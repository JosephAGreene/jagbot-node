const {Bot, CustomSingle, CustomCollection, CustomRandom, WordFilter, InviteFilter} = require("../models/bot");
const express = require("express");
const router = express.Router();
const {initiateBot, killBot} = require("../discordBot/botClientUtils");

router.get("/", async (req, res) => {
    const bots = await Bot.find();

    res.send(bots);
});

router.post("/init", async (req, res) => {
    let bot = new Bot({
        botToken: req.body.botToken,
        botId: req.body.botId,
        prefix: req.body.prefix
    });

    bot = await bot.save();

    initiateBot(bot);

    res.send(bot);
});

router.post("/custom-single", async (req, res) => {
    const bot = await Bot.findById(req.body._id);

    const newCustomSingle = new CustomSingle({
        command: req.body.command,
        response: req.body.response
    }); 

    bot.commandModules.push(newCustomSingle);

    await bot.save();

    killBot(bot.botId);
    initiateBot(bot);

    res.send(bot);
});

router.post("/custom-collection", async (req, res) => {
    const bot = await Bot.findById(req.body._id);

    // build options array
    let options = [];
    req.body.options.forEach(option => {
        options.push({
            keyword: option.keyword,
            response: option.response
        });
    });

    const newCustomCollection = new CustomCollection({
        command: req.body.command,
        options: options
    }); 

    bot.commandModules.push(newCustomCollection);

    await bot.save();

    killBot(bot.botId);
    initiateBot(bot);

    res.send(bot);
});

router.post("/custom-random", async (req, res) => {
    const bot = await Bot.findById(req.body._id);

    const newCustomRandom = new CustomRandom({
        command: req.body.command,
        responses: req.body.responses
    }); 

    bot.commandModules.push(newCustomRandom);

    await bot.save();

    killBot(bot.botId);
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

    killBot(bot.botId);
    initiateBot(bot);

    res.send(bot);
});

router.post("/invite-filter", async (req, res) => {
    const bot = await Bot.findById(req.body._id);

    const newInviteFilter = new InviteFilter({
        deleteLink: req.body.deleteLink,
        response: req.body.response,
    }); 

    bot.scanModules.push(newInviteFilter);

    await bot.save();

    killBot(bot.botId);
    initiateBot(bot);

    res.send(bot);
});

module.exports = router;
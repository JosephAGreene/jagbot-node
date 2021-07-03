const {Bot} = require("../models/bot");
const {SingleResponse} = require("../models/singleResponse");
const {CollectionResponse} = require("../models/collectionResponse");
const {RandomResponse} = require("../models/randomResponse");
const {WordFilter} = require("../models/wordFilter");
const {InviteFilter} = require("../models/inviteFilter");
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

router.post("/single-response", async (req, res) => {
    const bot = await Bot.findById(req.body._id);

    const newSingleResponse = new SingleResponse({
        command: req.body.command,
        response: req.body.response
    }); 

    bot.commandModules.push(newSingleResponse);

    await bot.save();

    killBot(bot.botId);
    initiateBot(bot);

    res.send(bot);
});

router.post("/collection-response", async (req, res) => {
    const bot = await Bot.findById(req.body._id);

    // build options array
    let options = [];
    req.body.options.forEach(option => {
        options.push({
            keyword: option.keyword,
            response: option.response
        });
    });

    const newCollectionResponse = new CollectionResponse({
        command: req.body.command,
        options: options
    }); 

    bot.commandModules.push(newCollectionResponse);

    await bot.save();

    killBot(bot.botId);
    initiateBot(bot);

    res.send(bot);
});

router.post("/random-response", async (req, res) => {
    const bot = await Bot.findById(req.body._id);

    const newRandomResponse = new RandomResponse({
        command: req.body.command,
        responses: req.body.responses
    }); 

    bot.commandModules.push(newRandomResponse);

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
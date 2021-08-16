const { Bot } = require("../models/bot");
const { SingleResponse } = require("../models/singleResponse");
const { OptionedResponse } = require("../models/optionedResponse");
const { RandomResponse } = require("../models/randomResponse");

const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();
const {initiateBot} = require("../discordBot/botClientUtils");

router.delete("/", async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  const newCommandModules = [];
  for (let i=0; i < bot.commandModules.length; i++) {
    if (bot.commandModules[i]._id != req.body.moduleId) {
      newCommandModules.push(bot.commandModules[i]);
    }
  }

  bot.commandModules = newCommandModules;

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

router.post("/single-response", async (req, res) => {
    const bot = await Bot.findById(req.body._id);
    let commandExists = false;
    bot.commandModules.forEach((module) => {
      if(module.command === req.body.command) {
        commandExists = true;
      }
    })

    if (commandExists) {
      return res.status(409).send("duplicate command");
    }

    const newSingleResponse = new SingleResponse({
        command: req.body.command,
        description: req.body.description,
        responseLocation: req.body.responseLocation,
        response: req.body.response,
    }); 

    bot.commandModules.push(newSingleResponse);

    await bot.save();

    initiateBot(bot);

    res.send(bot);
});

router.put("/update-single-response", async (req, res) => {
  const bot = await Bot.findById(req.body._id);

  for (let i=0; i < bot.commandModules.length; i++) {
    if (bot.commandModules[i]._id == req.body.moduleId) {
      bot.commandModules.splice(i, 1, {
        ...bot.commandModules[i],
        command: req.body.command,
        description: req.body.description,
        responseLocation: req.body.responseLocation,
        response: req.body.response,
      });
      break;
    }
  }

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

router.post("/optioned-response", async (req, res) => {
    const bot = await Bot.findById(req.body._id);
    let commandExists = false;
    bot.commandModules.forEach((module) => {
      if(module.command === req.body.command) {
        commandExists = true;
      }
    })

    if (commandExists) {
      return res.status(409).send("duplicate command");
    }

    // Build options array
    let options = [];
    req.body.options.forEach(option => {
        options.push({
            _id: new mongoose.Types.ObjectId(),
            keyword: option.keyword,
            response: option.response
        });
    });

    const newOptionedResponse = new OptionedResponse({
        command: req.body.command,
        description: req.body.description,
        options: options,
    }); 

    bot.commandModules.push(newOptionedResponse);

    await bot.save();

    initiateBot(bot);

    res.send(bot);
});

router.put("/update-optioned-response", async (req, res) => {
  const bot = await Bot.findById(req.body._id);

  // Build options array
  let options = [];
  req.body.options.forEach(option => {
      options.push({
          _id: new mongoose.Types.ObjectId(),
          keyword: option.keyword,
          response: option.response
      });
  });

  // Insert new optioned command values at location of moduleId
  for (let i=0; i < bot.commandModules.length; i++) {
    if (bot.commandModules[i]._id == req.body.moduleId) {
      bot.commandModules.splice(i, 1, {
        ...bot.commandModules[i],
        command: req.body.command,
        description: req.body.description,
        responseLocation: req.body.responseLocation,
        options: options,
      });
      break;
    }
  }

  await bot.save();

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

    initiateBot(bot);

    res.send(bot);
});

module.exports = router;
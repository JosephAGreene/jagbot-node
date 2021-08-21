const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { Bot } = require("../models/bot");
const { SingleResponse, validateSingle } = require("../models/singleResponse");
const { OptionedResponse } = require("../models/optionedResponse");
const { RandomResponse } = require("../models/randomResponse");

const mongoose = require('mongoose');
const express = require("express");
const router = express.Router();
const { initiateBot } = require("../discordBot/botClientUtils");

router.delete("/", async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  const newCommandModules = [];
  for (let i = 0; i < bot.commandModules.length; i++) {
    if (bot.commandModules[i]._id != req.body.moduleId) {
      newCommandModules.push(bot.commandModules[i]);
    }
  }

  bot.commandModules = newCommandModules;

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

router.post("/single-response", [auth, validate(validateSingle)], async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  // If bot doesn't exist, return 404
  if (!bot) return res.sendStatus(404);

  console.log(bot.owner)
  console.log(req.user._id)
  // If bot doesn't belong to user, return 401
  if (String(bot.owner) !== String(req.user._id)) { 
    console.log('hit')
    return res.sendStatus(401);
  }

  let commandExists = false;
  bot.commandModules.forEach((module) => {
    if (module.command === req.body.command) {
      commandExists = true;
    }
  });

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
  const bot = await Bot.findById(req.body.botId);

  for (let i = 0; i < bot.commandModules.length; i++) {
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
  const bot = await Bot.findById(req.body.botId);
  let commandExists = false;
  bot.commandModules.forEach((module) => {
    if (module.command === req.body.command) {
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
      response: option.response,
    });
  });

  const newOptionedResponse = new OptionedResponse({
    command: req.body.command,
    description: req.body.description,
    responseLocation: req.body.responseLocation,
    options: options,
  });

  bot.commandModules.push(newOptionedResponse);

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

router.put("/update-optioned-response", async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  // Build options array
  let options = [];
  req.body.options.forEach(option => {
    options.push({
      _id: new mongoose.Types.ObjectId(),
      keyword: option.keyword,
      response: option.response,
    });
  });

  // Insert new optioned command values at location of moduleId
  for (let i = 0; i < bot.commandModules.length; i++) {
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
  const bot = await Bot.findById(req.body.botId);
  let commandExists = false;
  bot.commandModules.forEach((module) => {
    if (module.command === req.body.command) {
      commandExists = true;
    }
  })

  if (commandExists) {
    return res.status(409).send("duplicate command");
  }

  // Build responses array
  let responses = [];
  req.body.responses.forEach(response => {
    responses.push({
      _id: new mongoose.Types.ObjectId(),
      response: response.response,
    });
  });

  const newRandomResponse = new RandomResponse({
    command: req.body.command,
    description: req.body.description,
    responseLocation: req.body.responseLocation,
    responses: responses,
  });

  bot.commandModules.push(newRandomResponse);

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

router.put("/update-random-response", async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  // Build responses array
  let responses = [];
  req.body.responses.forEach(response => {
    responses.push({
      _id: new mongoose.Types.ObjectId(),
      response: response.response,
    });
  });

  // Insert new random command values at location of moduleId
  for (let i = 0; i < bot.commandModules.length; i++) {
    if (bot.commandModules[i]._id == req.body.moduleId) {
      bot.commandModules.splice(i, 1, {
        ...bot.commandModules[i],
        command: req.body.command,
        description: req.body.description,
        responseLocation: req.body.responseLocation,
        responses: responses,
      });
      break;
    }
  }

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

module.exports = router;
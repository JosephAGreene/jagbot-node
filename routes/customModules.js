const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { Bot } = require("../models/bot");
const { SingleResponse, addSingle, updateSingle } = require("../models/singleResponse");
const { OptionedResponse, addOptioned, updateOptioned } = require("../models/optionedResponse");
const { RandomResponse, addRandom, updateRandom } = require("../models/randomResponse");

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

router.post("/single-response", async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  // If bot doesn't exist, return 404
  if (!bot) return res.sendStatus(404);

  //If bot doesn't belong to user, return 401
  if (String(bot.owner) !== String(req.user._id)) { 
    return res.sendStatus(401);
  }

  let commandExists = false;
  bot.commandModules.forEach((module) => {
    if (module.command.toLowerCase() === req.body.command.toLowerCase()) {
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
    responseType: req.body.responseType,
    response: req.body.response,
    embedTitle: req.body.embedTitle,
    embedLinkURL: req.body.embedLinkURL,
    embedColor: req.body.embedColor,
    embedThumbnailURL: req.body.embedThumbnailURL,
    embedMainImageURL: req.body.embedMainImageURL,
    embedDescription: req.body.embedDescription,
    embedFields: req.body.embedFields,
    embedFooter: req.body.embedFooter,
    embedFooterThumbnailURL: req.body.embedFooterThumbnailURL,
  });

  bot.commandModules.push(newSingleResponse);

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

router.put("/update-single-response", auth , async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  // If bot doesn't exist, return 404
  if (!bot) return res.sendStatus(404);

  // If bot doesn't belong to user, return 401
  if (String(bot.owner) !== String(req.user._id)) { 
    return res.sendStatus(401);
  }

  // If module exists, set moduleLocation to the module's index number
  let moduleLocation = -1;
  for (let i =0; i < bot.commandModules.length; i++) {
    if (String(bot.commandModules[i]._id) === String(req.body.moduleId)) {
      moduleLocation = i;
      break;
    }
  }

  // If module doesn't exist, return 404
  if (moduleLocation < 0) {
    return res.sendStatus(404);
  } 

  let commandExists = false;
  bot.commandModules.forEach((module, index) => {
    if (module.command.toLowerCase() === req.body.command.toLowerCase()) {
      commandExists = index;
    }
  });
  
  // If duplicate command exists that ISN'T found the module
  // being updatesd, then return 409
  if (commandExists && commandExists !== moduleLocation) {
    return res.status(409).send("duplicate command");
  }

  bot.commandModules.splice(moduleLocation, 1, {
    ...bot.commandModules[moduleLocation],
    command: req.body.command,
    description: req.body.description,
    responseLocation: req.body.responseLocation,
    responseType: req.body.responseType,
    response: req.body.response,
    embedTitle: req.body.embedTitle,
    embedLinkURL: req.body.embedLinkURL,
    embedColor: req.body.embedColor,
    embedThumbnailURL: req.body.embedThumbnailURL,
    embedMainImageURL: req.body.embedMainImageURL,
    embedDescription: req.body.embedDescription,
    embedFields: req.body.embedFields,
    embedFooter: req.body.embedFooter,
    embedFooterThumbnailURL: req.body.embedFooterThumbnailURL,
  });

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

router.post("/optioned-response", auth , async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  // If bot doesn't exist, return 404
  if (!bot) return res.sendStatus(404);

  // If bot doesn't belong to user, return 401
  if (String(bot.owner) !== String(req.user._id)) { 
    return res.sendStatus(401);
  }

  let commandExists = false;
  bot.commandModules.forEach((module) => {
    if (module.command.toLowerCase() === req.body.command.toLowerCase()) {
      commandExists = true;
    }
  })

  if (commandExists) {
    return res.status(409).send("duplicate command");
  }

  // if options array contains duplicate keywords, return 400
  const keywords = [];
  req.body.options.forEach((option) => {
    keywords.push(option.keyword.toLowerCase());
  });
  const noDuplicates = new Set(keywords);
  if(keywords.length !== noDuplicates.size) {
    return res.status(400).send("No duplicate keywords allowed");
  }

  // Build options array
  let options = [];
  req.body.options.forEach(option => {
    options.push({
      _id: new mongoose.Types.ObjectId(),
      keyword: option.keyword,
      responseType: option.responseType,
      response: option.response,
      embedTitle: option.embedTitle,
      embedLinkURL: option.embedLinkURL,
      embedColor: option.embedColor,
      embedThumbnailURL: option.embedThumbnailURL,
      embedMainImageURL: option.embedMainImageURL,
      embedDescription: option.embedDescription,
      embedFields: option.embedFields,
      embedFooter: option.embedFooter,
      embedFooterThumbnailURL: option.embedFooterThumbnailURL,
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

router.put("/update-optioned-response", auth, async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  // If bot doesn't exist, return 404
  if (!bot) return res.sendStatus(404);

  // If bot doesn't belong to user, return 401
  if (String(bot.owner) !== String(req.user._id)) { 
    return res.sendStatus(401);
  }

  // If module exists, set moduleLocation to the module's index number
  let moduleLocation = -1;
  for (let i =0; i < bot.commandModules.length; i++) {
    if (String(bot.commandModules[i]._id) === String(req.body.moduleId)) {
      moduleLocation = i;
      break;
    }
  }

  // If module doesn't exist, return 404
  if (moduleLocation < 0) {
    return res.sendStatus(404);
  } 

  let commandExists = false;
  bot.commandModules.forEach((module, index) => {
    if (module.command.toLowerCase() === req.body.command.toLowerCase()) {
      commandExists = index;
    }
  })

  //If duplicate command exists that ISN'T found the module
  // being updatesd, then return 409
  if (commandExists && commandExists !== moduleLocation) {
    return res.status(409).send("duplicate command");
  } 

  //if options array contains duplicate keywords, return 400
  const keywords = [];
  req.body.options.forEach((option) => {
    keywords.push(option.keyword.toLowerCase());
  });
  const noDuplicates = new Set(keywords);
  if(keywords.length !== noDuplicates.size) {
    return res.status(400).send("No duplicate keywords allowed");
  }

  // Build options array
  let options = [];
  req.body.options.forEach(option => {
    options.push({
      _id: new mongoose.Types.ObjectId(),
      keyword: option.keyword,
      responseType: option.responseType,
      response: option.response,
      embedTitle: option.embedTitle,
      embedLinkURL: option.embedLinkURL,
      embedColor: option.embedColor,
      embedThumbnailURL: option.embedThumbnailURL,
      embedMainImageURL: option.embedMainImageURL,
      embedDescription: option.embedDescription,
      embedFields: option.embedFields,
      embedFooter: option.embedFooter,
      embedFooterThumbnailURL: option.embedFooterThumbnailURL,
    });
  });

  // Insert new optioned command values at location of moduleId
  bot.commandModules.splice(moduleLocation, 1, {
    ...bot.commandModules[moduleLocation],
    command: req.body.command,
    description: req.body.description,
    responseLocation: req.body.responseLocation,
    options: options,
  });

  await bot.save();

  initiateBot(bot);
  
  res.send(bot);
});

router.post("/random-response", auth, async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  // If bot doesn't exist, return 404
  if (!bot) return res.sendStatus(404);

  // If bot doesn't belong to user, return 401
  if (String(bot.owner) !== String(req.user._id)) { 
    return res.sendStatus(401);
  }

  let commandExists = false;
  bot.commandModules.forEach((module) => {
    if (module.command.toLowerCase() === req.body.command.toLowerCase()) {
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
      responseType: response.responseType,
      response: response.response,
      embedTitle: response.embedTitle,
      embedLinkURL: response.embedLinkURL,
      embedColor: response.embedColor,
      embedThumbnailURL: response.embedThumbnailURL,
      embedMainImageURL: response.embedMainImageURL,
      embedDescription: response.embedDescription,
      embedFields: response.embedFields,
      embedFooter: response.embedFooter,
      embedFooterThumbnailURL: response.embedFooterThumbnailURL,
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

router.put("/update-random-response", auth, async (req, res) => {
  const bot = await Bot.findById(req.body.botId);

  // If bot doesn't exist, return 404
  if (!bot) return res.sendStatus(404);

  // If bot doesn't belong to user, return 401
  if (String(bot.owner) !== String(req.user._id)) { 
    return res.sendStatus(401);
  }

  // If module exists, set moduleLocation to the module's index number
  let moduleLocation = -1;
  for (let i =0; i < bot.commandModules.length; i++) {
    if (String(bot.commandModules[i]._id) === String(req.body.moduleId)) {
      moduleLocation = i;
      break;
    }
  }

  // If module doesn't exist, return 404
  if (moduleLocation < 0) {
    return res.status(404).send("Module does not exist");
  } 

  let commandExists = false;
  bot.commandModules.forEach((module, index) => {
    if (module.command.toLowerCase() === req.body.command.toLowerCase()) {
      commandExists = index;
    }
  })

  // If duplicate command exists that ISN'T found the module
  // being updatesd, then return 409
  if (commandExists && commandExists !== moduleLocation) {
    return res.status(409).send("duplicate command");
  }

  // Build responses array
  let responses = [];
  req.body.responses.forEach(response => {
    responses.push({
      _id: new mongoose.Types.ObjectId(),
      responseType: response.responseType,
      response: response.response,
      embedTitle: response.embedTitle,
      embedLinkURL: response.embedLinkURL,
      embedColor: response.embedColor,
      embedThumbnailURL: response.embedThumbnailURL,
      embedMainImageURL: response.embedMainImageURL,
      embedDescription: response.embedDescription,
      embedFields: response.embedFields,
      embedFooter: response.embedFooter,
      embedFooterThumbnailURL: response.embedFooterThumbnailURL,
    });
  });

  // Insert new random command values at location of moduleId
  bot.commandModules.splice(moduleLocation, 1, {
    ...bot.commandModules[moduleLocation],
    command: req.body.command,
    description: req.body.description,
    responseLocation: req.body.responseLocation,
    responses: responses,
  });

  await bot.save();

  initiateBot(bot);

  res.send(bot);
});

module.exports = router;
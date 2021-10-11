const {Bot} = require("../../models/bot");
const { buildResponse } = require("../commandUtils");

module.exports = {
  type: 'random-response',
  description: 'This is a random response description',
  async execute(message, botId, moduleId) {
    // Find Bot
    const bot = await Bot.findById(botId);
    if (!bot) return;
    // Find Module
    const module = bot.customModules.find((module) => String(module._id) == String(moduleId));
    if (!module) return;

    try {
      // Determine random number by using the length of the responses array
      let randomPosition = Math.floor(Math.random() * module.responses.length);

      // If a response exists in the responses array that correlates to the randomPosition number,
      // then respond with it. 
      if (module.responses[randomPosition]) {
        const response = await buildResponse(message, module.responses[randomPosition]);
        await response();
      }
    }
    catch (err) {
      message.channel.send(err.message);
    }
  },
};
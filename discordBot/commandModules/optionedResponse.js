const {Bot} = require("../../models/bot");
const { buildResponse } = require("../commandUtils");

module.exports = {
  type: 'optioned-response',
  description: 'This is an optioned response description',
  async execute(message, botId, moduleId) {
    // Determine if option keyword exists
    const optionKeyword = message.content.split(" ")[1];
    if (!optionKeyword) return;

    // Find Bot
    const bot = await Bot.findById(botId);
    if (!bot) return;

    // Find Module
    const module = bot.customModules.find((module) => String(module._id) == String(moduleId));
    if (!module) return;

    try {
      //Determine if options list for collection reply has correlated keyword
      for (let i = 0; i < module.options.length; i++) {
        if (module.options[i].keyword.toLowerCase() === optionKeyword.toLowerCase()) {
          const response = await buildResponse(message, module.options[i]);
          await response();
          break;
        }
      }
    }
    catch (err) {
      message.channel.send(err.message);
    }
  },
};
const {Bot} = require("../../models/bot");
const {buildResponse} = require("../commandUtils");

module.exports = {
	type: 'single-response',
	description: 'This is a single response description',
	async execute(message, botId, moduleId) {
    // Find Bot
    const bot = await Bot.findById(botId);
    if(!bot) return;
    // Find Module
    const module = bot.customModules.find((module) => String(module._id) == String(moduleId));
    if(!module) return;

    try {
      const response = await buildResponse(message, module);
      await response();
    } catch (err) {
      message.channel.send(err.message);
    }
	},
};
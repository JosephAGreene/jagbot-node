const { Bot } = require("../../models/bot");
const { roleMatch } = require("../commandUtils");

module.exports = {
  type: 'purge',
  async execute(message, botId, moduleId) {
    // Find Bot
    const bot = await Bot.findById(botId);
    if (!bot) return;

    // Find Module
    const module = bot.moderationModules.find((module) => String(module._id) === String(moduleId));
    if (!module || !module.enabled) return;

    // Do nothing if command sent by a member without allowed role
    const roleMatched = roleMatch(message, module.allowedRoles);
    if (!roleMatched) {
      message.reply("You don't possess an authorized role to use this command.");
      return;
    }

    const numArg = Number(message.content.split(' ')[1]);
    if (Number.isNaN(numArg) || numArg < 2 || numArg > 100) {
      message.reply('You must supply a number value betwee 2 and 100.');
      return;
    }

    try {
      await message.channel.bulkDelete(numArg);
      message.channel.send(`${numArg} messaged have been deleted.`);
    } catch (err) {
      console.log(err.message);
    }
    
    return;
  },
};
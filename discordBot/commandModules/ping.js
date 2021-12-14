const { Bot } = require("../../models/bot");
const { returnClientLatency } = require("../botClientUtils");
const { roleMatch } = require("../commandUtils");

module.exports = {
  type: 'ping',
  async execute(message, botId, moduleId) {
    // Find Bot
    const bot = await Bot.findById(botId);
    if (!bot) return;

    // Find Module
    const module = bot.moderationModules.find((module) => String(module._id) === String(moduleId));
    if (!module || !module.enabled) return;

    // Do nothing if command sent by a member without allowed role.
    // If allowedRoles is blank, then all users are allowed to use command
    const roleMatched = ((module.allowedRoles.length > 0) ? roleMatch(message, module.allowedRoles) : true);
    if (!roleMatched) {
      try {
        await message.reply("You don't possess an authorized role to use this command.");
        return;
      } catch (err) {
        console.log(err.message);
        return;
      }
    }

    const clientLatency = returnClientLatency(botId);
    if(!clientLatency) return;

    try {
      message.channel.send('pinging').then(m => {
        m.edit(`**Bot Latency** \n${m.createdTimestamp - message.createdTimestamp}ms. \n \n**Discord Latency** \n${Math.round(clientLatency)}ms`);
      });
    } catch (err) {
      console.log(err.message);
    }

    return;
  },
};
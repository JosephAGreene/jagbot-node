const { Bot } = require("../../models/bot");
const { getMentionId, roleMatch } = require("../commandUtils");

module.exports = {
  type: 'kick',
  async execute(message, botId, moduleId) {
    // Find Bot
    const bot = await Bot.findById(botId);
    if (!bot) return;
    // Find Module
    const module = bot.moderationModules.find((module) => String(module._id) === String(moduleId));
    if (!module || !module.enabled) return;

    // Do nothing if command sent by a member without allowed role
    const roleMatched = roleMatch(message, module.allowedRoles);
    if (!roleMatched) return;

    // If more or less than 1 mention exists, do nothing
    if(message.mentions.users.size !== 1) return;
    
    // Get user id from mention collection 
    const collectionMentionId = message.mentions.users.firstKey(1)[0];  

    // Get user id from message mention
    const mentionArg = message.content.split(' ')[1];
    const messageMentionId = getMentionId(mentionArg);
    
    // collectionMentionId and messageMentionId MUST be the same
    if (collectionMentionId !== messageMentionId) return;

    const kickMember = message.guild.members.cache.get(messageMentionId);

    if (kickMember) {
      try {
        await kickMember.kick();
      } catch (err) {
        console.log(err.message);
      }
    }

    return;
  },
};
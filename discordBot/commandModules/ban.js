const { Bot } = require("../../models/bot");
const { getMentionId, roleMatch } = require("../commandUtils");

module.exports = {
  type: 'ban',
  async execute(message, botId, moduleId) {
    // Find Bot
    const bot = await Bot.findById(botId);
    if (!bot) return;
    // Find Module
    const module = bot.moderationModules.find((module) => String(module._id) === String(moduleId));
    if (!module) return;

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

    const banMember = message.guild.members.cache.get(messageMentionId);
    const reason = message.content.split(' ').slice(2).join(' ').trim();

    if (banMember) {
      try {
        await banMember.ban({reason: (reason ? reason : '')});
      } catch (err) {
        console.log(err.message);
      }
    }

    return;
  },
};
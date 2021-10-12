const { Bot } = require("../../models/bot");
const { getMentionId, roleMatch } = require("../commandUtils");

module.exports = {
  type: 'soft-ban',
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
      try {
        message.reply("You don't possess an authorized role to use this command.");
        return;
      } catch (err) {
        return;
      }
    }

    // If more or less than 1 mention exists, do nothing
    if(message.mentions.users.size !== 1) {
      try {
        message.reply("Mention exactly 1 member to soft ban.");
        return;
      } catch (err) {
        return;
      }
    }
    
    // Get user id from mention collection 
    const collectionMentionId = message.mentions.users.firstKey(1)[0];  

    // Get user id from message mention
    const mentionArg = message.content.split(' ')[1];
    const messageMentionId = getMentionId(mentionArg);
    
    // collectionMentionId and messageMentionId MUST be the same
    if (collectionMentionId !== messageMentionId) {
      try {
        message.reply("Cannot find user to soft ban.");
        return;
      } catch (err) {
        return;
      }
    }

    const banMember = message.guild.members.cache.get(messageMentionId);
    const guildName = message.guild.name;
    let reason = message.content.split(' ').slice(2).join(' ').trim();
    // Reduce reason given if it's 500 characters or longer
    if (reason.length > 499) {
      reason = reason.slice(0, 499);
    }

    // Attempt to DM user before banning them, if the user doesn't allow DMs
    // then an error will be thrown, catch it, and then ban the user without
    // sending a DM as a failsafe to the error
    if (banMember) {
      try {
        await banMember.send(`You have been soft banned from ${guildName}. \nReason: ${reason ? reason : "none given"}`);
        await banMember.ban({days: 7, reason: (reason ? reason : '')});
        await message.guild.members.unban(banMember.id);
      } catch (err) {
        try {
          await banMember.ban({days: 7, reason: (reason ? reason : '')});
          await message.guild.members.unban(banMember.id);
        } catch (err) {
          try {
            message.reply(`Cannot soft ban member: ${err.message}`);
          } catch (err) {
            console.log(err.message);
          }
        }
      }
    }

    return;
  },
};
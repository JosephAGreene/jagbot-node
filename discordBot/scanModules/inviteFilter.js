const { messageParser, roleMatch } = require("../commandUtils");

module.exports = {
  type: 'invite-filter',
  async execute(message, botModule) {
    let deleteCheck = false;
    let response = '';

    if (message.content.includes('discord.gg/' || 'discordapp.com/invite')) {
      // Exit function if message author is assigned an ignored role
      try {
        const roleMatched = roleMatch(message, botModule.ignoredRoles);
        if (roleMatched) return false;
      } catch (err) {
        message.channel.send(err.message);
      }

      if (botModule.delete) {
        deleteCheck = true;
      }

      if (botModule.warn) {
        warn = true;
        try {
          response = await messageParser(message, botModule.response);
        } catch (err) {
          message.channel.send(err.message);
        }
      } 
      return {deleteCheck: deleteCheck, warn: botModule.warn, response: response, responseLocation: botModule.responseLocation};
    }
    return false;
  },
}
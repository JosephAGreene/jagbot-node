const { messageParser } = require("../commandUtils");

module.exports = {
  type: 'invite-filter',
  async execute(message, botModule) {
    let deleteCheck = false;
    let response = '';

    if (message.content.includes('discord.gg/' || 'discordapp.com/invite')) {
      if (botModule.delete) {
        deleteCheck = true;
      }

      if (botModule.response) {
        try {
          response = await messageParser(message, botModule.response);
        } catch (err) {
          message.channel.send(err.message);
        }
      }
      return {deleteCheck: deleteCheck, response: response, location: botModule.location};
    }
    return false;
  },
}
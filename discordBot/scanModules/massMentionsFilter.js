const { messageParser } = require("../commandUtils");

module.exports = {
  type: 'massmentions-filter',
  async execute(message, botModule) {
    let deleteCheck = false;
    let response = '';
    const limit = botModule.limit;

    // Determine each mention type
    const everyone = (message.mentions.everyone ? 1 : 0);
    const members = message.mentions.users.size;
    const roles = message.mentions.roles.size;

    const mentionsCount = everyone + members + roles;

    if (mentionsCount > limit) {
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
    return deleteCheck;
  },
};
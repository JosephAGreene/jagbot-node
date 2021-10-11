const { messageParser, roleMatch } = require("../commandUtils");

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
};
const { messageParser, roleMatch } = require("../commandUtils");

module.exports = {
  type: 'masscaps-filter',
  async execute(message, botModule) {
    let deleteCheck = false;
    let response = '';

    if (message.content.length < 20) return false;

    const count = message.content.replace(/[^A-Z]/g, "").length;

    if (count > message.content.length * .7) {
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
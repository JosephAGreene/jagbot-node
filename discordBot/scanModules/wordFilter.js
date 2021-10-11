const { messageParser, roleMatch } = require("../commandUtils");

module.exports = {
  type: 'word-filter',
  async execute(message, botModule) {
    let deleteCheck = false;
    let response = '';
    let triggerFound = false;

    const triggerWords = botModule.triggerWords;

    // Sanitize messages of discord text decoration to prevent filter evasion
    let sanitizedMessage = message.content.replaceAll("_", '');
    sanitizedMessage = sanitizedMessage.replaceAll("*", '');

    // Determine if trigger word was sent
    for (let i = 0; i < triggerWords.length; i++) {
      let regex = new RegExp(`\\b${triggerWords[i]}\\b`, 'i');
      if (regex.test(sanitizedMessage)) {
        triggerFound = true;
        break;
      }
    }

    if (triggerFound) {
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
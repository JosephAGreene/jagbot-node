const { messageParser } = require("../commandUtils");

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
const { messageParser } = require("../commandUtils");

module.exports = {
  type: 'masscaps-filter',
  async execute(message, botModule) {
    let deleteCheck = false;
    let response = '';

    if (message.content.length < 20) return false;

    const count = message.content.replace(/[^A-Z]/g, "").length;

    if (count > message.content.length * .7) {
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
};
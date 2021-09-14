const { buildResponse } = require("../commandUtils");

module.exports = {
  type: 'optioned-response',
  description: 'This is an optioned response description',
  async execute(message, botModule) {
    try {
      //Determine option keyword
      const optionKeyword = message.content.split(" ")[1];

      if (!optionKeyword) return;

      //Determine if options list for collection reply has correlated keyword
      for (let i = 0; i < botModule.options.length; i++) {
        if (botModule.options[i].keyword.toLowerCase() === optionKeyword.toLowerCase()) {
          const response = await buildResponse(message, botModule.options[i]);
          await response();
          break;
        }
      }
    }
    catch (err) {
      message.channel.send(err.message);
    }
  },
};
const {messageParser} = require("../commandUtils");

module.exports = {
	type: 'single-response',
	description: 'This is a single response description',
	async execute(message, botModule) {
    
    try {
      const response = await messageParser(message, botModule.response);
      message.channel.send(response.toString());
    } catch (err) {
      message.channel.send(err.message);
    }
	},
};
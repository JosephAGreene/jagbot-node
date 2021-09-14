const {buildResponse} = require("../commandUtils");

module.exports = {
	type: 'single-response',
	description: 'This is a single response description',
	async execute(message, botModule) {
    
    try {
      const response = await buildResponse(message, botModule);
      await response();
    } catch (err) {
      message.channel.send(err.message);
    }
	},
};
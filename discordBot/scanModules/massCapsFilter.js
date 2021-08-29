module.exports = {
	type: 'masscaps-filter',
	execute(message, botModule) {
    let scanCheck = false;

    if (message.content.length < 20) return scanCheck;

    const count = message.content.replace(/[^A-Z]/g, "").length;

    if (count > botModule.limit) {
      if (botModule.delete) {
          scanCheck = true;
          message.delete();
      }
      
      if (botModule.response) {
          scanCheck = true;
          message.channel.send(botModule.response.toString());
      }
    }
    return scanCheck;
	},
};
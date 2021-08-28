module.exports = {
	type: 'masscaps-filter',
	execute(message, botModule) {
    if (message.content.length < 20) return;
    
    let scanCheck = false;
    const limit = message.content.length * .7;
    const count = message.content.replace(/[^A-Z]/g, "").length;

    if (count > limit) {
      if (botModule.deleteMessage) {
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
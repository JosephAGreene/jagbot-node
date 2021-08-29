module.exports = {
	type: 'massmentions-filter',
	execute(message, botModule) {
    let scanCheck = false;
    const limit = botModule.limit;
    
    // Determine each mention type
    const everyone = (message.mentions.everyone ? 1 : 0);
    const members = message.mentions.users.size;
    const roles = message.mentions.roles.size;
    
    const mentionsCount = everyone + members + roles;

    if (mentionsCount > limit) {
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
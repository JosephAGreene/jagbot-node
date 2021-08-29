module.exports = {
	type: 'invite-filter',
	execute(message, botModule) {
        let scanCheck = false;
        if (message.content.includes('discord.gg/' || 'discordapp.com/invite')) { 
            if (botModule.delete) {
                scanCheck = true;
                message.delete();
            }
            
            if (botModule.response) {
                scanCheck = true;
                message.channel.send(botModule.response);
            }
        }

        return scanCheck;
	},
};
function inviteFilter (selectedModule, message) {
    if (message.content.includes('discord.gg/' || 'discordapp.com/invite')) {
        return () => {
            if (selectedModule.deleteLink) {
                message.delete();
            }
            
            if (selectedModule.response) {
                message.channel.send(selectedModule.response);
            }
        }
    }
    return false;
}

exports.inviteFilter = inviteFilter;
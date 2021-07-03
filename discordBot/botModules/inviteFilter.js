function inviteFilter (selectedModule, message) {
    let response = false;

    if (message.content.includes('discord.gg/' || 'discordapp.com/invite')) {
        return () => {
            if (selectedModule.deleteLink) {
                response = true;
                message.delete();
            }
            
            if (selectedModule.response) {
                response = true;
                message.channel.send(selectedModule.response);
            }
        }
    }
    return response;
}

exports.inviteFilter = inviteFilter;
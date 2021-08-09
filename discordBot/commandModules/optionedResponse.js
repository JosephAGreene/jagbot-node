module.exports = {
	type: 'optioned-response',
	description: 'This is an optioned response description',
	execute(message, botModule) {
        //Determine option keyword
        const optionKeyword = message.content.split(" ")[1];
    
        //Determine if options list for collection reply has correlated keyword
        for (let i = 0; i < botModule.options.length; i++) {
            if (botModule.options[i].keyword === optionKeyword) {
                message.channel.send(botModule.options[i].response);
                break;
            }
        }
	},
};
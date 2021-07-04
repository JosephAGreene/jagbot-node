module.exports = {
	type: 'collection-response',
	description: 'This is a collection response description',
	execute(message, botModule) {
        //Determine collection keyword
        const collectionKeyword = message.content.split(" ")[1];
    
        //Determine if options list for collection reply has correlated keyword
        for (let i = 0; i < botModule.options.length; i++) {
            if (botModule.options[i].keyword === collectionKeyword) {
                message.channel.send(botModule.options[i].response);
                break;
            }
        }
	},
};
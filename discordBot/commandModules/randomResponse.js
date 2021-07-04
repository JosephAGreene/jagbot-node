module.exports = {
	type: 'random-response',
	description: 'This is a random response description',
	execute(message, botModule) {
        // Determine random number by using the length of the responses array
        let randomPosition = Math.floor(Math.random() * botModule.responses.length);

        // If a response exists in the responses array that correlates to the randomPosition number,
        // then respond with it. 
        if (botModule.responses[randomPosition]) {
            message.channel.send(botModule.responses[randomPosition]);
        }
	},
};
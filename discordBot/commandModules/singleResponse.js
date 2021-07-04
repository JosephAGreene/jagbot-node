module.exports = {
	type: 'single-response',
	description: 'This is a single response description',
	execute(message, botModule) {
		message.channel.send(botModule.response);
	},
};
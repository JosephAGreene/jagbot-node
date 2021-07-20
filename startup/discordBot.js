const {Bot} = require("../models/bot");
const {initiateBot} = require("../discordBot/botClientUtils");

module.exports = async () => {
	const bots = await Bot.find({status: true});

	bots.forEach((bot) => {
		initiateBot(bot);
	});
};
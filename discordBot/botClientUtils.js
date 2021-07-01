const Discord = require('discord.js');
const getResponse = require('./buildBotResponse');

// botClients is an object that houses our discord clients
let botClients = {};

// Initiate a single bot client
// bot parameter is expected to be bot object from database
function initiateBot (bot) {
	botClients[bot.botId] = new Discord.Client();
	botClients[bot.botId].login(bot.botToken);

	botClients[bot.botId].once('ready', () => {
		console.log(`Ready: ${bot.botId}`);
	});

	botClients[bot.botId].on('message', message => {
		let response = getResponse(bot, message);

		if (response) {
			response();
		} 
	});
}

//Kill a single bot client
function killBot (botId) {
	botClients[botId].destroy();
	delete botClients[botId];
}

exports.botClients = botClients;
exports.initiateBot = initiateBot;
exports.killBot = killBot;

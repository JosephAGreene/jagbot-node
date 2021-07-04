const Discord = require('discord.js');
const fs = require('fs');
const commandFiles = fs.readdirSync("discordBot/commandModules").filter(file => file.endsWith('.js'));

// botClients is an object that houses our discord clients
let botClients = {};

// Initiate a single bot client
// bot parameter is expected to be bot object from database
function initiateBot (bot) {
	botClients[bot.botId] = new Discord.Client();
	botClients[bot.botId].commands = new Discord.Collection();

	// Add list of commands to botClient that correspond to available command modules from bot
	for (const file of commandFiles) {
		const command = require(`./commandModules/${file}`);
		
		for (i = 0; i < bot.commandModules.length; i++) {
			if (command.type === bot.commandModules[i].moduleType) {
				botClients[bot.botId].commands.set(bot.commandModules[i].command, command);
			}
		}
	}

	botClients[bot.botId].login(bot.botToken);

	botClients[bot.botId].once('ready', () => {
		console.log(`Ready: ${bot.botId}`);
	});
	
	botClients[bot.botId].on('message', message => {

		// Do nothing if message is from a bot, dm channel, or does not contain proper prefix.
		if (!message.content.startsWith(bot.prefix) || 
			message.author.bot || 
			message.channel.type == "dm") return;

		const args = message.content.slice(bot.prefix.length).trim().split(/ +/);
		const command = args.shift().toLowerCase();
	
		// Do nothing if botClient does not recognize given command
		if (!botClients[bot.botId].commands.has(command)) return;
	
		try {
			const botModule = bot.commandModules.find(module => module.command === command);
			botClients[bot.botId].commands.get(command).execute(message, botModule);
		} catch (error) {
			console.error(error);
			message.reply('there was an error trying to execute that command!');
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

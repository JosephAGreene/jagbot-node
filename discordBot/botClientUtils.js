const Discord = require('discord.js');
const fs = require('fs');
const commandFiles = fs.readdirSync("discordBot/commandModules").filter(file => file.endsWith('.js'));
const scanFiles = fs.readdirSync("discordBot/scanModules").filter(file => file.endsWith('.js'));

// botClients is an object that houses our discord clients
let botClients = {};

// Initiate a single bot client
// bot parameter is expected to be bot object from database
function initiateBot (bot) {
	botClients[bot.botId] = new Discord.Client();
	botClients[bot.botId].commands = new Discord.Collection();
	botClients[bot.botId].scans = new Discord.Collection();
 
	// Add list of commands to botClient that correspond to available command modules from bot
	for (const file of commandFiles) {
		const command = require(`./commandModules/${file}`);
		
		for (i = 0; i < bot.commandModules.length; i++) {
			if (command.type === bot.commandModules[i].moduleType) {
				botClients[bot.botId].commands.set(bot.commandModules[i].command, command);
			}
		}
	}

	// Add list of scans to botClient that correspond to available scan modules from bot
	for (const file of scanFiles) {
		const scan = require(`./scanModules/${file}`);
		
		for (i = 0; i < bot.scanModules.length; i++) {
			if (scan.type === bot.scanModules[i].moduleType) {
				botClients[bot.botId].scans.set(bot.scanModules[i].moduleType, scan);
			}
		}
	}

	botClients[bot.botId].login(bot.botToken);

	botClients[bot.botId].once('ready', () => {
		console.log(`Ready: ${bot.botId}`);
	});
	
	botClients[bot.botId].on('message', message => {

		// Do nothing if message is from a bot or dm channel.
		if (message.author.bot || message.channel.type == "dm") return;

		// Attempt to execute all available scan modules on the incoming message.
		// If an scanModule returns true, that means it was executed and we can forgo any further action.
		for (i = 0; i < bot.scanModules.length; i++) {
			const scanCheck = botClients[bot.botId].scans.get(bot.scanModules[i].moduleType).execute(message, bot.scanModules[i]);
			if (scanCheck) return;
		}

		// Do nothing if message does not start with prefix.
		if (!message.content.startsWith(bot.prefix)) return;

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

// Return avatar URL for Bot
function returnAvatarUrl (botId) {
  
  // If bot is an active client, the avatar cannot be retrieved.
  if (!returnStatus(botId)) {
    return "";
  }

  const avatarId = botClients[botId].user.avatar;

  if(!avatarId) {
    return "";
  }

  return `https://cdn.discordapp.com/avatars/${botId}/${avatarId}.png`;
}

// Return bot status as an active client
function returnStatus (botId) {
  const status = botClients[botId];

  if (status === undefined) { return false}
  return true;
}

exports.botClients = botClients;
exports.initiateBot = initiateBot;
exports.killBot = killBot;
exports.returnAvatarUrl = returnAvatarUrl;
exports.returnStatus = returnStatus;

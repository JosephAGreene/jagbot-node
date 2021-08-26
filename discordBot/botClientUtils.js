const Discord = require('discord.js');
const fs = require('fs');
const commandFiles = fs.readdirSync("discordBot/commandModules").filter(file => file.endsWith('.js'));
const scanFiles = fs.readdirSync("discordBot/scanModules").filter(file => file.endsWith('.js'));

// botClients is an object that houses our discord clients
let botClients = {};

// Initiate a single bot client
// bot parameter is expected to be bot object from database
function initiateBot (bot) {
  if (!bot.active) return;
  const id = bot._id;
  const reInit = (botClients[id] ? true : false);

  if (!reInit) {
    botClients[id] = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });
    botClients[id].commands = new Discord.Collection();
    botClients[id].scans = new Discord.Collection();
    botClients[id].botId = bot.botId;
  } 
  else {
    // If bot is already active, then clear it's client listeners and values
    delete botClients[id]._events;
    botClients[id].commands.clear();
    botClients[id].scans.clear();
  }
	
 
	// Add list of commands to botClient that correspond to available command modules from bot
	for (const file of commandFiles) {
		const command = require(`./commandModules/${file}`);
		
		for (i = 0; i < bot.commandModules.length; i++) {
			if (command.type === bot.commandModules[i].type) {
				botClients[id].commands.set(bot.commandModules[i].command.toLowerCase() , command);
			}
		}
	}

	// Add list of scans to botClient that correspond to available scan modules from bot
	for (const file of scanFiles) {
		const scan = require(`./scanModules/${file}`);
		
		for (i = 0; i < bot.scanModules.length; i++) {
			if (scan.type === bot.scanModules[i].type) {
				botClients[id].scans.set(bot.scanModules[i].type, scan);
			}
		}
	}

  if (!reInit) {
    botClients[id].login(bot.botToken);
  
    botClients[id].once('ready', () => {
      console.log(`Ready: ${botClients[id].botId}`);
    });
  }

  const message = (message) => {

    // Do nothing if message is from a bot or dm channel.
    if (message.author.bot || message.channel.type == "dm") return;

    // Attempt to execute all available scan modules on the incoming message.
    // If an scanModule returns true, that means it was executed and we can forgo any further action.
    for (i = 0; i < bot.scanModules.length; i++) {
      const scanCheck = botClients[id].scans.get(bot.scanModules[i].type).execute(message, bot.scanModules[i]);
      if (scanCheck) return;
    }

    // Do nothing if message does not start with prefix.
    if (!message.content.startsWith(bot.prefix)) return;

    const args = message.content.slice(bot.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
  
    // Do nothing if botClient does not recognize given command 
    if (!botClients[id].commands.has(command)) return;
  
    try {
      const botModule = bot.commandModules.find(module => module.command.toLowerCase() === command);
      botClients[id].commands.get(command).execute(message, botModule);
    } catch (error) {
      console.error(error);
      message.reply('there was an error trying to execute that command!');
    }
  }
	
  botClients[id].on('messageCreate', message);
}

async function getBotInfoFromDiscord (token) {
  const bot = new Discord.Client();
  await bot.login(token);
  bot.on('ready', () => {});

  const info = {
    "id" : bot.user.id,
    "name" : bot.user.username,
  }

  bot.destroy();

  return info;
}

// Return avatar URL for Bot
function returnAvatarUrl (id) {
  
  // If bot is not an active client, the avatar cannot be retrieved.
  if (!returnStatus(id)) {
    return "";
  }

  const avatarId = botClients[id].user.avatar;
  const botDiscordId = botClients[id].botId;

  if(!avatarId) {
    return "";
  }

  return `https://cdn.discordapp.com/avatars/${botDiscordId}/${avatarId}.png`;
}

// Return bot status as an active client
function returnStatus (id) {
  const status = botClients[id];

  if (status === undefined) { return false }
  return true;
}

exports.botClients = botClients;
exports.initiateBot = initiateBot;
exports.getBotInfoFromDiscord = getBotInfoFromDiscord;
exports.returnAvatarUrl = returnAvatarUrl;
exports.returnStatus = returnStatus;

// Testing Function For Role Return
// botClients[id].guilds.cache.forEach((guild) => {
//   guild.roles.cache.forEach((role) => {
//     console.log(role.name);
//   })
// });
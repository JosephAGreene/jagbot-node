const Discord = require('discord.js');
const fs = require('fs');
const commandFiles = fs.readdirSync("discordBot/commandModules").filter(file => file.endsWith('.js'));
const scanFiles = fs.readdirSync("discordBot/scanModules").filter(file => file.endsWith('.js'));

// botClients is an object that houses our discord clients
let botClients = {};

// Array of necessary Discord Intents  
const baseIntents = [
  Discord.Intents.FLAGS.GUILDS,
  Discord.Intents.FLAGS.GUILD_MESSAGES,
  Discord.Intents.FLAGS.GUILD_PRESENCES,
  Discord.Intents.FLAGS.GUILD_MEMBERS,
];

// Initiate a single bot client
// bot parameter is expected to be bot object from database
async function initiateBot(bot) {
  if (!bot.active) return;
  const id = bot._id;
  const reInit = (botClients[id] ? true : false);

  if (!reInit) {
    botClients[id] = new Discord.Client({ intents: baseIntents });
    botClients[id].commands = new Discord.Collection();
    botClients[id].scans = new Discord.Collection();
    botClients[id].scanModules = [];
    botClients[id].botId = bot.botId;
  }
  else {
    // If bot is already active, then clear it's client listeners and values
    delete botClients[id]._events;
    botClients[id].commands.clear();
    botClients[id].scans.clear();
    botClients[id].scanModules = [];
  }

  // Add list of commands to botClient that correspond to available command modules from bot
  for (const file of commandFiles) {
    const command = require(`./commandModules/${file}`);

    for (i = 0; i < bot.commandModules.length; i++) {
      if (command.type === bot.commandModules[i].type) {
        botClients[id].commands.set(bot.commandModules[i].command.toLowerCase(), command);
      }
    }
  }

  // Add list of scans to botClient that correspond to available scan modules from bot 
  for (const file of scanFiles) {
    const scan = require(`./scanModules/${file}`);

    for (i = 0; i < bot.scanModules.length; i++) {
      if (scan.type === bot.scanModules[i].type && bot.scanModules[i].enabled) {
        botClients[id].scans.set(bot.scanModules[i].type, scan);
        botClients[id].scanModules.push(bot.scanModules[i]);
      }
    }
  }

  if (!reInit) {
    try {
      await botClients[id].login(bot.botToken);

      await botClients[id].once('ready', () => {
        console.log(`Ready: ${botClients[id].botId}`);
      });
    } catch (err) {
      console.log(`Error: ${botClients[id].botId} - ${err.message}`);
      delete botClients[id];
      return;
    }
  }

  const message = async (message) => {

    // Do nothing if message is from a bot or dm channel.
    if (message.author.bot || message.channel.type == "dm") return;

    // Scan Module Rules:
    // * A provoked scan module will prevent any command module from executing. 
    // * Scan modules that execute messsage delete operations will override all other responses.
    // * Multiple responses may be given if multiple scan modules are provoked without a message delete operation.
    let responseArray = [];
    for (i = 0; i < botClients[id].scanModules.length; i++) {
      const result = await botClients[id].scans.get(botClients[id].scanModules[i].type).execute(message, botClients[id].scanModules[i]);

      if (result.deleteCheck) {
        message.delete();
        if (result.warn) {
          (result.responseLocation === "server"
            ? message.channel.send(result.response.toString())
            : message.author.send(result.response.toString())
          );
        }
        return;
      }

      if (result && result.responseLocation) { responseArray.push(result); }
    }

    let executeCheck = false;
    for (let i = 0; i < responseArray.length; i++) {
      executeCheck = true;
      (responseArray[i].responseLocation === "server"
        ? message.channel.send(responseArray[i].response.toString())
        : message.author.send(responseArray[i].response.toString())
      );
    }
    if (executeCheck) return;

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

// Attempts to login with given bot token
// Returns appropriate errors if there is a problem
// Returns basic information on the bot application if successful 
async function verifyBotWithDiscord(token) {
  const bot = new Discord.Client({ intents: baseIntents });

  try {
    await bot.login(token);
  }
  catch (err) {
    bot.destroy();
    return { "error": err.name };
  }

  const info = {
    "error": false,
    "id": bot.user.id,
    "name": bot.user.username,
  }

  bot.destroy();

  return info;
}

// Return all roles from all servers the bot is a member of, 
// with the exception of the universal @everyone role
async function returnRoles(id, token) {
  let roleArray = [];

  if (returnStatus(id)) {
    // Fetch guilds with await to gaurantee cache accuracy 
    await botClients[id].guilds.fetch();
    botClients[id].guilds.cache.forEach((guild) => {
      guild.roles.cache.forEach((role) => {
        roleArray.push(role.name);
      })
    });
  } else {
    const bot = new Discord.Client({ intents: Discord.Intents.FLAGS.GUILDS });
    try {
      await bot.login(token);
      // Fetch guilds with await to gaurantee cache accuracy 
      await bot.guilds.fetch();
      bot.guilds.cache.forEach((guild) => {
        guild.roles.cache.forEach((role) => {
          roleArray.push(role.name);
        })
      });
    }
    catch (err) {
      bot.destroy();
      return console.log(err.name);
    }
    bot.destroy();
  }
  // Role names converted to lowercase and sorted alphabetically
  const sortedRoles = Array.from(new Set(roleArray.map(e => e.toLowerCase()))).sort();

  // @everyone removed if it exists
  const everyoneIndex = sortedRoles.indexOf('@everyone');
  if (!(everyoneIndex < 0)) {
    sortedRoles.splice(everyoneIndex, 1);
  }

  return sortedRoles;
}

// Convert discord ids into avatar URL
function returnAvatarUrl(userId, avatarId) {
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarId}.png`;
}

// Return bot status as an active client
function returnStatus(id) {
  const status = botClients[id];

  if (status === undefined) { return false }
  return true;
}


async function returnBotInfo(id, botId, token) {
  let botInfo = {};

  if (returnStatus(id)) {
    const botFetch = await botClients[id].users.fetch(botId);
    botInfo.status = true;
    botInfo.name = botFetch.username;
    botInfo.avatarUrl = returnAvatarUrl(botId, botFetch.avatar);
  } else {
    const bot = new Discord.Client({ intents: Discord.Intents.FLAGS.GUILDS });
    await bot.login(token);
    const botFetch = await bot.users.fetch(botId);
    botInfo.status = false;
    botInfo.name = botFetch.username;
    botInfo.avatarUrl = returnAvatarUrl(botId, botFetch.avatar);
    bot.destroy();
  }
  return botInfo;
}

exports.botClients = botClients;
exports.initiateBot = initiateBot;
exports.verifyBotWithDiscord = verifyBotWithDiscord;
exports.returnRoles = returnRoles;
exports.returnStatus = returnStatus;
exports.returnBotInfo = returnBotInfo;
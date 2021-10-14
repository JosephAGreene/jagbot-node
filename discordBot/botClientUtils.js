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
  Discord.Intents.FLAGS.GUILD_BANS,
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

  // Add list of commands to botClient that correspond to available
  // moderation and  command modules from bot
  for (const file of commandFiles) {
    const command = require(`./commandModules/${file}`);

    // Add commands from moderationModules
    for (i = 0; i < bot.moderationModules.length; i++) {
      if (bot.moderationModules[i].enabled && command.type === bot.moderationModules[i].type) {
        const moduleId = bot.moderationModules[i]._id;
        botClients[id].commands.set(bot.moderationModules[i].command.toLowerCase(),
          { execute: async (message) => { command.execute(message, id, moduleId) } }
        );
      }
    }

    // Add commands from customModules
    for (i = 0; i < bot.customModules.length; i++) {
      if (command.type === bot.customModules[i].type) {
        const moduleId = bot.customModules[i]._id;
        botClients[id].commands.set(bot.customModules[i].command.toLowerCase(),
          { execute: async (message) => { command.execute(message, id, moduleId) } }
        );
      }
    }
  }

  // Add list of scans to botClient that correspond to available autoModModules that rely
  // on scan type events (Note: All autoModModules, aside from type autoRole, are scan type)
  for (const file of scanFiles) {
    const scan = require(`./scanModules/${file}`);

    for (i = 0; i < bot.autoModModules.length; i++) {
      if (scan.type === bot.autoModModules[i].type && bot.autoModModules[i].enabled) {
        botClients[id].scans.set(bot.autoModModules[i].type, scan);
        botClients[id].scanModules.push(bot.autoModModules[i]);
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
      botClients[id].commands.get(command).execute(message);
    } catch (error) {
      console.error(error);
      message.reply('there was an error trying to execute that command!');
    }
  }

  botClients[id].on('messageCreate', message);

  // Add guildMemberAdd event listener if type "join"
  // exists in announcementModules, or type "auto-role" exists
  // in scanModule
  const join = async (member) => {
    const joinModule = require(`./memberEventModules/join.js`);
    joinModule.execute(member, id);
  }

  // Both the auto-role autoModModule and type "join" announcementModule are provoked
  // by the guildMemberAdd eventListener. The existence of either one should add
  // the eventListener to the client. 
  let joinCheck = bot.autoModModules.find((module) => module.type === "auto-role");

  // If no auto-role scanModule exists, then check for an announcementModule of type "join"
  if (!joinCheck) {
    for (let i = 0; i < bot.announcementModules.length; i++) {
      if (bot.announcementModules[i].type === "join") {
        joinCheck = true;
        break;
      }
    }
  }

  if (joinCheck) {
    botClients[id].on('guildMemberAdd', join);
  }

  // Add guildMemberAdd event listener if type "leave"
  // or type "kicked" exists in announcementModules
  const leave = async (member) => {
    const leaveModule = require(`./memberEventModules/leave.js`);
    leaveModule.execute(member, id);
  }

  let leaveCheck = false;

  for (let i = 0; i < bot.announcementModules.length; i++) {
    let type = bot.announcementModules[i].type;
    if (type === "leave" || type === "kicked") {
      leaveCheck = true;
      break;
    }
  }

  if (leaveCheck) {
    botClients[id].on('guildMemberRemove', leave);
  }

  // add guildBanAdd event listener if type "banned"
  // exists in announcementModules
  const banned = (ban) => {
    const bannedModule = require(`./memberEventModules/banned.js`);
    bannedModule.execute(ban, id);
  }

  let bannedCheck = false;

  for (let i = 0; i < bot.announcementModules.length; i++) {
    if (bot.announcementModules[i].type === "banned") {
      bannedCheck = true;
      break;
    }
  }

  if (bannedCheck) {
    botClients[id].on('guildBanAdd', banned);
  }
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

// Return discord channel object
async function returnChannelObject(clientId, channelId) {
  // Fetch guilds with await to gaurantee cache accuracy 
  await botClients[clientId].guilds.fetch();
  const channel = botClients[clientId].channels.cache.get(channelId);
  return channel;
}

// Return all roles from all servers the bot is a member of, 
// with the exception of the universal @everyone role
// Array contains role objects, grouped by server
// role object: {serverId: "19201", serverName: "Server's Name", roleId: "18291", roleName: "Role's Name"}
// Array Group: [
//   {
//     serverName: "Server's Name",
//     serverRoles: [
//       {serverId: "19201", serverName: "Server's Name", roleId: "18291", roleName: "Role's Name"}
//       {serverId: "19201", serverName: "Server's Name", roleId: "10293", roleName: "Another Role's Name"}
//     ]
//   },
// ]
async function returnRoles(id, token) {
  let roleArray = [];

  if (returnStatus(id)) {
    // Fetch guilds with await to gaurantee cache accuracy 
    await botClients[id].guilds.fetch();

    botClients[id].guilds.cache.forEach((guild) => {
      let serverObject = {
        serverName: guild.name,
        serverRoles: [],
      }
      guild.roles.cache.forEach((role) => {
        if (role.name !== "@everyone") {
          serverObject.serverRoles.push({
            serverId: guild.id,
            serverName: guild.name,
            roleId: role.id,
            roleName: role.name,
          });
        }
      });
      roleArray.push(serverObject);
    });
  } else {
    const bot = new Discord.Client({ intents: Discord.Intents.FLAGS.GUILDS });
    try {
      await bot.login(token);
      // Fetch guilds with await to gaurantee cache accuracy 
      await bot.guilds.fetch();
      bot.guilds.cache.forEach((guild) => {
        let serverObject = {
          serverName: guild.name,
          serverRoles: [],
        }
        guild.roles.cache.forEach((role) => {
          if (role.name !== "@everyone") {
            serverObject.serverRoles.push({
              serverId: guild.id,
              serverName: guild.name,
              roleId: role.id,
              roleName: role.name,
            });
          }
        });
        roleArray.push(serverObject);
      });
    }
    catch (err) {
      bot.destroy();
      return console.log(err.name);
    }
    bot.destroy();
  }

  // Sort array first by serverName grouping
  roleArray.sort((a, b) => {
    return a.serverName.toLowerCase().localeCompare(b.serverName.toLowerCase());
  })

  // Sort nested serverRoles array of each grouping by roleName  
  roleArray.map((server) => {
    return {
      serverName: server.serverName,
      serverRoles: server.serverRoles.sort((a, b) => {
        return a.roleName.toLowerCase().localeCompare(b.roleName.toLowerCase());
      })
    }
  });

  return roleArray;
}

// Return an array of objects containing Server Name/ID and Channel Name/ID for
// all servers the bot is currently a member of
async function returnChannels(id, token) {
  const channelArray = [];

  if (returnStatus(id)) {
    // Fetch guilds with await to gaurantee cache accuracy 
    await botClients[id].guilds.fetch();
    botClients[id].guilds.cache.forEach((guild) => {
      guild.channels.cache.map((channel) => {
        if (channel.type === "GUILD_TEXT") {
          channelArray.push({ serverName: guild.name, serverId: guild.id, channelName: channel.name, channelId: channel.id });
        }
      });
    });
  } else {
    const bot = new Discord.Client({ intents: Discord.Intents.FLAGS.GUILDS });
    try {
      await bot.login(token);
      // Fetch guilds with await to gaurantee cache accuracy 
      await bot.guilds.fetch();
      bot.guilds.cache.forEach((guild) => {
        guild.channels.cache.map((channel) => {
          if (channel.type === "GUILD_TEXT") {
            channelArray.push({ serverName: guild.name, serverId: guild.id, channelName: channel.name, channelId: channel.id });
          }
        });
      });
    }
    catch (err) {
      bot.destroy();
      return console.log(err.name);
    }
    bot.destroy();
  }
  return channelArray;
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

function returnClientLatency(botId) {
  if (returnStatus(botId)) {
    return botClients[botId].ws.ping;
  } else {
    return false;
  }
}

exports.botClients = botClients;
exports.initiateBot = initiateBot;
exports.verifyBotWithDiscord = verifyBotWithDiscord;
exports.returnChannelObject = returnChannelObject;
exports.returnChannels = returnChannels;
exports.returnRoles = returnRoles;
exports.returnStatus = returnStatus;
exports.returnBotInfo = returnBotInfo;
exports.returnClientLatency = returnClientLatency;
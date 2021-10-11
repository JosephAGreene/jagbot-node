const { MessageEmbed } = require('discord.js');
const { returnChannelObject } = require("./botClientUtils");

// Determines if botmodule should respond with a basic text message or embeded,
// then returns an executable function will send the proper response
async function buildResponse(message, botModule) {
  if (botModule.responseType === "basic") {
    const basicResponse = await messageParser(message, botModule.response);
    return () => message.channel.send(basicResponse.toString());
  } else if (botModule.responseType === "embed") {
    const embedResponse = await buildEmbedResponse(message, botModule);
    return () => message.channel.send({ embeds: [embedResponse] });
  }
}

// Determines if announcement should respond with a basic text message or embeded,
// then returns an executable function will send the proper response to the desired
// server channel
async function buildAnnouncement(botId, announcement, member) {
  // get channel object, as it's required in order to access the send method
  const channel = await returnChannelObject(botId, announcement.responseChannel.channelId);
  // Recreate a psuedo message object with necessary properties that are normally
  // found on the standard discord.js api message object. This is done because 
  // the guildMemberAdd event listener only provides a member object, which lacks the 
  // necessary methods to both make this module work AND make it integrate with the 
  // already functioning commandUtil functions
  const messageObject = {
    channel: channel,
    guild: channel.guild,
    author: member.user
  }

  if (announcement.responseType === "basic") {
    const basicResponse = await messageParser(messageObject, announcement.response);
    return () => messageObject.channel.send(basicResponse.toString());
  } else if (announcement.responseType === "embed") {
    const embedResponse = await buildEmbedResponse(messageObject, announcement);
    return () => messageObject.channel.send({ embeds: [embedResponse] });
  }
}

// Builds and returns a discord embed object
async function buildEmbedResponse(message, botModule) {
  // Assume embedTitle always exists, as the database validation requires
  const embedResponse = new MessageEmbed().setTitle(botModule.embedTitle);

  if (botModule.embedLinkURL) { embedResponse.setURL(botModule.embedLinkURL); }

  if (botModule.embedColor) { embedResponse.setColor(botModule.embedColor); }

  if (botModule.embedThumbnailURL) { embedResponse.setThumbnail(botModule.embedThumbnailURL); }

  if (botModule.embedMainImageURL) { embedResponse.setImage(botModule.embedMainImageURL); }

  if (botModule.embedDescription) {
    const basicResponse = await messageParser(message, botModule.embedDescription);
    embedResponse.setDescription(basicResponse.toString());
  }

  // Assume field name, value, and inline values always exist, as the database validation requires 
  botModule.embedFields.forEach((field) => {
    embedResponse.addField(field.name, field.value, field.inline);
  });

  if (botModule.embedFooter) {
    if (botModule.embedFooterThumbnailURL) {
      embedResponse.setFooter(botModule.embedFooter, botModule.embedFooterThumbnailURL);
    } else {
      embedResponse.setFooter(botModule.embedFooter);
    }
  }

  return embedResponse;
}

// Returns the name actually displayed in the server for the user
async function getAuthorDisplayName(msg) {
  // In the event that the user is no longer a member of the channel
  // an error will be thrown when attempting to determine their server display name. 
  // This is gauranteed to happen for modules such as the leave or banned announcement. 
  // The choice is to fail gracefully and revert to sending the username in it's place
  try {
    const member = await msg.guild.members.fetch(msg.author);
    return member.nickname ? member.nickname : msg.author.username;
  } catch (err) {
    return msg.author.username;
  }

}

async function messageParser(message, botModuleResponse) {
  let parsedMessage = botModuleResponse;

  parsedMessage = parsedMessage
    .replace(/{user}/g, message.author.username)
    .replace(/{user_display}/g, await getAuthorDisplayName(message))
    .replace(/{channel}/g, message.channel.name);

  return parsedMessage;
}

// Returns true if message was authored by a user that is 
// assigned a role that's also included in the rolesArray array
function roleMatch(message, rolesArray) {
  for (let i = 0; i < rolesArray.length; i++) {
    const guildCheck = (message.guild.id === rolesArray[i].serverId);
    const roleCheck = message.member.roles.cache.find(r => r.id === rolesArray[i].roleId);

    if (guildCheck && roleCheck) {
      return true;
    }
  }
  return false;
}

function getMentionId(mention) {
	if (!mention) return;

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return mention;
	}
}

exports.buildResponse = buildResponse;
exports.buildAnnouncement = buildAnnouncement;
exports.messageParser = messageParser;
exports.roleMatch = roleMatch;
exports.getMentionId = getMentionId;
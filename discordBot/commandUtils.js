const { MessageEmbed } = require('discord.js');

// Determines if botmodule should response with a basic text message or embeded,
// then returns an executable function will send the proper response
async function buildResponse (message, botModule) {
  if(botModule.responseType === "basic") {
    const basicResponse = await messageParser(message, botModule.response);
    return () => message.channel.send(basicResponse.toString());
  } else if (botModule.responseType === "embed") {
    const embedResponse = await buildEmbedResponse(message, botModule);
    return () => message.channel.send({embeds: [embedResponse]});
  }
}

// Builds and returns a discord embed object
async function buildEmbedResponse (message, botModule) {
  // Assume embedTitle always exists, as the database validation requires
  const embedResponse = new MessageEmbed().setTitle(botModule.embedTitle);

  if(botModule.embedLinkURL) { embedResponse.setURL(botModule.embedLinkURL); }

  if(botModule.embedColor) { embedResponse.setColor(botModule.embedColor); } 

  if(botModule.embedThumbnailURL) { embedResponse.setThumbnail(botModule.embedThumbnailURL); }

  if(botModule.embedMainImageURL) { embedResponse.setImage(botModule.embedMainImageURL); }

  if(botModule.embedDescription) {
    const basicResponse = await messageParser(message, botModule.embedDescription);
    embedResponse.setDescription(basicResponse.toString());
  }

  // Assume field name, value, and inline values always exist, as the database validation requires 
  botModule.embedFields.forEach((field) => {
    embedResponse.addField(field.name, field.value, field.inline);
  });

  if(botModule.embedFooter) {
    if(botModule.embedFooterThumbnailURL) {
      embedResponse.setFooter(botModule.embedFooter, botModule.embedFooterThumbnailURL); 
    } else {
      embedResponse.setFooter(botModule.embedFooter); 
    }
  }

  return embedResponse;
}

// Returns the name actually displayed in the server for the user
async function getAuthorDisplayName (msg) {
  const member = await msg.guild.members.fetch(msg.author);
  return member.nickname ? member.nickname : msg.author.username;
}

async function messageParser (message, botModuleResponse) {
  let parsedMessage = botModuleResponse;

  parsedMessage = parsedMessage
                    .replace(/{user}/g, message.author.username)
                    .replace(/{user_display}/g, await getAuthorDisplayName(message))
                    .replace(/{channel}/g, message.channel.name);

  return parsedMessage;
}

// Returns true if message was authored by a user that is 
// assigned a role that's also included in the rolesArray array
async function roleMatch (message, rolesArray) {
  for (let i=0; i < rolesArray.length; i++) {
    if (message.member.roles.cache.find(r => r.name.toLowerCase() === rolesArray[i])) {
      return true;
    }
  }
  return false;
}

exports.buildResponse = buildResponse;
exports.messageParser = messageParser;
exports.roleMatch = roleMatch;
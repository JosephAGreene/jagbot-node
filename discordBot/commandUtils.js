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

exports.messageParser = messageParser;
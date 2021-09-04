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

exports.messageParser = messageParser;
exports.roleMatch = roleMatch;
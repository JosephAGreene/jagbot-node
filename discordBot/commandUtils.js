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
  const userRoles = await message.member._roles;

  for (let i=0; i < rolesArray.length; i++) {
    if (userRoles.includes(rolesArray[i])) {
      return true;
    }
  }

  return false;
}

exports.messageParser = messageParser;
exports.roleMatch = roleMatch;
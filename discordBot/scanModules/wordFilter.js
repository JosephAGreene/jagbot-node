module.exports = {
  type: 'word-filter',
  execute(message, botModule) {
    const triggerWords = botModule.triggerWords;
    let triggerFound = false;
    let scanCheck = false;

    // We have to sanitize messages of discord text decoration
    let sanitizedMessage = message.content.replaceAll("_", '');
    sanitizedMessage = sanitizedMessage.replaceAll("*", '');

    // Determine if trigger word was sent
    for (let i = 0; i < triggerWords.length; i++) {
      let regex = new RegExp(`\\b${triggerWords[i]}\\b`, 'i');
      if (regex.test(sanitizedMessage)) {
        triggerFound = true;
        break;
      }
    }

    // If trigger word is found, then filter the message.
    if (triggerFound) {
      let responseMessage = '';

      if (botModule.deleteUserMessage) {
        message.delete();
        scanCheck = true;
      }
      if (botModule.warnUser) {
        responseMessage = `Hey ${message.author}! ${botModule.warningResponse}`;
      }
      if (botModule.editUserMessage) {
        let editedMessage = sanitizedMessage;
        let filteredWords = 0;

        for (let i = 0; i < triggerWords.length; i++) {
          let filterMask = triggerWords[i];
          let regEx = new RegExp(filterMask, 'ig');

          filteredWords += (editedMessage.match(regEx) ? editedMessage.match(regEx).length : 0);
          if (filteredWords > 5) {
            break;
          }

          editedMessage = editedMessage.replace(regEx, '[redacted]');
        }

        if (filteredWords > 5) {
          responseMessage = `Hey ${message.author}! ${botModule.spamResponse}`;
        } else {
          responseMessage = `${responseMessage} \n\n ${message.author.username} said: "${editedMessage}"`;
        }
      }

      if (responseMessage) {
        scanCheck = true;
        message.channel.send(`${responseMessage}`);
      }
    }

    return scanCheck;
  },
};
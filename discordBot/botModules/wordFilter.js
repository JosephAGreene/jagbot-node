function wordFilter (selectedModule, message) {
    const triggerWords = selectedModule.triggerWords;
    let triggerFound = false;
    let response = false;

    // We have to sanitize messages of discord text decoration
    let sanitizedMessage = message.content.replaceAll("_", '');
    sanitizedMessage = sanitizedMessage.replaceAll("*", '');

    // Determine if trigger word was sent
    for (let i = 0; i < triggerWords.length; i++) {
        let regex = new RegExp(`\\b${triggerWords[i]}\\b`, 'i');
        if(regex.test(sanitizedMessage)) {
            triggerFound = true;
            break;
        }
    }

    // If trigger word is found, then filter the message.
    if (triggerFound) {
        let responseMessage = '';

        response = () => {
            if (selectedModule.deleteUserMessage) {
                message.delete();
            }
            if (selectedModule.warnUser) {
                responseMessage = `Hey ${message.author}! ${selectedModule.warningResponse}`;
            }
            if (selectedModule.editUserMessage) {
                let editedMessage = sanitizedMessage;
                console.log(editedMessage);
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
                    responseMessage = `Hey ${message.author}! ${selectedModule.spamResponse}`;
                } else {
                    responseMessage = `${responseMessage} \n\n ${message.author.username} said: "${editedMessage}"`;
                }
            }
            
            if (responseMessage) {
                message.channel.send(`${responseMessage}`);
            }
        }
    }

    return response;
}

//test change
exports.wordFilter = wordFilter;
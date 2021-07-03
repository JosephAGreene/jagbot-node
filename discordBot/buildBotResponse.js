const {singleResponse} = require("./botModules/singleResponse");
const {collectionResponse} = require("./botModules/collectionResponse");
const {randomResponse} = require("./botModules/randomResponse");
const {wordFilter} = require("./botModules/wordFilter");
const {inviteFilter} = require("./botModules/inviteFilter");

function returnResponse (bot, message) {

    let response = false;

    // If incoming message originated from a DM or a bot,
    // then return false (response) to avoid any response;
    if (message.channel.type == "dm" || message.author.bot) {
        return response;
    }

    // Determine if bot has scanModules
    // scanModules are ran in the order of the User's settings
    // If a scanModule returns a response other than false, then that response is executed
    // and all other modules (scan, command, or otherwise) are ignored. 
    if (bot.scanModules.length > 0) {
        for (let i = 0; i < bot.scanModules.length; i++) {
            switch (bot.scanModules[i].moduleType) {
                case "invite-filter":
                    response = inviteFilter(bot.scanModules[i], message);
                    break;
                case "word-filter":
                    response = wordFilter(bot.scanModules[i], message);
            }

            if (response) {
                break;
            }
        }  
    }

    // If a scanModule returned a response, then skip checking for any command modules
    // and immediately send the scanModule response. 
    if (response) {
        return response;
    }
    
    let selectedModule = null;

    // If incoming prefix doesn't match bot's dedicated prefix, return false.
    if (bot.prefix !== message.content.slice(0, 1)) {
        return response;
    }

    // Determine command given
    const givenCommand = message.content.split(" ")[0].substring(1);

    //Determine if given command has a correlated module
    for (let i = 0; i < bot.commandModules.length; i++) {
        if (bot.commandModules[i].command === givenCommand) {
            selectedModule = bot.commandModules[i];
            break;
        }
    }

    // If no module is selected, then give up early by returning response (which should be false)
    if (!selectedModule) return response;

    // Determine which module to execute 
    switch (selectedModule.moduleType) {
        case "single-response":
            const single = singleResponse(selectedModule);
            if (single) {
                response = () => message.channel.send(single);
            }
            break;
        case "collection-response":
            const collection = collectionResponse(selectedModule, message.content);
            if (collection) {
                response = () => message.channel.send(collection);
            }
            break;
        case "random-response": 
            const random = randomResponse(selectedModule, message.content);
            if (random) {
                response = () => message.channel.send(random);
            }
    }

    return response;
}

module.exports = returnResponse;
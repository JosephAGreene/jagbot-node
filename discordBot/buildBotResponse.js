const {customSingle} = require("./botModules/customSingle");
const {customCollection} = require("./botModules/customCollection");
const {customRandom} = require("./botModules/customRandom");
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
    // scanModules are currently in testing. Not to be used in production.
    if (bot.scanModules.length > 0) {
        //response = inviteFilter(bot.scanModules[1], message);
        if (!response) {
            response = wordFilter(bot.scanModules[1], message);
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
        case "custom-single":
            const singleResponse = customSingle(selectedModule);
            if (singleResponse) {
                response = () => message.channel.send(singleResponse);
            }
            break;
        case "custom-collection":
            const collectionResponse = customCollection(selectedModule, message.content);
            if (collectionResponse) {
                response = () => message.channel.send(collectionResponse);
            }
            break;
        case "custom-random": 
            const randomResponse = customRandom(selectedModule, message.content);
            if (randomResponse) {
                response = () => message.channel.send(randomResponse);
            }
    }

    return response;
}

module.exports = returnResponse;
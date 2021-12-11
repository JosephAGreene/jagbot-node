const { MessageEmbed } = require('discord.js');
const { Bot } = require("../../models/bot");
const { roleMatch } = require("../commandUtils");

module.exports = {
  type: 'help',
  async execute(message, botId, moduleId) {
    // Find Bot
    const bot = await Bot.findById(botId);
    if (!bot) return;
    // Find Module
    const module = bot.moderationModules.find((module) => String(module._id) === String(moduleId));
    if (!module || !module.enabled) return;

    // If allowedRoles contains, then check to make sure the request
    // was made by a user with one of those roles
    if (module.allowedRoles.length > 0) {
      const roleMatched = roleMatch(message, module.allowedRoles);
      if (!roleMatched) {
        try {
          message.reply("You don't possess an authorized role to use this command.");
          return;
        } catch (err) {
          return;
        }
      }
    }

    const embedResponse = new MessageEmbed().setColor(module.embedColor);

    // Get optional argument supplied
    const optionalArg = message.content.split(' ')[1];


    if (optionalArg) {
      // Check to see if optionalArg is an existing command
      const moderationCommand = bot.moderationModules.find((module) => module.enabled && (String(module.command) === String(optionalArg)));
      const generalCommand = bot.customModules.find((module) => module.command.toLowerCase() === optionalArg.toLowerCase());

      // If a supplied optional argument matching a general command module, 
      // then reply with specific information on that command module
      if (generalCommand) {
        embedResponse.setTitle(`${bot.prefix}${optionalArg} help`);

        if (generalCommand.type === "optioned-response") {
          embedResponse.setDescription(`
            ${generalCommand.description} \n
            You must specify an option from the available options list.
            ${"`"}${bot.prefix}${optionalArg} [name of option]${"`"}
            **Do not type [ ] in the command itself!**\n\u200b`
          );

          // Build sorted array of comman option keywords
          let commandOptions = [];
          generalCommand.options.forEach((option) => {
            commandOptions.push(option.keyword.toLowerCase());
          });
          commandOptions.sort((a, b) => {
            return a.localeCompare(b);
          });

          // Append command options as field values, broken up in groups
          // of 20.
          for (let i = 0; i < commandOptions.length; i++) {
            let commandOptionsSection = commandOptions.slice(i, i + 20);
            let optionsSectionString = '';
            commandOptionsSection.forEach((option) => {
              optionsSectionString += "`" + option + "` ";
            });

            if (i === 0) {
              embedResponse.addField("Available Options:", optionsSectionString);
            } else {
              embedResponse.addField("\u200b", optionsSectionString);
            }

            i += 19;
          }

          try {
            message.channel.send({ embeds: [embedResponse] });
          } catch (err) {
            console.log(err.message);
          }

          return;
        }

        embedResponse.setDescription(generalCommand.description);

        try {
          message.channel.send({ embeds: [embedResponse] });
        } catch (err) {
          console.log(err.message);
        }

        return;
      }

      if (moderationCommand) {
        embedResponse.setTitle(`${bot.prefix}${optionalArg} help`);
        embedResponse.setDescription(moderationCommand.description.replace(/\\n/g, '\n').replace(/{command}/g, `${bot.prefix}${optionalArg}`));

        try {
          message.channel.send({ embeds: [embedResponse] });
        } catch (err) {
          console.log(err.message);
        }

        return;
      }

      // Reaching this position means the supplied option argument does not exist
      try {
        message.channel.send(`Cannot find a command: "${optionalArg}".`);
      } catch (err) {
        console.log(err.message);
      }

      return;
    }

    embedResponse.setTitle(`${bot.name} help`);
    const helpCommand = bot.moderationModules.find((module) => module.type === "help").command;
    embedResponse.setDescription(`You can use ${"`"}${bot.prefix}${helpCommand} [name of command]${"`"} to learn more about a command. \n**Do not type [ ] in the command itself!**\n\u200b`);

    // Build sorted array of custom command trigger words
    let customCommands = [];
    bot.customModules.forEach((module) => {
      customCommands.push(module.command.toLowerCase());
    });
    customCommands.sort((a, b) => {
      return a.localeCompare(b);
    });

    // Append custom commands as field values, broken up in groups
    // of 20.
    for (let i = 0; i < customCommands.length; i++) {
      let customCommandsSection = customCommands.slice(i, i + 20);
      let commandSectionString = '';
      customCommandsSection.forEach((command) => {
        commandSectionString += "`" + command + "` ";
      });

      if (i === 0) {
        embedResponse.addField("General Commands", commandSectionString);
      } else {
        embedResponse.addField("\u200b", commandSectionString);
      }

      i += 19;
    }

    let moderationCommands = [];
    let moderationCommandsString = '';
    // Build sorted array of moderation commands, excluding type "help"
    bot.moderationModules.forEach((module) => {
      if (module.enabled && module.type !== "help") {
        moderationCommands.push(module.command.toLowerCase());
      }
    });
    moderationCommands.sort((a, b) => {
      return a.localeCompare(b);
    });
    // Build string of moderation commands
    moderationCommands.forEach((command) => {
      moderationCommandsString += "`" + command + "` ";
    });
    // Append embed field with moderation commands
    embedResponse.addField("Moderation Commands:", moderationCommandsString);

    try {
      message.channel.send({ embeds: [embedResponse] });
    } catch (err) {
      console.log(err.message);
    }

    return;
  },
};
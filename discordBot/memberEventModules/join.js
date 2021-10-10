const {Bot} = require("../../models/bot");
const {buildAnnouncement} = require("../commandUtils");

module.exports = {
	type: 'join',
	async execute(member, botId) {
    const bot = await Bot.findById(botId);
    const memberServer = member.guild.id;
    
    // If enabled auto-role module exists, push role id's into roles array
    let roles = [];
    const autoRoleModule = bot.autoModModules.find((module) => (module.type === "auto-role" && module.enabled));
    if(autoRoleModule) {
      autoRoleModule.roles.forEach((role) => {
        if(role.serverId === memberServer) {
          roles.push(role.roleId);
        }
      });
    }
    // If roles array isn't empty, add the roles it contains to the new member
    if(roles.length) {
      try {
        await member.roles.add(roles);
      } catch (err) {
        console.log(err.message);
      }
    }

    // Find announcement that matches serverId from member and type "join"
    const announcement = bot.announcementModules.find((announcement) => {
      return (announcement.type === "join" && announcement.responseChannel.serverId === memberServer);
    });

    // If no announcement exists, do nothing and return
    if (!announcement) return;

    try {
      const response = await buildAnnouncement(botId, announcement, member);
      await response();
    } catch (err) {
      console.log(err.message);
    }

	},
};
const {Bot} = require("../../models/bot");
const {buildAnnouncement} = require("../commandUtils");

module.exports = {
	type: 'join',
	async execute(member, botId) {
    const bot = await Bot.findById(botId);
    const memberServer = member.guild.id;

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
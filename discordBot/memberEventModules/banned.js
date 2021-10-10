const {Bot} = require("../../models/bot");
const {buildAnnouncement} = require("../commandUtils");

module.exports = {
	type: 'banned',
	async execute(member, botId) {
    const bot = await Bot.findById(botId);
    const memberServer = member.guild.id;

    // Find announcement that matches serverId from member and type "banned"
    const announcement = bot.announcementModules.find((announcement) => {
      return (announcement.type === "banned" && announcement.responseChannel.serverId === memberServer);
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
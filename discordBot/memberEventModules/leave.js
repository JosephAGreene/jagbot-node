const { Bot } = require("../../models/bot");
const { buildAnnouncement } = require("../commandUtils");

module.exports = {
  type: 'leave',
  async execute(member, botId) {
    const bot = await Bot.findById(botId);
    const memberServer = member.guild.id;

    const fetchedLogs = await member.guild.fetchAuditLogs({ limit: 1, });
    const lastLog = fetchedLogs.entries.first();

    // The last log exists and it targeted the member that left
    if (lastLog && lastLog.target.id === member.id) {
      // If log suggests the member was banned, then exit this module
      // as the banned module will do the rest. Banned events are handled
      // separately because they provide a "ban" object, rather than 
      // "member" object that leave/kicked provides.
      if (lastLog.action === "MEMBER_BAN_ADD") {
        return;
      }
      // If log suggests the member was kicked, then check for a kick announcement
      // and execute it if found. Return.
      if (lastLog.action === "MEMBER_KICK") {
        const kickAnnouncement = bot.announcementModules.find((announcement) => {
          return (announcement.type === "kicked" && announcement.responseChannel.serverId === memberServer);
        });

        // If no announcement exists, do nothing and return
        if (!kickAnnouncement) return;

        try {
          const response = await buildAnnouncement(botId, kickAnnouncement, member);
          await response();
        } catch (err) {
          console.log(err.message);
        }

        return;
      }
    }

    // Find announcement that matches serverId from member and type "leave"
    const leaveAnnouncement = bot.announcementModules.find((announcement) => {
      return (announcement.type === "leave" && announcement.responseChannel.serverId === memberServer);
    });

    // If no announcement exists, do nothing and return
    if (!leaveAnnouncement) return;

    try {
      const response = await buildAnnouncement(botId, leaveAnnouncement, member);
      await response();
    } catch (err) {
      console.log(err.message);
    }
  },
};
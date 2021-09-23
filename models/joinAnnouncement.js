const mongoose = require('mongoose');

/* 
    Join Announcement is an announcement module that provokes
    a response when a new member joins the server. 
*/

const joinAnnouncementSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "join-announcement",
  },
  response: {
    type: String,
    trim: true
  },
  responseServer: {
    type: String,
    trim: true,
    required: true,
  },
  responseChannel: {
    type: String,
    trim: true,
    required: true,
  }
});

const JoinAnnoucement = mongoose.model('JoinAnnouncement', joinAnnouncementSchema);
exports.JoinAnnouncement = JoinAnnoucement;
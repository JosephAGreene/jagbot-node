const mongoose = require('mongoose');

/* 
    Announcements are responses that are invoked whenever a user 
    joins, leaves, gets kicked, or gets banned from the server
*/

const announcementSchema = new mongoose.Schema({
  type: {
    type: String, // Allow only Join, Leave, Kick, Ban
    trim: true,
    required: true,
  },
  responseChannel: {
    serverId: {
      type: String,
      trim: true,
    },
    serverName: {
      type: String, 
      trim: true,
    },
    channelId: {
      type: String,
      trim: true,
    },
    channelName: {
      type: String,
      trim: true,
    }
  },
  responseType: {
    type: String,
    trim: true,
    default: "basic"
  },
  response: {
    type: String,
    trim: true,
    default: ""
  },
  embedTitle: {
    type: String,
    trim: true,
  },
  embedLinkURL: {
    type: String,
    trim: true,
    default: "",
  },
  embedColor: {
    type: String,
    trim: true,
  },
  embedThumbnailURL: {
    type: String,
    trim: true,
  },
  embedMainImageURL: {
    type: String,
    trim: true,
  },
  embedDescription: {
    type: String,
    trim: true,
    default: "",
  },
  embedFields: [
    {
      _id: false,
      name: {
        type: String,
        trim: true,
      },
      value: {
        type: String,
        trim: true,
      },
      inline: {
        type: Boolean,
        default: false,
      }
    }
  ],
  embedFooter: {
    type: String,
    trim: true,
  },
  embedFooterThumbnailURL: {
    type: String,
    trim: true,
  }
});

const Annoucement = mongoose.model('Announcement', announcementSchema);
exports.Announcement = Annoucement;
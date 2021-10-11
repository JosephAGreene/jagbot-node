const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectID,
    required: true,
  },
  botToken: {
    type: String,
    trim: true,
    required: true,
  },
  botId: {
    type: String,
    trim: true,
    required: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  avatarURL: {
    type: String,
    trim: true,
  },
  prefix: {
    type: String,
    trim: true,
    required: true,
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  serverRoles: [
    {
      _id: false,
      serverName: {
        type: String,
        trim: true,
        required: true,
      },
      serverRoles: [
        {
          _id: false,
          serverId: {
            type: String,
            trim: true,
            required: true,
          },
          serverName: {
            type: String,
            trim: true,
            required: true,
          },
          roleId: {
            type: String,
            trim: true,
            required: true,
          },
          roleName: {
            type: String,
            trim: true,
            required: true,
          },
        }
      ]
    }
  ],
  serverChannels: [], // Array of objects representing servers and channels
  moderationModules: [],
  autoModModules: [], 
  commandModules: [], // Command Modules require a command to induce execution
  announcementModules: [], // Announcement Modules execute on join/leave/ban event listeners

});

const Bot = mongoose.model('Bot', botSchema);

exports.Bot = Bot;
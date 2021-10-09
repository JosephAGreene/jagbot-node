const mongoose = require('mongoose');

/* 
    Invite Filter is a scan module that provokes a response when
    a discord invite link is posted in the server. 
*/

const inviteFilterSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "invite-filter",
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  ignoredRoles: [
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
  ],
  delete: {
    type: Boolean,
    default: false,
  },
  warn: {
    type: Boolean,
    default: false,
  },
  response: {
    type: String,
    trim: true
  },
  responseLocation: {
    type: String,
    trim: true,
    default: "server"
  }
});

const InviteFilter = mongoose.model('InviteFilter', inviteFilterSchema);
exports.InviteFilter = InviteFilter;
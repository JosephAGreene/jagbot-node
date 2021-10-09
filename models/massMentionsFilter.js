const mongoose = require('mongoose');

/* 
    Mass Mentions Filter is a scan module that provokes a response when
    a message is sent that contains more than the allowed number of 
    mentions.
*/

const massMentionsFilterSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "massmentions-filter",
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
  limit: {
    type: Number,
    default: 5,
  },
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

const MassMentionsFilter = mongoose.model('MassMentionsFilter', massMentionsFilterSchema);
exports.MassMentionsFilter = MassMentionsFilter;
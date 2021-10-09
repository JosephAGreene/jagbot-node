const mongoose = require('mongoose');

/* 
    Mass Caps Filter is a scan module that provokes a response when
    a message is sent that contains more than the allowed percentage
    of capitalized characters.
*/

const massCapsFilterSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "masscaps-filter",
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

const MassCapsFilter = mongoose.model('MassCapsFilter', massCapsFilterSchema);
exports.MassCapsFilter = MassCapsFilter;
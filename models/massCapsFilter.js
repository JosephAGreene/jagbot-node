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
      type: String,
      trim: true,
    },
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
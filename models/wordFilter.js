const mongoose = require('mongoose');

/*
    Word Filter is a scan module that will response when a word 
    is sent that is also detected in the triggerWords array.
*/

const wordFilterSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "word-filter",
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
  triggerWords: [
    {
      type: String,
      trim: true,
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

const WordFilter = mongoose.model('WordFilter', wordFilterSchema);
exports.WordFilter = WordFilter;
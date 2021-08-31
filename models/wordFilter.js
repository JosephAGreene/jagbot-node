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
      type: String,
      trim: true,
    },
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
  response: {
    type: String,
    trim: true
  }, 
  location: {
    type: String,
    trim: true,
    default: "server"
  }
});

const WordFilter = mongoose.model('WordFilter', wordFilterSchema);
exports.WordFilter = WordFilter;
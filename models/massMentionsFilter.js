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
  limit: {
    type: Number,
    default: 5,
  },
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

const MassMentionsFilter = mongoose.model('MassMentionsFilter', massMentionsFilterSchema);
exports.MassMentionsFilter = MassMentionsFilter;
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
  delete: {
    type: Boolean,
    default: false,
  },
  response: {
    type: String,
    trim: true
  }
});

const InviteFilter = mongoose.model('InviteFilter', inviteFilterSchema);
exports.InviteFilter = InviteFilter;
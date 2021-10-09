const mongoose = require('mongoose');

/* 
    Auto Role is a join module that is provoked 
    by a new member add event. There is no clearly logical 
    categorization for this module, as it dances on the line of
    an announcement module in implementation, but an auto moderation module
    in function. It will be stored alongside the auto moderation
    modules, and singled out manually during bot initiation. 
*/

const autoRoleSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "auto-role",
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  roles: [
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
});

const AutoRole = mongoose.model('AutoRole', autoRoleSchema);
exports.AutoRole = AutoRole;
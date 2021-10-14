const mongoose = require('mongoose');

const rolesSchemaObject = {
  allowedRoles: [
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
}

const banModerationSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "ban",
  },
  enabled: {
    type: Boolean,
    required: true,
    default: false,
  },
  command: {
    type: String,
    trim: true,
    required: true,
    default: "ban"
  },
  description: {
    type: String,
    trim: true,
    default: "Bans a user from the server, deletes their messages from the last 7 days, and sends the user a ban notice."
      + "\n\nYou must mention a user to ban. You may provide an optional reason."
      + "\n`{command} [@usertoban] [optional reason]` \n**Do not type [ ] in the command itself!**"
  },
  ...rolesSchemaObject,
});

const softBanModerationSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "soft-ban",
  },
  enabled: {
    type: Boolean,
    required: true,
    default: false,
  },
  command: {
    type: String,
    trim: true,
    required: true,
    default: "softban"
  },
  description: {
    type: String,
    trim: true,
    default: "Kicks user from the server, deletes their messages from the last 7 days, and sends the user a soft ban notice."
      + "\n\nYou must mention a user to soft ban. You may provide an optional reason."
      + "\n`{command} [@usertosoftban] [optional reason]` \n**Do not type [ ] in the command itself!**"
  },
  ...rolesSchemaObject,
});

const kickModerationSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "kick",
  },
  enabled: {
    type: Boolean,
    required: true,
    default: false,
  },
  command: {
    type: String,
    trim: true,
    required: true,
    default: "kick"
  },
  description: {
    type: String,
    trim: true,
    default: "Kicks a user from the server"
      + "\n\nYou must mention a user to kick. You may provide an optional reason."
      + "\n`{command} [@usertokick] [optional reason]` \n**Do not type [ ] in the command itself!**"
  },
  ...rolesSchemaObject,
});

const purgeModerationSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "purge",
  },
  enabled: {
    type: Boolean,
    required: true,
    default: false,
  },
  command: {
    type: String,
    trim: true,
    required: true,
    default: "purge"
  },
  description: {
    type: String,
    trim: true,
    default: "Bulk deletes up to 100 messages at a time in a single channel."
      + "\n\nYou must specify an amount to purge between 2 and 100."
      + "\n`{command} [number to purge]` \n**Do not type [ ] in the command itself!**"
  },
  ...rolesSchemaObject,
});

const pingModerationSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "ping",
  },
  enabled: {
    type: Boolean,
    required: true,
    default: true,
  },
  command: {
    type: String,
    trim: true,
    required: true,
    default: "ping"
  },
  description: {
    type: String,
    trim: true,
    default: "Returns latency values for bot and Discord API."
  },
  ...rolesSchemaObject,
});

const helpModerationSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "help",
  },
  enabled: {
    type: Boolean,
    required: true,
    default: true,
  },
  command: {
    type: String,
    trim: true,
    required: true,
    default: "help"
  },
  embedColor: {
    type: String,
    trim: true,
    default: "#FFFFFF",
  },
  ...rolesSchemaObject,
});

const BanModeration = mongoose.model('BanModeration', banModerationSchema);
const SoftBanModeration = mongoose.model('SoftBanModeration', softBanModerationSchema);
const KickModeration = mongoose.model('KickModeration', kickModerationSchema);
const PurgeModeration = mongoose.model('PurgeModeration', purgeModerationSchema);
const PingModeration = mongoose.model('PingModeration', pingModerationSchema);
const HelpModeration = mongoose.model("HelpModeration", helpModerationSchema);

exports.BanModeration = BanModeration;
exports.SoftBanModeration = SoftBanModeration;
exports.KickModeration = KickModeration;
exports.PurgeModeration = PurgeModeration;
exports.PingModeration = PingModeration;
exports.HelpModeration = HelpModeration;
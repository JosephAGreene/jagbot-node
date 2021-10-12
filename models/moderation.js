const mongoose = require('mongoose');

const baseModerationSchemaObject = {
  enabled: {
    type: Boolean,
    required: true,
    default: false,
  },
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
  command: {
    type: String,
    trim: true,
    required: true,
    default: "ban"
  },
  description: {
    type: String,
    trim: true,
    default: "Bans a user from the server."
  },
  ...baseModerationSchemaObject,
});

const kickModerationSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "kick",
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
    default: "Kicks a user from the server."
  },
  ...baseModerationSchemaObject,
});

const purgeModerationSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "purge",
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
  },
  ...baseModerationSchemaObject,
});

const BanModeration = mongoose.model('BanModeration', banModerationSchema);
const KickModeration = mongoose.model('KickModeration', kickModerationSchema);
const PurgeModeration = mongoose.model('PurgeModeration', purgeModerationSchema);

exports.BanModeration = BanModeration;
exports.KickModeration = KickModeration;
exports.PurgeModeration = PurgeModeration;
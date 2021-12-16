const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  discordId: {
    type: String,
    required: true,
    unique: true,
  },
  discordTag: {
    type: String,
    required: true,
  },
  avatarURL: {
    type: String,
  },
  warningAcknowledged: {
    type: Boolean,
    default: false,
  },
  bots: [{
    type: mongoose.Schema.Types.ObjectID,
    ref: 'Bot'
  }],
});

const User = mongoose.model("User", userSchema);

exports.User = User;
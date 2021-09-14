const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectID,
    required: true,
  },
  botToken: {
      type: String,
      trim: true,
      required: true,
  },
  botId: {
      type: String,
      trim: true,
      required: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  avatarURL: {
    type: String,
    trim: true,
  },
  prefix: {
      type: String,
      trim: true,
      required: true,
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  serverRoles: [
    {
      type: String,
      trim: true
    }
  ],
  scanModules: [], // Scan Modules are modules that scan and execute on incoming messages if conditions are met. 
  commandModules: [], // Command Modules require a command to induce execution
});
  
const Bot = mongoose.model('Bot', botSchema);

exports.Bot = Bot;
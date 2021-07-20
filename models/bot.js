const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
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
    status: {
      type: Boolean,
      default: true,
    },
    scanModules: [], // Scan Modules are modules that scan and execute on incoming messages if conditions are met. 
    commandModules: [], // Command Modules require a command to induce execution
});
  
const Bot = mongoose.model('Bot', botSchema);

exports.Bot = Bot;
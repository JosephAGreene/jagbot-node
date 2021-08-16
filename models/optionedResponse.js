const mongoose = require('mongoose');

/* 
    Optioned Response is a cammand module that contains an array of potential responses.
    Command + Option = Response

    An example use case for this module would be a dictionary feature.
    Ex: !define javascript 
    Bot Repsonse: "The propriety name of a high-level, object-oriented scripting language used especially
    to create interactive applications running over the internet"
*/

const optionedResponseSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "optioned-response",
  },
  command: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    trime: true,
    required: true,
  },
  options: [
    {
      _id: {
        type: String,
        required: true,
      },
      keyword: {
        type: String,
        lowercase: true,
        trim: true,
        required: true,
      },
      response: {
        type: String,
        trim: true,
        required: true,
      }
    }
  ],
});

const OptionedResponse = mongoose.model('OptionedResponse', optionedResponseSchema);
exports.OptionedResponse = OptionedResponse;
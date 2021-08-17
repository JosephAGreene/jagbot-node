const mongoose = require('mongoose');

/*
    Random Response is a command module that randomly chooses a response
    from an array of potential responses. 

    An example use case for this module would be a Magic 8ball feature.
    Ex: !8ball Will I win the lottery today?
    Bot Response: "Outlook not so good."       :(
*/

const randomResponseSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "random-response",
  },
  command: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    trim: true,
    required: true,
  },
  responseLocation: {
    type: String,
    trim: true,
    default: "server",
  },
  responses: [
    {
      _id: {
        type: String,
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

const RandomResponse = mongoose.model('RandomResponse', randomResponseSchema);
exports.RandomResponse = RandomResponse;
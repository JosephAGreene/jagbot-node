const mongoose = require('mongoose');

/*
    Random Response is a command module that randomly chooses a response
    from an array of potential responses. 

    An example use case for this module would be a Magic 8ball feature.
    Ex: !8ball Will I win the lottery today?
    Bot Response: "Outlook not so good."       :(
*/

const responseSchemaObject = {
  responseType: {
    type: String,
    trim: true,
    default: "basic"
  },
  response: {
    type: String,
    trim: true,
    default: ""
  },
  embedTitle: {
    type: String,
    trim: true,
  },
  embedLinkURL: {
    type: String,
    trim: true,
    default: "",
  },
  embedColor: {
    type: String,
    trim: true,
  },
  embedThumbnailURL: {
    type: String,
    trim: true,
  },
  embedMainImageURL: {
    type: String,
    trim: true,
  },
  embedDescription: {
    type: String,
    trim: true,
    default: "",
  },
  embedFields: [
    {
      _id: false,
      name: {
        type: String,
        trim: true,
      },
      value: {
        type: String,
        trim: true,
      },
      inline: {
        type: Boolean,
        default: false,
      }
    }
  ],
  embedFooter: {
    type: String,
    trim: true,
  },
  embedFooterThumbnailURL: {
    type: String,
    trim: true,
  }
}

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
      ...responseSchemaObject,
    }
  ],
});

const RandomResponse = mongoose.model('RandomResponse', randomResponseSchema);

exports.RandomResponse = RandomResponse;
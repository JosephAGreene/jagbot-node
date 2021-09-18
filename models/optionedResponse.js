const mongoose = require('mongoose');

/* 
    Optioned Response is a cammand module that contains an array of potential responses.
    Command + Option = Response

    An example use case for this module would be a dictionary feature.
    Ex: !define javascript 
    Bot Repsonse: "The propriety name of a high-level, object-oriented scripting language used especially
    to create interactive applications running over the internet"
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
    trim: true,
    required: true,
  },
  responseLocation: {
    type: String,
    trim: true,
    default: "server",
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
      ...responseSchemaObject,
    }
  ],
});

const OptionedResponse = mongoose.model('OptionedResponse', optionedResponseSchema);

exports.OptionedResponse = OptionedResponse;
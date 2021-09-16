const mongoose = require('mongoose');

/* 
    Single Response is a command module that has just a single response.

    An example use case for ths module would be server rules command.
    E.X. !ServerRules
    Bot Response: 
    1) No Spam
    2) No Invite Links
    3) etc, etc, etc
*/

const responseSchemaObject = {
  responseLocation: {
    type: String,
    trim: true,
    default: "server",
  },
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

const singleResponseSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "single-response",
  },
  command: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  ...responseSchemaObject,
});

const SingleResponse = mongoose.model('SingleResponse', singleResponseSchema);

exports.SingleResponse = SingleResponse;
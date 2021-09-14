const Joi = require('joi');
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

const baseSchema = Joi.object({
  botId: Joi.string().trim().required()
    .messages({
      "string.empty": 'Bot ID is required',
      "any.required": 'Bot ID is required',
    }),
  command: Joi.string().trim().max(30).required()
    .custom((value, helper) => {
      const wordCount = value.slice(0).trim().split(' ').length;
      if (wordCount > 1) {
        return helper.message('Command must be a single word');
      }
      return value;
    })
    .messages({
      "string.empty": 'Command is required',
      "string.max" : 'Command cannot be greater than 30 characters',
      "any.required": 'Command is required',
    }),
  description: Joi.string().trim().max(250).required()
    .messages({
      "string.empty": 'Description is required',
      "string.max" : 'Description cannot be greater than 250 characters',
      "any.required": 'Description is required',
    }),
  responseLocation: Joi.string().trim().valid('server','directmessage').required()
    .messages({
      "string.empty": 'Response Location is required',
      "any.only": 'Response Location must be either "server" or "directmessage"',
      "any.required": 'Response Location is required',
    }),
  options: Joi.array().min(1).required().items(
      Joi.object({
          _id: Joi.string().optional(),
          keyword: Joi.string().trim().max(30).required()
            .custom((value, helper) => {
              const wordCount = value.slice(0).trim().split(' ').length;
              if (wordCount > 1) {
                return helper.message('Keyword must be a single word');
              }
              return value;
            })
            .messages({
              "string.empty": 'Keyword is required',
              "string.max" : 'Keyword cannot be greater than 30 characters',
              "any.required": 'Keyword is required',
            }),
          response: Joi.string().trim().max(2000).required()
            .messages({
              "string.empty": 'Response is required',
              "string.max" : 'Response cannot be greater than 2000 characters',
              "any.required": 'Response is required',
            }),
      })
    )
    .messages({
      "array.min": `At least one optioned response is required`,
      "array.base": 'Options property must be an array',
      "any.required": `At least one optioned response is required`,
    }),
});

function addOptioned(body) {
  return baseSchema.validate(body);
}

function updateOptioned(body) {
  const updateSchema = baseSchema.keys({
    moduleId: Joi.string().trim().required()
      .messages({
        "string.empty": 'Bot ID is required',
        "any.required": 'Bot ID is required',
      }),
  });
  return updateSchema.validate(body);
}

exports.OptionedResponse = OptionedResponse;
exports.addOptioned = addOptioned;
exports.updateOptioned = updateOptioned;
const Joi = require('joi');
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
  responses: Joi.array().min(1).required().items(
    Joi.object({
      _id: Joi.string(),
      response: Joi.string().trim().max(2000).required()
        .messages({
          "string.empty": 'Response is required',
          "string.max" : 'Response cannot be greater than 2000 characters',
          "any.required": 'Response is required',
        }),
    }))
    .messages({
      "array.min": `At least one response is required`,
      "array.base": 'Responses property must be an array',
      "any.required": `Responses property is required`,
    }),
});

function addRandom(body) {
  return baseSchema.validate(body);
}

function updateRandom(body) {
  const updateSchema = baseSchema.keys({
    moduleId: Joi.string().trim().required()
      .messages({
        "string.empty": 'Module ID is required',
        "any.required": 'Module ID is required',
      }),
  });
  return updateSchema.validate(body);
}

exports.RandomResponse = RandomResponse;
exports.addRandom = addRandom;
exports.updateRandom = updateRandom;
const Joi = require('joi');
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
  responseLocation: {
    type: String,
    trim: true,
    default: "server",
  },
  response: {
    type: String,
    trim: true,
    required: true,
  },
});

const SingleResponse = mongoose.model('SingleResponse', singleResponseSchema);

function addSingle(singleResponse) {
  const schema = Joi.object({
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
    response: Joi.string().trim().max(2000).required()
      .messages({
        "string.empty": 'Response is required',
        "string.max" : 'Response cannot be greater than 2000 characters',
        "any.required": 'Response is required',
      }),
  });
  return schema.validate(singleResponse);
}

function updateSingle(singleResponse) {
  const schema = Joi.object({
    botId: Joi.string().trim().required()
      .messages({
        "string.empty": 'Bot ID is required',
        "any.required": 'Bot ID is required',
      }),
    moduleId: Joi.string().trim().required()
      .messages({
        "string.empty": 'Module ID is required',
        "any.required": 'Module ID is required',
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
    response: Joi.string().trim().max(2000).required()
      .messages({
        "string.empty": 'Response is required',
        "string.max" : 'Response cannot be greater than 2000 characters',
        "any.required": 'Response is required',
      }),
  });
  return schema.validate(singleResponse);
}

exports.SingleResponse = SingleResponse;
exports.addSingle = addSingle;
exports.updateSingle = updateSingle;
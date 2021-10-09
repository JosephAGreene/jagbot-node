const Joi = require('joi');

const baseAutoModSchema = {
  botId: Joi.string().trim().required()
    .messages({
      "string.empty": 'Bot ID cannot be blank',
      "any.required": 'Bot ID is required',
    }),
  enabled: Joi.bool().required()
    .messages({
      "boolean.base": "Enabled must be either true or false",
      "any.required": "Enabled is required",
    }),
  delete: Joi.when('enabled', {
    is: Joi.boolean().valid(true),
    then: Joi.when('warn', {
      is: Joi.boolean().valid(false),
      then: Joi.boolean().valid(true).required(),
      otherwise: Joi.bool().required(),
    }),
    otherwise: Joi.bool().required(),
  })
    .messages({
      "boolean.base": "Delete must be either true or false",
      "any.only": 'Either delete or warn must be true when filter is enabled',
      "any.required": "Delete is required",
    }),
  warn: Joi.when('enabled', {
    is: Joi.boolean().valid(true),
    then: Joi.when('delete', {
      is: Joi.boolean().valid(false),
      then: Joi.boolean().valid(true).required(),
      otherwise: Joi.bool().required(),
    }),
    otherwise: Joi.bool().required(),
  })
    .messages({
      "boolean.base": "Warn must be either true or false",
      "any.only": 'Either delete or warn must be true when filter is enabled',
      "any.required": "Warn is required",
    }),
  responseLocation: Joi.string().trim().valid('server', 'directmessage').required()
    .messages({
      "any.only": 'Response location must be either "server" or "directmessage"',
      "any.required": 'Response location is required',
    }),
  response: Joi.when('warn', {
    is: Joi.boolean().valid(true),
    then: Joi.when('enabled', {
      is: Joi.boolean().valid(true),
      then: Joi.string().trim().max(1000).required(),
    }),
    otherwise: Joi.string().allow('').max(1000).required(),
  })
    .messages({
      "string.empty": 'Response cannot be blank',
      "string.max": 'Response cannot be greater than 1000 characters',
      "any.required": 'Response is required',
    }),
  ignoredRoles: Joi.array().required().items(
    Joi.object({
      serverId: Joi.string().trim().required()
        .messages({
          "string.empty": 'Server id cannot be blank',
          "any.required": 'Server id property is required',
        }),
      serverName: Joi.string().trim().required()
        .messages({
          "string.empty": 'Server name cannot be blank',
          "any.required": 'Server name property is required',
        }),
      roleId: Joi.string().trim().required()
        .messages({
          "string.empty": 'Role id cannot be blank',
          "any.required": 'Role id property is required',
        }),
      roleName: Joi.string().trim().required()
        .messages({
          "string.empty": 'Role name cannot be blank',
          "any.required": 'Role name property is required',
        }),
    }))
    .messages({
      "array.base": 'IgnoredRoles property must be an array',
      "any.required": `Ignored roles property is required`,
    }),
};

function inviteValid(body) {
  const inviteFilterSchema = Joi.object({
    ...baseAutoModSchema,
  });
  return inviteFilterSchema.validate(body);
}

function capsValid(body) {
  const massCapsFilterSchema = Joi.object({
    ...baseAutoModSchema,
  });
  return massCapsFilterSchema.validate(body);
}

function mentionsValid(body) {
  const massMentionsFilterSchema = Joi.object({
    ...baseAutoModSchema,
    limit: Joi.when('enabled', {
      is: Joi.boolean().valid(true),
      then: Joi.number().integer().min(3).max(20).required(),
      otherwise: Joi.number().integer().allow(null, '').min(3).max(20).required()
    })
      .messages({
        "number.min": "Limit must be at least 3",
        "number.max": "Limit cannot be greater than 20",
        "number.base": "Limit must be a number",
        "any.required": "Limit is required",
      }),
  });
  return massMentionsFilterSchema.validate(body);
}

function wordValid(body) {
  const wordFilterSchema = Joi.object({
    ...baseAutoModSchema,
    triggerWords: Joi.when('enabled', {
      is: Joi.boolean().valid(true),
      then: Joi.array().min(1).max(50).required(),
      otherwise: Joi.array().max(50).required(),
    })
      .messages({
        "any.required": "Trigger words property is required",
        "array.required": "Trigger words property is required",
        "array.base": "Trigger words must be an array",
        "array.min": "At least 1 trigger word is required when enabled is true",
        "array.max": "Trigger words cannot exceed 50",
      }),
  });
  return wordFilterSchema.validate(body);
}

exports.inviteValid = inviteValid;
exports.capsValid = capsValid;
exports.mentionsValid = mentionsValid;
exports.wordValid = wordValid;
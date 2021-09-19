const Joi = require('joi');

const baseCommandModuleSchema = {
  botId: Joi.string().trim().required()
    .messages({
      "string.empty": 'Bot ID cannot be blank',
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
      "string.empty": 'Command cannot be blank',
      "string.max": 'Command cannot be greater than 30 characters',
      "any.required": 'Command is required',
    }),
  description: Joi.string().trim().max(250).required()
    .messages({
      "string.empty": 'Description cannot be blank',
      "string.max": 'Description cannot be greater than 250 characters',
      "any.required": 'Description is required',
    }),
  responseLocation: Joi.string().trim().valid('server', 'directmessage').required()
    .messages({
      "any.only": 'Response Location must be either "server" or "directmessage"',
      "any.required": 'Response Location is required',
    }),
};

const baseResponseSchema = {
  responseType: Joi.string().trim().valid('basic', 'embed').required()
    .messages({
      "any.only": 'Response type must be either "basic" or "embed"',
      "any.required": 'Response type is required',
    }),
  response: Joi.when('responseType', {
    is: Joi.string().trim().valid("basic"),
    then: Joi.string().trim().max(1500).required()
      .messages({
        "string.empty": 'Response cannot be blank',
        "string.max": 'Response cannot be greater than 1500 characters',
        "any.required": 'Response property is required',
      }),
    otherwise: Joi.string().valid('').trim().required()
      .messages({
        "any.only": "Response must be blank",
        "string.max": 'Response cannot be greater than 1500 characters',
        "any.required": 'Response property is required',
      }),
  }),
  embedTitle: Joi.when('responseType', {
    is: Joi.string().trim().valid("embed"),
    then: Joi.string().trim().max(240).required(),
    otherwise: Joi.string().trim().allow('').optional(),
  })
    .messages({
      "string.empty": 'Title cannot be blank',
      "string.max": "Title cannot be greater than 240 characters",
      "any.required": 'Title is required',
    }),
  embedLinkURL: Joi.when('responseType', {
    is: Joi.string().trim().valid("embed"),
    then: Joi.string().trim().regex(RegExp(/\b(https?:\/\/.*?\.[a-z]{2,4}\b)/)).max(2040).allow('').required(),
    otherwise: Joi.string().trim().allow('').required(),
  })
    .messages({
      "string.pattern.base": "Urls must be valid and well formed (http or https)",
      "string.max": "Urls cannot be greater than 2040 characters",
      "any.required": 'Link url is required'
    }),
  embedColor: Joi.when('responseType', {
    is: Joi.string().trim().valid("embed"),
    then: Joi.string().trim().regex(RegExp(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)).max(7).allow('').required(),
    otherwise: Joi.string().trim().allow('').required(),
  })
    .messages({
      "string.pattern.base": "Color must be a valid hex code",
      "string.max": "Color must be a valid hex code",
      "any.required": 'Color is required'
    }),
  embedThumbnailURL: Joi.when('responseType', {
    is: Joi.string().trim().valid("embed"),
    then: Joi.string().trim().regex(RegExp(/\b(https?:\/\/.*?\.[a-z]{2,4}\b)/)).max(2040).allow('').required(),
    otherwise: Joi.string().trim().allow('').required(),
  })
    .messages({
      "string.pattern.base": "Urls must be valid and well formed (http or https)",
      "string.max": "Urls cannot be greater than 2040 characters",
      "any.required": 'Thumbnail url property is required'
    }),
  embedMainImageURL: Joi.when('responseType', {
    is: Joi.string().trim().valid("embed"),
    then: Joi.string().trim().regex(RegExp(/\b(https?:\/\/.*?\.[a-z]{2,4}\b)/)).max(2040).allow('').required(),
    otherwise: Joi.string().trim().allow('').required(),
  })
    .messages({
      "string.pattern.base": "Urls must be valid and well formed (http or https)",
      "string.max": "Urls cannot be greater than 2040 characters",
      "any.required": 'Main image url property is required'
    }),
  embedDescription: Joi.when('responseType', {
    is: Joi.string().trim().valid("embed"),
    then: Joi.string().trim().max(3000).allow('').required(),
    otherwise: Joi.string().trim().allow('').required(),
  })
    .messages({
      "string.max": "Description cannot be greater than 3000 characters",
      "any.required": 'Description property is required'
    }),
  embedFields: Joi.when('responseType', {
    is: Joi.string().trim().valid("embed"),
    then: Joi.array().items(Joi.object({
      name: Joi.string().trim().max(240).required()
        .messages({
          "string.empty": "Name cannot be blank",
          "string.max": "Name cannot be greater than 240 characters",
          "any.required": "Name property is required",
        }),
      value: Joi.string().trim().max(750).required()
        .messages({
          "string.empty": "Value cannot be blank",
          "string.max": "Value cannot be greater than 750 characters",
          "any.required": "Value property is required",
        }),
      inline: Joi.bool().required()
        .messages({
          "boolean.base": "Inline must be a boolean",
          "any.required": "Inline is required",
        }),
    }))
      .messages({
        "array.base": "Embed fields must be an array",
      }),
    otherwise: Joi.array().items(Joi.object({
      name: Joi.string().trim().allow('').optional(),
      value: Joi.string().trim().allow('').optional(),
      inline: Joi.bool().default(false).optional(),
    })),
  }),
  embedFooter: Joi.when('responseType', {
    is: Joi.string().trim().valid("embed"),
    then: Joi.string().trim().max(500).allow('').required(),
    otherwise: Joi.string().trim().allow('').required(),
  })
    .messages({
      "string.max": "Footer cannot be greater than 500 characters",
      "any.required": "Footer property is required"
    }),
  embedFooterThumbnailURL: Joi.when('responseType', {
    is: Joi.string().trim().valid("embed"),
    then: Joi.string().trim().regex(RegExp(/\b(https?:\/\/.*?\.[a-z]{2,4}\b)/)).max(2040).allow('').required(),
    otherwise: Joi.string().trim().allow('').required(),
  })
    .messages({
      "string.pattern.base": "Urls must be valid and well formed (http or https)",
      "string.max": "Urls cannot be greater than 2040 characters",
      "any.required": 'Footer thumbnail image url property is required'
    }),
}

function addSingle(body) {
  const addSingleSchema = Joi.object({
    ...baseCommandModuleSchema,
    ...baseResponseSchema,
  });
  return addSingleSchema.validate(body);
}

function updateSingle(body) {
  const updateSingleSchema = Joi.object({
    moduleId: Joi.string().trim().required()
      .messages({
        "string.empty": 'Module ID cannot be blank',
        "any.required": 'Module ID is required',
      }),
    ...baseCommandModuleSchema,
    ...baseResponseSchema,
  });
  return updateSingleSchema.validate(body);
}

function addRandom(body) {
  const addRandomSchema = Joi.object({
    ...baseCommandModuleSchema,
    responses: Joi.array().min(1).required().items(
      Joi.object({
        _id: Joi.string(),
        ...baseResponseSchema,
      }))
      .messages({
        "array.min": `At least one response is required`,
        "array.base": 'Responses property must be an array',
        "any.required": `Responses property is required`,
      }),
  });
  return addRandomSchema.validate(body);
}

function updateRandom(body) {
  const updateRandomSchema = Joi.object({
    moduleId: Joi.string().trim().required()
    .messages({
      "string.empty": 'Module ID cannot be blank',
      "any.required": 'Module ID is required',
    }),
    ...baseCommandModuleSchema,
    responses: Joi.array().min(1).required().items(
      Joi.object({
        _id: Joi.string(),
        ...baseResponseSchema,
      }))
      .messages({
        "array.min": `At least one response is required`,
        "array.base": 'Responses property must be an array',
        "any.required": `Responses property is required`,
      }),
  });
  return updateRandomSchema.validate(body);
}

function addOptioned(body) {
  const addOptionedSchema = Joi.object({
    ...baseCommandModuleSchema,
    options: Joi.array().min(1).required().items(
      Joi.object({
        _id: Joi.string(),
        keyword: Joi.string().trim().max(30).required()
        .custom((value, helper) => {
          const wordCount = value.slice(0).trim().split(' ').length;
          if (wordCount > 1) {
            return helper.message('Keyword must be a single word');
          }
          return value;
        })
        .messages({
          "string.empty": 'Keyword cannot be blank',
          "string.max": 'Keyword cannot be greater than 30 characters',
          "any.required": 'Keyword is required',
        }),
        ...baseResponseSchema,
      }))
      .messages({
        "array.min": `At least one response is required`,
        "array.base": 'Responses property must be an array',
        "any.required": `Responses property is required`,
      }),
  });
  return addOptionedSchema.validate(body);
}

function updateOptioned(body) {
  const updateOptionedSchema = Joi.object({
    ...baseCommandModuleSchema,
    moduleId: Joi.string().trim().required()
    .messages({
      "string.empty": 'Module ID cannot be blank',
      "any.required": 'Module ID is required',
    }),
    options: Joi.array().min(1).required().items(
      Joi.object({
        _id: Joi.string(),
        keyword: Joi.string().trim().max(30).required()
        .custom((value, helper) => {
          const wordCount = value.slice(0).trim().split(' ').length;
          if (wordCount > 1) {
            return helper.message('Keyword must be a single word');
          }
          return value;
        })
        .messages({
          "string.empty": 'Keyword cannot be blank',
          "string.max": 'Keyword cannot be greater than 30 characters',
          "any.required": 'Keyword is required',
        }),
        ...baseResponseSchema,
      }))
      .messages({
        "array.min": `At least one response is required`,
        "array.base": 'Responses property must be an array',
        "any.required": `Responses property is required`,
      }),
  });
  return updateOptionedSchema.validate(body);
}

exports.addSingle = addSingle;
exports.updateSingle = updateSingle;
exports.addRandom = addRandom;
exports.updateRandom = updateRandom;
exports.addOptioned = addOptioned;
exports.updateOptioned = updateOptioned;
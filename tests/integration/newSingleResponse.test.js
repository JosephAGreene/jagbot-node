require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const { User } = require("../../models/user");
const { Bot } = require("../../models/bot");

describe('/api/custom-modules', () => {
  let server;
  let payloadBasic;
  let payloadEmbed;
  let userId;
  let botId;
  let botToken = process.env.SUPERTEST_BOT_TOKEN;

  beforeAll(async () => {
    server = require('../testServer');
  })

  beforeEach(async () => {
    let user = new User({
      discordTag: "testValue",
      discordId: "testValue",
    });

    // Setting active to false in order to avoid creating errors from 
    // calling discord operations after jest is torn down.
    let bot = new Bot({
      owner: user._id,
      botToken: botToken,
      botId: '878505872983199805',
      name: "TestBot",
      prefix: "!",
      status: false,
      active: false,
      commandModules: [
        {
          _id: new mongoose.mongo.ObjectId(),
          type: "single-response",
          command: "duplicate",
          description: "This is a fake basic response to test against",
          responseLocation: "server",
          responseType: "basic",
          response: "This is a response",
          embedTitle: "",
          embedLinkURL: "",
          embedColor: "",
          embedThumbnailURL: "",
          embedMainImageURL: "",
          embedDescription: "",
          embedFields: [],
          embedFooter: "",
          embedFooterThumbnailURL: "",
        },
      ]
    });

    user.bots.push(bot._id);

    await user.save();
    await bot.save();
    userId = user._id;
    botId = bot._id;

    payloadBasic = {
      botId: botId,
      command: "command",
      description: "description",
      responseLocation: "server",
      responseType: "basic",
      response: "response",
      embedTitle: "",
      embedLinkURL: "",
      embedColor: "",
      embedThumbnailURL: "",
      embedMainImageURL: "",
      embedDescription: "",
      embedFields: [],
      embedFooter: "",
      embedFooterThumbnailURL: "",
    }

    payloadEmbed = {
      botId: botId,
      command: "command2",
      description: "description",
      responseLocation: "server",
      responseType: "embed",
      response: "",
      embedTitle: "Title",
      embedLinkURL: "http://www.google.com",
      embedColor: "#FFFFFF",
      embedThumbnailURL: "http://www.google.com",
      embedMainImageURL: "http://www.google.com",
      embedDescription: "description",
      embedFields: [],
      embedFooter: "",
      embedFooterThumbnailURL: "",
    }
  });

  const exec = async (injectBool, realUser, payload) => {
    const injector = { inject: { injectBool: injectBool, realUser: realUser, userId: userId } };
    return request(server)
      .post('/api/custom-modules/single-response')
      .send({
        ...injector,
        ...payload
      });
  };

  afterEach(async () => {
    await Bot.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    await server.close();
  });

  describe('POST /single-response', () => {
    it('should return 401 if credentials are not provided', async () => {
      const res = await exec(false, true, payloadBasic);

      expect(res.status).toBe(401);
    });

    it('should return 401 if credentials provided do not match the owner the bot', async () => {
      const res = await exec(true, false, payloadBasic);

      expect(res.status).toBe(401);
    });

    it('should return 404 if the bot does not exist', async () => {
      payloadBasic.botId = new mongoose.mongo.ObjectId();

      const res = await exec(true, true, payloadBasic);

      expect(res.status).toBe(404);
    });

    it('should return 409 if a duplicate command is sent', async () => {
      payloadBasic.command = "duplicate";

      const res = await exec(true, true, payloadBasic);

      expect(res.status).toBe(409);
    });

    it('should return 400 if bot id is not provided', async () => {
      delete payloadBasic.botId;

      const res = await exec(true, true, payloadBasic);

      expect(res.status).toBe(400);
      expect(res.text).toBe("Bot ID is required");
    });

    it('should return 400 if provided command is not valid', async () => {
      // missing command property
      const payload1 = {
        ...payloadBasic
      }
      delete payload1.command;

      // command more than 2 words
      const payload2 = {
        ...payloadBasic,
        command: "One Two"
      }

      // command greater than 30 characters
      const payload3 = {
        ...payloadBasic,
        command: "Thisisareallylongwordthatexceedsthe30characterlimit"
      }

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);
      const res3 = await exec(true, true, payload3);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Command is required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Command must be a single word");
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Command cannot be greater than 30 characters");
    });

    it('should return 400 if provided description is not valid', async () => {
      // missing description property
      const payload1 = {
        ...payloadBasic
      }
      delete payload1.description;

      // description greater than 250 characters
      const payload2 = {
        ...payloadBasic,
        description: new Array(252).join('a'),
      }

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Description is required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Description cannot be greater than 250 characters");
    });

    it('should return 400 if provided responseLocation is not valid', async () => {
      // missing responseLocation property
      const payload1 = {
        ...payloadBasic
      }
      delete payload1.responseLocation;

      // invalid responseLocation property
      const payload2 = {
        ...payloadBasic,
        responseLocation: "notvalid"
      }

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Response Location is required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe('Response Location must be either "server" or "directmessage"');
    });

    it('should return 400 if provided responseType is not valid', async () => {
      // missing responseType property
      const payload1 = {
        ...payloadBasic
      }
      delete payload1.responseType;

      // responseType is something other than "basic" or "embed"
      const payload2 = {
        ...payloadBasic,
        responseType: "NotBasicOrEmbed",
      }

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Response type is required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe('Response type must be either "basic" or "embed"');
    });

    it('should return 400 if provided response is not valid (while responeType is basic)', async () => {
      // missing response property
      const payload1 = {
        ...payloadBasic
      }
      delete payload1.response;

      // response greater than 1500 characters
      const payload2 = {
        ...payloadBasic,
        response: new Array(1502).join('a'),
      }

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Response is required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Response cannot be greater than 1500 characters");
    });

    it('should return 400 if embedded only fields are provided while responseType is "basic"', async () => {
      // embedTitle provided
      const payload1 = {
        ...payloadBasic,
        embedTitle: "title",
      }

      // embedLinkURL provided
      const payload2 = {
        ...payloadBasic,
        embedLinkURL: "http://www.google.com",
      }

      // embedColor provided
      const payload3 = {
        ...payloadBasic,
        embedColor: "#FFFFFF",
      }

      // embedThumbnailURL provided
      const payload4 = {
        ...payloadBasic,
        embedThumbnailURL: "http://www.google.com",
      }

      // embedMainImageURL provided
      const payload5 = {
        ...payloadBasic,
        embedMainImageURL: "http://www.google.com",
      }

      // embedDescription prived
      const payload6 = {
        ...payloadBasic,
        embedDescription: "description",
      }

      // embedFields provided
      const payload7 = {
        ...payloadBasic,
        embedFields: [{ value: "value" }],
      }

      //embedFooter provided
      const payload8 = {
        ...payloadBasic,
        embedFooter: "footer",
      }

      // embebFooterThumbnailURL provided
      const payload9 = {
        ...payloadBasic,
        embedFooterThumbnailURL: "http://wwww.google.com"
      }

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);
      const res3 = await exec(true, true, payload3);
      const res4 = await exec(true, true, payload4);
      const res5 = await exec(true, true, payload5);
      const res6 = await exec(true, true, payload6);
      const res7 = await exec(true, true, payload7);
      const res8 = await exec(true, true, payload8);
      const res9 = await exec(true, true, payload9);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Title value invalid");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Link url value invalid");
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Color value invalid");
      expect(res4.status).toBe(400);
      expect(res4.text).toBe("Thumbnail url value invalid");
      expect(res5.status).toBe(400);
      expect(res5.text).toBe("Main image url value invalid");
      expect(res6.status).toBe(400);
      expect(res6.text).toBe("Description value invalid");
      expect(res7.status).toBe(400);
      expect(res7.text).toBe("Fields value invalid");
      expect(res8.status).toBe(400);
      expect(res8.text).toBe("Footer value invalid");
      expect(res9.status).toBe(400);
      expect(res9.text).toBe("Footer thumbnail url invalid");
    });

    // While responseType = embed
    it('should return 400 if provided embedTitle is not valid', async () => {
      // missing embedTitle
      const payload1 = {
        ...payloadEmbed
      }
      delete payload1.embedTitle;

      const payload2 = {
        ...payloadEmbed,
        embedTitle: "",
      }

      // embedTitle greater than 240 characters
      const payload3 = {
        ...payloadEmbed,
        response: new Array(242).join('a'),
      }

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);
      const res3 = await exec(true, true, payload3);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Title is required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Title is required");
      expect(res3.status).toBe(400);
      expect(res4.text).toBe("Title cannot be greater than 240 characters");
    });

    // While responseType = embed
    it('should return 400 if provided embedLinkURL is not valid', async () => {
      // missing embedLinkURL
      const payload1 = {
        ...payloadEmbed
      }
      delete payload1.embedLinkURL;

      // embedLinkURL greater than 2040 characters
      const payload2 = {
        ...payloadEmbed,
        embedLinkURL: new Array(2042).join('a'),
      }

      // embedLinkURL an invalid URL pattern
      const payload3 = {
        ...payloadEmbed,
        embedLinkURL: "invalidurl",
      }

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);
      const res3 = await exec(true, true, payload3);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("URL cannot be greater than 2040 characters");
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Urls must be valid and well formed (http or https");
    });

    // While responseType = embed
    it('should return 400 if provided embedColor is not valid', async () => {
      // missing embedColor
      const payload1 = {
        ...payloadEmbed
      }
      delete payload1.embedColor;

      // embedColor greater than 7 characters
      const payload2 = {
        ...payloadEmbed,
        embedColor: "#FFFFFFF",
      }

      // embedColor an invalid hex pattern
      const payload3 = {
        ...payloadEmbed,
        embedColor: "#FFFS",
      }

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);
      const res3 = await exec(true, true, payload3);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Color must be a valid hex code");
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Color must be a valid hex code");
    });

    // While responseType = embed
    it('should return 400 if provided embedThumbnailURL is not valid', async () => {
      // missing embedThumbnailURL
      const payload1 = {
        ...payloadEmbed
      }
      delete payload1.embedThumbnailURL;

      // embedThumbnailURL greater than 2040 characters
      const payload2 = {
        ...payloadEmbed,
        embedThumbnailURL: new Array(2042).join('a'),
      }

      // embedTumbnailURL an invalid URL pattern
      const payload3 = {
        ...payloadEmbed,
        embedLinkURL: "invalidurl",
      }

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);
      const res3 = await exec(true, true, payload3);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("URL cannot be greater than 2040 characters");
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Urls must be valid and well formed (http or https");
    });

    // While responseType = embed
    it('should return 400 if provided embedMainImageURL is not valid', async () => {
      // missing embedMainImageURL
      const payload1 = {
        ...payloadEmbed
      }
      delete payload1.embedMainImageURL;

      // embedMainImageURL greater than 2040 characters
      const payload2 = {
        ...payloadEmbed,
        embedMainImageURL: new Array(2042).join('a'),
      }

      // embedMainImageURL an invalid URL pattern
      const payload3 = {
        ...payloadEmbed,
        embedMainImageURL: "invalidurl",
      }

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);
      const res3 = await exec(true, true, payload3);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("URL cannot be greater than 2040 characters");
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Urls must be valid and well formed (http or https");
    });

    // While responseType = embed
    it('should return 400 if provided embedDescription is not valid', async () => {
      // missing embedDescription property
      const payload1 = {
        ...payloadEmbed
      }
      delete payload1.embedDescription;

      // empty embedDescription property
      const payload2 = {
        ...payloadEmbed,
        embedDescription: "",
      }

      // embedDescription greater than 3000 characters
      const payload3 = {
        ...payloadEmbed,
        response: new Array(3002).join('a'),
      }

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);
      const res3 = await exec(true, true, payload3);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Description is required");
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Description cannot be greater than 3000 characters");
    });

    // While responseType = embed
    it('should return 400 if provided embedFields is not valid', async () => {
      // embedFields not an array
      const payload1 = {
        ...payloadEmbed,
        embedFields: "a string"
      }

      // embedFields name missing value
      const payload2 = {
        ...payloadEmbed,
        embedFields: [
          {
            name: "",
            value: "value",
            inline: true,
          }
        ]
      }

      // embedFields value missing value
      const payload3 = {
        ...payloadEmbed,
        embedFields: [
          {
            name: "name",
            value: "",
            inline: true,
          }
        ]
      }

      // embedFields missing inline
      const payload4 = {
        ...payloadEmbed,
        embedFields: [
          {
            name: "name",
            value: "value",
          }
        ]
      }

      // embedFields inline not a boolean
      const payload5 = {
        ...payloadEmbed,
        embedFields: [
          {
            name: "name",
            value: "value",
            inline: "string",
          }
        ]
      }

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);
      const res3 = await exec(true, true, payload3);
      const res4 = await exec(true, true, payload4);
      const res5 = await exec(true, true, payload5);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Embed fields must be an array");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Title cannot be blank");
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Value cannot be blank");
      expect(res4.status).toBe(400);
      expect(res4.text).toBe("Inline is required");
      expect(res5.status).toBe(400);
      expect(res5.text).toBe("Inline must be a boolean");

    });

    // While responseType = embed
    it('should return 400 if provided embedFooter is not valid', async () => {
      // embedFooter is greater than 500 characters
      const payload1 = {
        ...payloadEmbed,
        embedFooter: new Array(502).join('a'),
      }

      const res1 = await exec(true, true, payload1);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Footer cannot be greater than 500 characters");
    });

    // While responseType = embed
    it('should return 400 if provided embedFooterThumbnailURL is not valid', async () => {
      // missing embedFooterThumbnailURL
      const payload1 = {
        ...payloadEmbed
      }
      delete payload1.embedFooterThumbnailURL;

      // embedFooterThumbnailURL greater than 2040 characters
      const payload2 = {
        ...payloadEmbed,
        embedFooterThumbnailURL: new Array(2042).join('a'),
      }

      // embedFooterThumbnailURL an invalid URL pattern
      const payload3 = {
        ...payloadEmbed,
        embedFooterThumbnailURL: "invalidurl",
      }

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);
      const res3 = await exec(true, true, payload3);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("URL cannot be greater than 2040 characters");
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Urls must be valid and well formed (http or https");
    });

    // While responseType = embed
    it('should return 400 if response is provided (while responseType is embed', async () => {
      // response is not blank
      const payload1 = {
        ...payloadEmbed,
        response: "not blank"
      }

      const res1 = await exec(true, true, payload1);

      expect(res1.status).toBe(400);
      epxect(res1.text).toBe("Response not allowed");
    });

    it('should return 200 if single-response addition is successful', async () => {
      const res1 = await exec(true, true, payloadBasic);
      const res2 = await exec(true, true, payloadEmbed);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
    });
  });
});
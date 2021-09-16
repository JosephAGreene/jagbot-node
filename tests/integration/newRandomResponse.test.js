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
          type: "random-response",
          command: "duplicate",
          description: "This is a fake module to test against",
          responseLocation: "server",
          responses: [
            {
              _id: "12912832",
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
          ],
        }
      ]
    });

    user.bots.push(bot._id);

    await user.save();
    await bot.save();
    userId = user._id;
    botId = bot._id;

    payloadBasic = {
      botId: botId,
      command: "commandBasic",
      description: "description",
      responseLocation: "server",
      responses: [
        {
          _id: "12312322",
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
    }

    payloadEmbed = {
      botId: botId,
      command: "commandEmbed",
      description: "description",
      responseLocation: "server",
      responses: [
        {
          _id: "1231982",
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
        },
      ]
    }
  });

  const exec = async (injectBool, realUser, payload) => {
    const injector = { inject: { injectBool: injectBool, realUser: realUser, userId: userId } };
    return request(server)
      .post('/api/custom-modules/random-response')
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

  describe('POST /random-response', () => {
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

      const payload2 = {
        ...payloadBasic,
        command: "",
      }

      // command more than 2 words
      const payload3 = {
        ...payloadBasic,
        command: "One Two"
      }

      // command greater than 30 characters
      const payload4 = {
        ...payloadBasic,
        command: "Thisisareallylongwordthatexceedsthe30characterlimit"
      }

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);
      const res3 = await exec(true, true, payload3);
      const res4 = await exec(true, true, payload4);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Command is required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Command cannot be blank");
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Command must be a single word");
      expect(res4.status).toBe(400);
      expect(res4.text).toBe("Command cannot be greater than 30 characters");
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

    it('should return 400 if provided options array is not valid', async () => {
      // missing responses property
      const payload1 = {
        ...payload,
      }
      delete payload1.responses;

      // responses propery not an array
      const payload2 = {
        ...payload,
        responses: "a string",
      }

      // responses array empty
      const payload3 = {
        ...payload,
        responses: [],
      }

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);
      const res3 = await exec(true, true, payload3);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Responses property is required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Responses property must be an array");
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("At least one response is required");
    });

    it('should return 400 if provided responseType is not valid', async () => {
      // missing responseType property
      const payload1 = {
        ...payloadBasic
      }
      delete payload1.responses[0].responseType;

      // responseType is something other than "basic" or "embed"
      const payload2 = {
        ...payloadBasic,
      }
      payload2.responses[0].responseType = "NotBasicOrEmbed";

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Response type is required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe('Response type must be either "basic" or "embed"');
    });

    it('should return 400 if provided response is not valid (while responeType is basic)', async () => {
      // missing response property
      const payload1 = {...payloadBasic};
      delete payload1.responses[0].response;

      // blank response value
      const payload2 = {...payloadBasic};
      payload2.responses[0].response = "";

      // response greater than 1500 characters
      const payload3 = {...payloadBasic}
      payload3.responses[0].response = new Array(1502).join('a');

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);
      const res3 = await exec(true, true, payload3);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Response property is required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Response cannot be blank");
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Response cannot be greater than 1500 characters");
    });

    // While responseType = embed
    it('should return 400 if provided embedTitle is not valid', async () => {
      // missing embedTitle
      const payload1 = {...payloadEmbed};
      delete payload1.responses[0].embedTitle;

      const payload2 = {...payloadEmbed};
      payload2.responses[0].embedTitle = "";

      // embedTitle greater than 240 characters
      const payload3 = {...payloadEmbed};
      payload3.responses[0].embedTitle = new Array(242).join('a');

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);
      const res3 = await exec(true, true, payload3);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Title is required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Title cannot be blank");
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Title cannot be greater than 240 characters");
    });

    // While responseType = embed
    it('should return 400 if provided embedLinkURL is not valid', async () => {
      // missing embedLinkURL property
      const payload1 = {...payloadEmbed};
      delete payload1.responses[0].embedLinkURL;

      // embedLinkURL greater than 2040 characters
      const payload2 = {...payloadEmbed};
      payload2.responses[0].embedLinkURL = `http://www.google.com/${new Array(2042).join('a')}`;

      // embedLinkURL an invalid URL pattern
      const payload3 = {...payloadEmbed};
      payload3.responses[0].embedLinkURL = "invalidurl";

      // Ensure an empty embedLinkURL property is valid
      const payload4 = {...payloadEmbed};
      payload4.responses[0].embedLinkURL = "";

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);
      const res3 = await exec(true, true, payload3);
      const res4 = await exec(true, true, payload4);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Link url is required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Urls cannot be greater than 2040 characters");
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Urls must be valid and well formed (http or https)");
      expect(res4.status).toBe(200);
    });

    // While responseType = embed
    it('should return 400 if provided embedColor is not valid', async () => {
      // missing embedColor
      const payload1 = {
        ...payloadEmbed
      }
      delete payload1.responses[0].embedColor;

      // embedColor greater than 7 characters
      const payload2 = {...payloadEmbed};
      payload2.responses[0].embedColor = "#FFFFFFF";

      // embedColor an invalid hex pattern
      const payload3 = {...payloadEmbed};
      payload3.responses[0].embedColor = "#FFFS";

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);
      const res3 = await exec(true, true, payload3);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Color is required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Color must be a valid hex code");
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Color must be a valid hex code");
    });

    // While responseType = embed
    it('should return 400 if provided embedThumbnailURL is not valid', async () => {
      // missing embedThumbnailURL
      const payload1 = {...payloadEmbed};
      delete payload1.responses[0].embedThumbnailURL;

      // embedThumbnailURL greater than 2040 characters
      const payload2 = {...payloadEmbed};
      payload2.responses[0].embedThumbnailURL = `http://www.google.com/${new Array(2042).join('a')}`;

      // embedTumbnailURL an invalid URL pattern
      const payload3 = {...payloadEmbed};
      payload3.responses[0].embedThumbnailURL = "invalidurl";

      // Ensure an empty embedThumbnailURL property is valid
      const payload4 = {...payloadEmbed};
      payload4.responses[0].embedThumbnailURL = "";

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);
      const res3 = await exec(true, true, payload3);
      const res4 = await exec(true, true, payload4);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Thumbnail url property is required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Urls cannot be greater than 2040 characters");
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Urls must be valid and well formed (http or https)");
      expect(res4.status).toBe(200);
    });

    // While responseType = embed
    it('should return 400 if provided embedMainImageURL is not valid', async () => {
      // missing embedMainImageURL
      const payload1 = {...payloadEmbed};
      delete payload1.responses[0].embedMainImageURL;

      // embedMainImageURL greater than 2040 characters
      const payload2 = {...payloadEmbed};
      payload2.responses[0].embedMainImageURL = `http://www.google.com/${new Array(2042).join('a')}`;

      // embedMainImageURL an invalid URL pattern
      const payload3 = {...payloadEmbed};
      payload2.responses[0].embedMainImageURL = "invalidurl";

      // Ensure an empty embedMainImageURL property is valid
      const payload4 = {...payloadEmbed};
      payload4.responses[0].embedMainImageURL = "";

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);
      const res3 = await exec(true, true, payload3);
      const res4 = await exec(true, true, payload4);
      
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Main image url property is required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Urls cannot be greater than 2040 characters");
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Urls must be valid and well formed (http or https)");
      expect(res4.status).toBe(200);
    });

    // While responseType = embed
    it('should return 400 if provided embedDescription is not valid', async () => {
      // missing embedDescription property
      const payload1 = {...payloadEmbed};
      delete payload1.responses[0].embedDescription;

      // ensure embedDescription property is valid
      const payload2 = {...payloadEmbed};
      payload2.responses[0].embedDescription = "";

      // embedDescription greater than 3000 characters
      const payload3 = {...payloadEmbed};
      payload3.responses[0].embedDescription = new Array(3002).join('a');

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);
      const res3 = await exec(true, true, payload3);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Description property is required");
      expect(res2.status).toBe(200);
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Description cannot be greater than 3000 characters");
    });

    // While responseType = embed
    it('should return 400 if provided embedFields is not valid', async () => {
      // embedFields not an array
      const payload1 = {...payloadEmbed};
      payload1.responses[0].embedFields = "a string";

      // embedFields name missing value
      const payload2 = {...payloadEmbed};
      payload2.responses[0].embedFields = [
        {
          name: "",
          value: "value",
          inline: true,
        }
      ];

      // embedFields value missing value
      const payload3 = {...payloadEmbed};
      payload3.responses[0].embedFields = [
        {
          name: "name",
          value: "",
          inline: true,
        }
      ];

      // embedFields missing inline
      const payload4 = {...payloadEmbed};
      payload4.responses[0].embedFields = [
        {
          name: "name",
          value: "value",
        }
      ];

      // embedFields inline not a boolean
      const payload5 = {...payloadEmbed};
      payload5.responses[0].embedFields = [
        {
          name: "name",
          value: "value",
          inline: "string",
        }
      ];

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);
      const res3 = await exec(true, true, payload3);
      const res4 = await exec(true, true, payload4);
      const res5 = await exec(true, true, payload5);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Embed fields must be an array");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Name cannot be blank");
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Value cannot be blank");
      expect(res4.status).toBe(400);
      expect(res4.text).toBe("Inline is required");
      expect(res5.status).toBe(400);
      expect(res5.text).toBe("Inline must be a boolean");

    });

    // While responseType = embed
    it('should return 400 if provided embedFooter is not valid', async () => {
      // missing embedFooter property 
      const payload1 = {...payloadEmbed};
      delete payload1.responses[0].embedFooter;

      // embedFooter is greater than 500 characters
      const payload2 = {...payloadEmbed};
      payload2.responses[0].embedFooter = new Array(502).join('a');

      const res1 = await exec(true, true, payload1)
      const res2 = await exec(true, true, payload2);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Footer property is required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Footer cannot be greater than 500 characters");
    });

    // While responseType = embed
    it('should return 400 if provided embedFooterThumbnailURL is not valid', async () => {
      // missing embedFooterThumbnailURL
      const payload1 = {
        ...payloadEmbed
      }
      delete payload1.responses[0].embedFooterThumbnailURL;

      // embedFooterThumbnailURL greater than 2040 characters
      const payload2 = {...payloadEmbed};
      payload2.responses[0].embedFooterThumbnailURL = `http://www.google.com/${new Array(2042).join('a')}`;

      // embedFooterThumbnailURL an invalid URL pattern
      const payload3 = {...payloadEmbed};
      payload3.responses[0].embedFooterThumbnailURL = "invalidurl";

      // Ensure an empty embedFooterThumbnailURL property is valid
      const payload4 = {...payloadEmbed};
      payload4.responses[0].embedFooterThumbnailURL = "";

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);
      const res3 = await exec(true, true, payload3);
      const res4 = await exec(true, true, payload4);
      
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Footer thumbnail image url property is required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Urls cannot be greater than 2040 characters");
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Urls must be valid and well formed (http or https)");
      expect(res4.status).toBe(200);
    });

    // While responseType = embed
    it('should return 400 if response is provided (while responseType is embed', async () => {
      // response is not blank
      const payload1 = {...payloadEmbed};
      payload1.responses[0].response = "not blank";

      const res1 = await exec(true, true, payload1);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Response must be blank");
    });

    it('should return 200 if random-response addition is successful', async () => {
      const res = await exec(true, true, payloadBasic);
      const res2 = await exec(true, true, payloadEmbed);

      expect(res.status).toBe(200);
      expect(res.body.commandModules.length).toBe(2); // Ensure that commandModules grew by 1
      expect(res2.status).toBe(200);
      expect(res2.body.commandModules.length).toBe(3);      
    });
  });
});
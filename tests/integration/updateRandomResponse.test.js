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
  let moduleId;
  let botToken = process.env.SUPERTEST_BOT_TOKEN;

  beforeAll(async () => {
    server = require('../testServer');
  })

  beforeEach(async () => {
    moduleId = new mongoose.mongo.ObjectId();

    let user = new User({
      discordTag: "testValue",
      discordId: "testValue",
    });

    userId = user._id;

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
          _id: moduleId,
          type: "random-response",
          command: "command",
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
        },
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
    botId = bot._id;

    payloadBasic = {
      botId: botId,
      moduleId: moduleId,
      command: "commandBasic",
      description: "description",
      responseLocation: "server",
      responses: [
        {
          _id: "12312322",
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
      moduleId: moduleId,
      command: "commandEmbed",
      description: "description",
      responseLocation: "server",
      responses: [
        {
          _id: "1231982",
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
      .put('/api/custom-modules/update-random-response')
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

    it('should return 404 if the module does not exist', async () => {
      payloadBasic.moduleId = new mongoose.mongo.ObjectId();

      const res = await exec(true, true, payloadBasic);
      expect(res.status).toBe(404);
      expect(res.text).toBe("Module does not exist");

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

    it('should return 400 if module id is not valid', async () => {
      // moduleId property doesn't exist
      delete payloadBasic.moduleId;
      const res1 = await exec(true, true, payloadBasic);
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Module ID is required");

      // Module Id is blank
      payloadBasic.moduleId = "";
      const res2 = await exec(true, true, payloadBasic);
      expect(res2.status).toBe(400);
      expect(res2.text).toBe('Module ID cannot be blank');

    });

    it('should return 400 if provided command is not valid', async () => {
      // missing command property
      delete payloadBasic.command;
      const res1 = await exec(true, true, payloadBasic);
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Command is required");
    
      // command vlaue blank
      payloadBasic.command = "";
      const res2 = await exec(true, true, payloadBasic);
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Command cannot be blank");

      // command more than 1 word
      payloadBasic.command = "One Two";
      const res3 = await exec(true, true, payloadBasic);
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Command must be a single word");

      // command greater than 30 characters
      payloadBasic.command = "Thisisareallylongwordthatexceedsthe30characterlimit";
      const res4 = await exec(true, true, payloadBasic);
      expect(res4.status).toBe(400);
      expect(res4.text).toBe("Command cannot be greater than 30 characters");

    });

    it('should return 400 if provided description is not valid', async () => {
      // missing description property
      delete payloadBasic.description;
      const res1 = await exec(true, true, payloadBasic);
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Description is required");

      // description greater than 250 characters
      payloadBasic.description = new Array(252).join('a');
      const res2 = await exec(true, true, payloadBasic);      
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Description cannot be greater than 250 characters");

    });

    it('should return 400 if provided responseLocation is not valid', async () => {
      // missing responseLocation property
      delete payloadBasic.responseLocation;
      const res1 = await exec(true, true, payloadBasic);  
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Response Location is required");

      // invalid responseLocation property
      payloadBasic.responseLocation = "notvalid";
      const res2 = await exec(true, true, payloadBasic);  
      expect(res2.status).toBe(400);
      expect(res2.text).toBe('Response Location must be either "server" or "directmessage"');

    });

    it('should return 400 if provided responses array is not valid', async () => {
      // missing responses property
      delete payloadBasic.responses;
      const res1 = await exec(true, true, payloadBasic);
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Responses property is required");  

      // responses propery not an array
      payloadBasic.responses = "a string";
      const res2 = await exec(true, true, payloadBasic);
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Responses property must be an array");  

      // responses array empty
      payloadBasic.responses = [];
      const res3 = await exec(true, true, payloadBasic);
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("At least one response is required");
 
    });

    it('should return 400 if provided responseType is not valid', async () => {
      // missing responseType property
      delete payloadBasic.responses[0].responseType;
      const res1 = await exec(true, true, payloadBasic);
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Response type is required");

      // responseType is something other than "basic" or "embed"
      payloadBasic.responses[0].responseType = "NotBasicOrEmbed";
      const res2 = await exec(true, true, payloadBasic);
      expect(res2.status).toBe(400);
      expect(res2.text).toBe('Response type must be either "basic" or "embed"');
      
    });

    // While responseType = embed
    it('should return 400 if provided embedTitle is not valid', async () => {
      // missing embedTitle
      delete payloadEmbed.responses[0].embedTitle;
      const res1 = await exec(true, true, payloadEmbed);
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Title is required");

      // blank embedTitle
      payloadEmbed.responses[0].embedTitle = "";
      const res2 = await exec(true, true, payloadEmbed);
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Title cannot be blank");

      // embedTitle greater than 240 characters
      payloadEmbed.responses[0].embedTitle = new Array(242).join('a');
      const res3 = await exec(true, true, payloadEmbed);
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Title cannot be greater than 240 characters");

    });

    // While responseType = embed
    it('should return 400 if provided embedLinkURL is not valid', async () => {
      // missing embedLinkURL property
      delete payloadEmbed.responses[0].embedLinkURL;
      const res1 = await exec(true, true, payloadEmbed);
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Link url is required");

      // embedLinkURL greater than 2040 characters
      payloadEmbed.responses[0].embedLinkURL = `http://www.google.com/${new Array(2042).join('a')}`;
      const res2 = await exec(true, true, payloadEmbed);
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Urls cannot be greater than 2040 characters");

      // embedLinkURL an invalid URL pattern
      payloadEmbed.responses[0].embedLinkURL = "invalidurl";
      const res3 = await exec(true, true, payloadEmbed);
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Urls must be valid and well formed (http or https)");

      // Ensure an empty embedLinkURL property is valid
      payloadEmbed.responses[0].embedLinkURL = "";
      const res4 = await exec(true, true, payloadEmbed);
      expect(res4.status).toBe(200);

    });

    // While responseType = embed
    it('should return 400 if provided embedColor is not valid', async () => {
      // missing embedColor
      delete payloadEmbed.responses[0].embedColor;
      const res1 = await exec(true, true, payloadEmbed);
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Color is required");

      // embedColor greater than 7 characters
      payloadEmbed.responses[0].embedColor = "#FFFFFFF";
      const res2 = await exec(true, true, payloadEmbed);
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Color must be a valid hex code");

      // embedColor an invalid hex pattern
      payloadEmbed.responses[0].embedColor = "#FFFS";
      const res3 = await exec(true, true, payloadEmbed);
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Color must be a valid hex code");

    });

    // While responseType = embed
    it('should return 400 if provided embedThumbnailURL is not valid', async () => {
      // missing embedThumbnailURL
      delete payloadEmbed.responses[0].embedThumbnailURL;
      const res1 = await exec(true, true, payloadEmbed);
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Thumbnail url property is required");

      // embedThumbnailURL greater than 2040 characters
      payloadEmbed.responses[0].embedThumbnailURL = `http://www.google.com/${new Array(2042).join('a')}`;
      const res2 = await exec(true, true, payloadEmbed);
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Urls cannot be greater than 2040 characters");

      // embedTumbnailURL an invalid URL pattern
      payloadEmbed.responses[0].embedThumbnailURL = "invalidurl";
      const res3 = await exec(true, true, payloadEmbed);
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Urls must be valid and well formed (http or https)");

      // Ensure an empty embedThumbnailURL property is valid
      payloadEmbed.responses[0].embedThumbnailURL = "";
      const res4 = await exec(true, true, payloadEmbed);
      expect(res4.status).toBe(200);

    });

    // While responseType = embed
    it('should return 400 if provided embedMainImageURL is not valid', async () => {
      // missing embedMainImageURL
      delete payloadEmbed.responses[0].embedMainImageURL;
      const res1 = await exec(true, true, payloadEmbed);
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Main image url property is required");

      // embedMainImageURL greater than 2040 characters
      payloadEmbed.responses[0].embedMainImageURL = `http://www.google.com/${new Array(2042).join('a')}`;
      const res2 = await exec(true, true, payloadEmbed);
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Urls cannot be greater than 2040 characters");

      // embedMainImageURL an invalid URL pattern
      payloadEmbed.responses[0].embedMainImageURL = "invalidurl";
      const res3 = await exec(true, true, payloadEmbed);
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Urls must be valid and well formed (http or https)");

      // Ensure an empty embedMainImageURL property is valid
      payloadEmbed.responses[0].embedMainImageURL = "";
      const res4 = await exec(true, true, payloadEmbed);
      expect(res4.status).toBe(200);

    });

    // While responseType = embed
    it('should return 400 if provided embedDescription is not valid', async () => {
      // missing embedDescription property
      delete payloadEmbed.responses[0].embedDescription;
      const res1 = await exec(true, true, payloadEmbed);
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Description property is required");

      // ensure embedDescription property is valid
      payloadEmbed.responses[0].embedDescription = "";
      const res2 = await exec(true, true, payloadEmbed);
      expect(res2.status).toBe(200);
      
      // embedDescription greater than 3000 characters
      payloadEmbed.responses[0].embedDescription = new Array(3002).join('a');
      const res3 = await exec(true, true, payloadEmbed);
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Description cannot be greater than 3000 characters");
    
    });

    // While responseType = embed
    it('should return 400 if provided embedFields is not valid', async () => {
      // embedFields not an array
      payloadEmbed.responses[0].embedFields = "a string";
      const res1 = await exec(true, true, payloadEmbed);
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Embed fields must be an array");

      // embedFields name blank
      payloadEmbed.responses[0].embedFields = [
        {
          name: "",
          value: "value",
          inline: true,
        }
      ];
      const res2 = await exec(true, true, payloadEmbed);
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Name cannot be blank");

      // embedFields value blank
      payloadEmbed.responses[0].embedFields = [
        {
          name: "name",
          value: "",
          inline: true,
        }
      ];
      const res3 = await exec(true, true, payloadEmbed);
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Value cannot be blank");

      // embedFields missing inline
      payloadEmbed.responses[0].embedFields = [
        {
          name: "name",
          value: "value",
        }
      ];
      const res4 = await exec(true, true, payloadEmbed);
      expect(res4.status).toBe(400);
      expect(res4.text).toBe("Inline is required");


      // embedFields inline not a boolean
      payloadEmbed.responses[0].embedFields = [
        {
          name: "name",
          value: "value",
          inline: "string",
        }
      ];
      const res5 = await exec(true, true, payloadEmbed);
      expect(res5.status).toBe(400);
      expect(res5.text).toBe("Inline must be a boolean");

    });

    // While responseType = embed
    it('should return 400 if provided embedFooter is not valid', async () => {
      // missing embedFooter property 
      delete payloadEmbed.responses[0].embedFooter;
      const res1 = await exec(true, true, payloadEmbed);
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Footer property is required");

      // embedFooter is greater than 500 characters
      payloadEmbed.responses[0].embedFooter = new Array(502).join('a');
      const res2 = await exec(true, true, payloadEmbed);
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Footer cannot be greater than 500 characters");

    });

    // While responseType = embed
    it('should return 400 if provided embedFooterThumbnailURL is not valid', async () => {
      // missing embedFooterThumbnailURL
      delete payloadEmbed.responses[0].embedFooterThumbnailURL;
      const res1 = await exec(true, true, payloadEmbed);
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Footer thumbnail image url property is required");

      // embedFooterThumbnailURL greater than 2040 characters
      payloadEmbed.responses[0].embedFooterThumbnailURL = `http://www.google.com/${new Array(2042).join('a')}`;
      const res2 = await exec(true, true, payloadEmbed);
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Urls cannot be greater than 2040 characters");

      // embedFooterThumbnailURL an invalid URL pattern
      payloadEmbed.responses[0].embedFooterThumbnailURL = "invalidurl";
      const res3 = await exec(true, true, payloadEmbed);
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Urls must be valid and well formed (http or https)");

      // Ensure an empty embedFooterThumbnailURL property is valid
      payloadEmbed.responses[0].embedFooterThumbnailURL = "";
      const res4 = await exec(true, true, payloadEmbed);
      expect(res4.status).toBe(200);

    });

    // While responseType = embed
    it('should return 400 if response is provided', async () => {
      // response is not blank
      payloadEmbed.responses[0].response = "not blank";
      const res1 = await exec(true, true, payloadEmbed);
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Response must be blank");

    });

    it('should return 200 if random-response addition is successful', async () => {
      const res = await exec(true, true, payloadBasic);
      const res2 = await exec(true, true, payloadEmbed);

      expect(res.status).toBe(200);
      expect(res.body.commandModules.length).toBe(2); // Ensure that commandModules didn't grow
      expect(res2.status).toBe(200);
      expect(res2.body.commandModules.length).toBe(2);
    });
  });
});
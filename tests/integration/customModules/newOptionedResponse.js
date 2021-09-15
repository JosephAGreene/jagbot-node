require( 'dotenv' ).config();
const request = require('supertest');
const mongoose = require('mongoose');
const { User } = require("../../../models/user");
const { Bot } = require("../../../models/bot");

describe('/api/custom-modules', () => {
  let server;
  let payload; 
  let userId;
  let botId;
  let botToken = process.env.SUPERTEST_BOT_TOKEN;
  
  beforeAll(async () => {
    server = require('../../testServer'); 
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
          type: "optioned-response",
          command: "duplicateCommand",
          description: "This is a fake module to test against",
          responseLocation: "server",
          options: [
            {
              _id: new mongoose.mongo.ObjectId(),
              keyword: "duplicateKeyword",
              response: "This is a test response",
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

    payload = {
      botId: botId,
      command: "command",
      description: "description",
      responseLocation: "server",
      options: [
        {
          keyword: "payloadKeyword",
          response: "payloadResponse",
        },
      ]
    }
  });

  const exec = async (injectBool, realUser, payload) => {
    const injector = { inject: {injectBool : injectBool, realUser: realUser, userId: userId} };
    return request(server)
      .post('/api/custom-modules/optioned-response')
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

  describe('POST /optioned-response', () => {
    it('should return 401 if credentials are not provided', async () => {
      const res = await exec(false);

      expect(res.status).toBe(401);
    });

    it('should return 401 if credentials provided do not match the owner the bot', async () => {
      const res = await exec(true, false, payload);

      expect(res.status).toBe(401);
    });

    it('should return 404 if the bot does not exist', async () => {
      payload.botId = new mongoose.mongo.ObjectId();

      const res = await exec(true, true, payload);

      expect(res.status).toBe(404);
    });

    it('should return 409 if a duplicate command is sent', async () => {
      payload.command = "duplicateCommand";

      const res = await exec(true, true, payload);

      expect(res.status).toBe(409);
    });

    it('should return 400 if options array contains a duplicate keyword', async () => {
      const payload1 = {
        ...payload,
        options: [
          {
            keyword: "duplicate",
            response: "response",
          }, 
          {
            keyword: "duplicate",
            response: "response",
          }
        ]
      }

      // Ignore case when checking for duplicate keywords
      const payload2 = {
        ...payload,
        options: [
          {
            keyword: "DUPLICATE",
            response: "response",
          }, 
          {
            keyword: "duplicate",
            response: "response",
          }
        ]
      }

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);

      expect(res1.status).toBe(400);
      expect(res1.text).toBe("No duplicate keywords allowed");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("No duplicate keywords allowed");
    });

    it('should return 400 if bot id is not provided', async () => {
      delete  payload.botId;

      const res = await exec(true, true, payload);

      expect(res.status).toBe(400);
      expect(res.text).toBe("Bot ID is required");
    });

    it('should return 400 if provided command is not valid', async () => {
      // missing command property
      const payload1 = {
        ...payload
      }
      delete payload1.command;

      // command more than 2 words
      const payload2 = {
        ...payload,
        command: "One Two"
      }

      // command greater than 30 characters
      const payload3 = {
        ...payload,
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
        ...payload
      }
      delete payload1.description;

      // description greater than 250 characters
      const payload2 = {
        ...payload,
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
        ...payload
      }
      delete payload1.responseLocation;

      // invalid responseLocation property
      const payload2 = {
        ...payload,
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
      // missing options property
      const payload1 = {
        ...payload,
      }
      delete payload1.options;

      // options propery not an array
      const payload2 = {
        ...payload,
        options: "a string",
      }

      // options array empty
      const payload3 = {
        ...payload,
        options: [],
      }

      // options array with missing keyword
      const payload4 = {
        ...payload,
        options: [{
          keyword: "",
          response: "This is a response"
        }],
      }

      // options array with double keyword
      const payload5 = {
        ...payload,
        options: [{
          keyword: "double keyword",
          response: "This is a response"
        }],
      }

      // options array with keyword greater than 30 characters
      const payload6 = {
        ...payload,
        options: [{
          keyword: "Thisisareallylongwordthatexceedsthe30characterlimit",
          response: "This is a response"
        }],
      }

      // options array with missing response
      const payload7 = {
        ...payload,
        options: [{
          keyword: "keyword",
        }]
      }

      // options array with response greater than 2000 characters
      const payload8 = {
        ...payload,
        options: [{
          keyword: "keyword",
          response: new Array(2002).join('a'),
        }]
      }

      const res1 = await exec(true, true, payload1);
      const res2 = await exec(true, true, payload2);
      const res3 = await exec(true, true, payload3);
      const res4 = await exec(true, true, payload4);
      const res5 = await exec(true, true, payload5);
      const res6 = await exec(true, true, payload6);
      const res7 = await exec(true, true, payload7);
      const res8 = await exec(true, true, payload8);
      
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("At least one optioned response is required");
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Options property must be an array");
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("At least one optioned response is required");
      expect(res4.status).toBe(400);
      expect(res4.text).toBe("Keyword is required");
      expect(res5.status).toBe(400);
      expect(res5.text).toBe("Keyword must be a single word")
      expect(res6.status).toBe(400);
      expect(res6.text).toBe("Keyword cannot be greater than 30 characters")
      expect(res7.status).toBe(400);
      expect(res7.text).toBe("Response is required");
      expect(res8.status).toBe(400);
      expect(res8.text).toBe("Response cannot be greater than 2000 characters");
    });

    it('should return 200 if optioned-response addition is successful', async () => {
      const res = await exec(true, true, payload);

      expect(res.status).toBe(200);
      expect(res.body.commandModules.length).toBe(2); // Ensure that commandModules grew by 1      
    });
  });
});
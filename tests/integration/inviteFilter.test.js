require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const { User } = require("../../models/user");
const { Bot } = require("../../models/bot");
const { WordFilter } = require("../../models/wordFilter");
const { InviteFilter } = require("../../models/inviteFilter");
const { MassCapsFilter } = require("../../models/massCapsFilter");
const { MassMentionsFilter } = require("../../models/massMentionsFilter");

describe('/api/custom-modules', () => {
  let server;
  let payload;
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
      commandModules: [],
      scanModules: [
        new InviteFilter(),
        new MassCapsFilter(),
        new MassMentionsFilter(),
        new WordFilter(),
      ]
    });

    user.bots.push(bot._id);

    await user.save();
    await bot.save();
    userId = user._id;
    botId = bot._id;

    payload = {
      botId: botId,
      enabled: false,
      delete: false,
      warn: false,
      responseLocation: "server",
      response: "response",
      ignoredRoles: [],
    }

  });

  const exec = async (injectBool, realUser, payload) => {
    const injector = { inject: { injectBool: injectBool, realUser: realUser, userId: userId } };
    return request(server)
      .post('/api/automod-modules/invite-filter')
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

  describe('POST /invite-filter', () => {
    it('should return 401 if credentials are not provided', async () => {
      const res = await exec(false, true, payload);

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

    it('should return 400 if botId property is not valid', async () => {
      // botId property does not exist
      delete payload.botId;
      const res1 = await exec(true, true, payload);
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Bot ID is required");

      // botId is blank
      payload.botId = "";
      const res2 = await exec(true, true, payload);
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Bot ID cannot be blank");

    });

    it('should return 400 if both delete and warn are false when enabled is true', async () => {
      payload = {
        ...payload,
        enabled: true,
        delete: false,
        warn: false,
      }
      const res = await exec(true, true, payload);
      expect(res.status).toBe(400);
      expect(res.text).toBe("Either delete or warn must be true when filter is enabled");

    });

    it('should return 400 is enabled property is not valid', async () => {
      // enabled property does not exist
      delete payload.enabled;
      const res1 = await exec(true, true, payload);
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Enabled is required");

      // enabled is not a boolean
      payload.enabled = "a string";
      const res2 = await exec(true, true, payload);
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Enabled must be either true or false");

    });

    it('should return 400 if delete property is not valid', async () => {
      // delete property does not exist
      delete payload.delete;
      const res1 = await exec(true, true, payload);
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Delete is required");

      // delete is not a boolean
      payload.delete = "a string";
      const res2 = await exec(true, true, payload);
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Delete must be either true or false");

    });

    it('should return 400 if warn property is not valid', async () => {
      // warn property does not exist
      delete payload.warn;
      const res1 = await exec(true, true, payload);
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Warn is required");

      // delete is not a boolean
      payload.warn = "a string";
      const res2 = await exec(true, true, payload);
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Warn must be either true or false");
    });

    it('should return 400 if response location property is not valid', async () => {
      // location property does not exist
      delete payload.responseLocation;
      const res1 = await exec(true, true, payload);
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Response location is required");

      // Location property is not "server" or "directmessage"
      payload.responseLocation = "invalid";
      const res2 = await exec(true, true, payload);
      expect(res2.status).toBe(400);
      expect(res2.text).toBe('Response location must be either "server" or "directmessage"');

    });
    
    it('should return 400 if response is not valid', async () => {
      // response property does not exist
      delete payload.response;
      const res1 = await exec(true, true, payload);
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Response is required");

      // response property blank when enabled is FALSE
      payload = {
        ...payload,
        enabled: false,
        warn: true,
        response: "",
      }
      const res2 = await exec(true, true, payload);
      expect(res2.status).toBe(200);

      // response property blank when enabled TRUE && warn FALSE
      paylad = {
        ...payload,
        enabled: true,
        warn: false,
        response: "",
      }
      const res3 = await exec(true, true, payload);
      expect(res3.status).toBe(200);

      // response property blank when enabled && warn are TRUE
      payload = {
        ...payload,
        enabled: true,
        warn: true,
        response: "",
      }
      const res4 = await exec(true, true, payload);
      expect(res4.status).toBe(400);
      expect(res4.text).toBe("Response cannot be blank");

    });

    it('should return 400 if ignoredRoles is not valid', async () => {
      // ignoreRoles property does not exist
      delete payload.ignoredRoles;
      const res1 = await exec(true, true, payload);
      expect(res1.status).toBe(400);
      expect(res1.text).toBe("Ignored roles is required");

      // ignoredRoles is not an array
      payload.ignoredRoles = "a string";
      const res2 = await exec(true, true, payload);
      expect(res2.status).toBe(400);
      expect(res2.text).toBe("Ignored roles must be an array");

      // ignoredRoles is greater than 10
      payload.ignoredRoles = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
      const res3 = await exec(true, true, payload);
      expect(res3.status).toBe(400);
      expect(res3.text).toBe("Ignored roles cannot exceed 10");

    });

    it('should return 200 if a valid payload is given',  async () => {
      const res  = await exec(true, true, payload);
      expect(res.status).toBe(200);

      payload = {
        botId: botId,
        enabled: true,
        delete: true,
        warn: true,
        responseLocation: "server",
        response: "response",
        ignoredRoles: ["role1", "role2", "role3"],
      }
      const res2 = await exec(true, true, payload);
      expect(res2.status).toBe(200);
    });

  });
});
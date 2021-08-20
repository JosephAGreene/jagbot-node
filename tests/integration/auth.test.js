const request = require('supertest');
const mongoose = require('mongoose');
const { User } = require("../../models/user");

describe('/api/auth', () => {
  let server; 
  let userId;

  beforeEach(async () => { 
    server = require('../testServer'); 

    let user = new User({
      discordTag: "testValue",
      discordId: "testValue",
    });
    
    await user.save();
    userId = user._id;
  });

  const exec = (injectBool, realUser) => {
    return request(server)
      .get('/api/auth')
      .send({ inject: {injectBool : injectBool, realUser: realUser, userId: userId} });
  };

  afterEach(async () => { 
    await server.close(); 
    await User.deleteMany({});
  });

  describe('GET /', () => {
    it('should return 401 if credentials are not provided', async () => {
      const res = await exec(false);

      expect(res.status).toBe(401);
    });

    it('should return 401 is improper credentials are provided', async () => {
      const res = await exec(true, false);

      expect(res.status).toBe(401);
    })

    it('should return 200 if proper credentials are provided', async () => {
      const res = await exec(true, true);

      expect(res.status).toBe(200);
    });

    it('should return bots array if proper credentials are provided', async () => {
      const res = await exec(true, true);
      console.log(typeof res.body.bots)

      expect(res.body).toHaveProperty("bots");
      expect(Array.isArray(res.body.bots)).toBe(true);
    });
  });
});
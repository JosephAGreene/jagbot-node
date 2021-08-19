const request = require('supertest');
const mongoose = require('mongoose');

let server;

describe('/api/auth', () => {
  beforeEach(() => { server = require('../../index.js'); })
  afterEach(async () => {
    await server.close();
  });

  describe('GET /', () => {
    it('should return 401 if credentials are not provided', async () => {
      const res = await request(server).get('/api/auth');
    
      expect(res.status).toBe(401);
    });
  });
});
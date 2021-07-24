const express = require('express');
const cors = require('cors');
const auth = require('../routes/auth');
const bots = require('../routes/bots');

module.exports = function(app) {
    app.use(cors({
      origin: ['http://localhost:3000'],
      credentials: true,
    }));
    app.use(express.json());
    app.use('/api/auth', auth);
    app.use('/api/bots', bots);
}
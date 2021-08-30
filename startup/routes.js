const express = require('express');
const cors = require('cors');
// Routes
const auth = require('../routes/auth');
const bots = require('../routes/bots');
const customModules = require('../routes/customModules');
// Middleware
const error = require('../middleware/error');

module.exports = function(app) {
    app.use(cors({
      origin: ['http://localhost:3000'],
      credentials: true,
    }));
    app.use(express.json());
    app.use('/api/auth', auth);
    app.use('/api/bots', bots);
    app.use('/api/custom-modules', customModules);
    app.use(error);
}
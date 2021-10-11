const express = require('express');
const cors = require('cors');
// Routes
const auth = require('../routes/auth');
const bots = require('../routes/bots');
const customModules = require('../routes/customModules');
const moderationModules = require('../routes/moderationModules');
const autoModModules = require('../routes/autoModModules');
const announcementModules = require('../routes/announcementModules');

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
    app.use('/api/moderation-modules', moderationModules);
    app.use('/api/automod-modules', autoModModules);
    app.use('/api/announcement-modules', announcementModules);
    app.use(error);
}
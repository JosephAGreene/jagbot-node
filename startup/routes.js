const express = require('express');
const cors = require('cors');
const bots = require('../routes/bots');
const users = require('../routes/users');
const auth = require('../routes/auth');

module.exports = function(app) {
    app.use(cors());
    app.use(express.json());
    app.use('/api/bots', bots);
    app.use('/api/users', users);
    app.use('/api/auth', auth);
}
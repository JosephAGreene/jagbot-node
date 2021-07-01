const express = require('express');
const bots = require('../routes/bots');
const users = require('../routes/users');

module.exports = function(app) {
    app.use(express.json());
    app.use('/api/bots', bots);
    app.use('/api/users', users);
}
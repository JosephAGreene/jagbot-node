require( 'dotenv' ).config();
require( '../strategies/discord');

const express = require("express");
const config = require("config");
const app = express();
const mongoose = require('mongoose');

// injectUser function is middleware that exists to fake the real server's use of 
// discord oauth2 passport middleware. The passport middleware injects a user object
// onto the req object of every incoming credentialed request (i.e. requests sent with passport session cookie).
// Because our testing environment doesn't have access to discord oauth2 responses, we will intercept and inject our 
// own req.user object when requested by the testing environment. req.body.inject object will act as our parameters in 
// determining how the req.user object will be created and injected.
const injectUser = function (req, res, next) {
  if (req.body.inject.injectBool) {
    req.user = {"_id" : (req.body.inject.realUser 
      ? req.body.inject.userId
      : new mongoose.mongo.ObjectId())
    };
  }
  // Remove inject values from req.body before proceeding
  delete req.body.inject;
  next();
};

require("../startup/logging")();
require("../startup/db")();
//require("../startup/passport")(app);

app.use(express.json());
app.use(injectUser);
require("../startup/routes")(app);

require("../startup/discordBot")();

const port =  config.get("port") || 5000;
const server = app.listen(port, () =>
  console.log(`Listening on port ${port}...`)
);

module.exports = server;
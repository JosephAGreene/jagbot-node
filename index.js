require( 'dotenv' ).config();
require( './strategies/discord');

const express = require("express");
const config = require("config");
const app = express();

require("./startup/logging")();
require("./startup/db")();
require("./startup/passport")(app);
require("./startup/routes")(app);

const {getSteamApps} = require("./startup/steamApps");
getSteamApps();
require("./startup/discordBot")();

const port = process.env.PORT || config.get("port");
const server = app.listen(port, () =>
  console.log(`Listening on port ${port}...`)
);

module.exports = server;
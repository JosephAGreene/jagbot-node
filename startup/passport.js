require( 'dotenv' ).config();
const config = require("config");
const passport = require("passport");
const session = require('express-session');
const Store = require('connect-mongo');

module.exports = function(app) {
  app.use( session({
    secret: process.env.PASSPORT_SECRET || config.get("passportsecret"),
    cookie: {
      maxAge: 60000 * 60 * 24
    }, 
    resave: false,
    saveUninitialized: false,
    store: Store.create({mongoUrl: process.env.DB || config.get("db")})
  }));
  app.use(passport.initialize());
  app.use(passport.session());
}
const passport = require('passport');
const DiscordStrategy = require('passport-discord');
const {User} = require('../models/user');

passport.serializeUser((user, done) => {
  done(null, user.discordId);
});

passport.deserializeUser( async (discordId, done) => {
  try {
    const user = await User.findOne({discordId});
    return user ? done(null, user) : done(null, null);
  } catch (err) {
    console.log(err);
    done(err, null);
  }
})

passport.use(
  new DiscordStrategy( {
    clientID: process.env.DASHBOARD_CLIENT_ID,
    clientSecret: process.env.DASHBOARD_CLIENT_SECRET,
    callbackURL: process.env.DASHBOARD_CALLBACK_URL,
    scope: ['identify'],
  }, async (accessToken, refreshToken, profile, done) => {
      const {id, username, discriminator, avatar} = profile;
      const avatarURL = `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`;
      try {
        const findUser = await User.findOneAndUpdate( {discordId: id}, {
          discordTag: `${username}#${discriminator}`,
          avatarURL: avatarURL,
        }, {useFindAndModify: false, new: true});
  
        if (findUser) {
          // User Found
          return done(null, findUser);
        } else {
          // User not found, so make a new one
          const newUser = await User.create({
            discordId: id,
            discordTag: `${username}#${discriminator}`,
            avatarURL: avatarURL,
          });
          return done(null, newUser);
        }
      } catch (err) {
        console.log(err);
        return done(err, null);
      }
  })
);
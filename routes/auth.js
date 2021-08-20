const express = require('express');
const router = express.Router();
const passport = require('passport');
const { User } = require("../models/user");
const {returnAvatarUrl, returnStatus} = require("../discordBot/botClientUtils");


router.get('/discord', passport.authenticate('discord'));

router.get('/discord/redirect', passport.authenticate('discord'), async (req, res) => {
  res.redirect('http://localhost:3000/dashboard');
});

router.get('/', async (req, res) => {
  if (req.user) {
    const user = await User.findById(req.user._id, '-__v')
    .populate('bots', '-botToken -__v');

    if(!user) {
      res.sendStatus(401);
    }

    user.bots.forEach(async (bot) => {
      // Grabbing URLs for avatar images if possible
      bot.set('avatarURL', returnAvatarUrl(bot._id));
      bot.set('status', returnStatus(bot._id)); 
      await bot.save();
    })
    await user.save();
    res.sendStatus(200).send(user);
  } else {
    res.sendStatus(401);
  }
});

router.get('/logout', function(req, res){
  req.logout();
  res.sendStatus(200);
});

module.exports = router;
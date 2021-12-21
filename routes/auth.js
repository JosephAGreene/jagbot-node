const express = require('express');
const router = express.Router();
const passport = require('passport');
const auth = require("../middleware/auth");
const { User } = require("../models/user");
const {returnAvatarUrl, returnStatus, returnRoles} = require("../discordBot/botClientUtils");


router.get('/discord', passport.authenticate('discord'));

router.get('/discord/redirect', passport.authenticate('discord'), async (req, res) => {
  res.redirect('http://localhost:3000/dashboard');
});

router.get('/', async (req, res) => {
  if (req.user) {
    const user = await User.findById(req.user._id, '-__v');

    if(!user) {
      res.sendStatus(401);
    }

    res.send(user);
  } else {
    res.sendStatus(401);
  }
});

router.get('/logout', function(req, res){
  req.logout();
  res.sendStatus(200);
});

module.exports = router;
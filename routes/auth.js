const bcrypt = require('bcrypt');
const {User} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

// Return current authorized & logged in user
router.post('/signin', async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if(!user) return res.status(400).send('Invalid email or password.');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if(!validPassword) return res.status(400).send('Invalid email or password.');

  const token = user.generateAuthToken();
  res.status(200).send({ accessToken: token, role: user.role, firstName: user.firstName, lastName: user.lastName });
  //res.status(200).send(token);
});

module.exports = router;
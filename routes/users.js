const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const {returnAvatarUrl, returnStatus} = require("../discordBot/botClientUtils");

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

// Return all bots that belong to user
router.get("/bots", auth, async (req, res) => {
  const user = await User.findById(req.user._id)
  .populate('bots').lean();

  user.bots.forEach((bot) => {
    // Grabbing URLs for avatar images if possible
    bot.avatar = returnAvatarUrl(bot.botId);

    // Replacing status value from databse in favor of active
    // status from the botClients object (i.e. The clients actually running atm)
    bot.status = returnStatus(bot.botId); 
  })

  res.send(user.bots);
});

router.post("/", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User({name: req.body.name, email: req.body.email, password: req.body.password});
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send({"_id": user._id, "name": user.name, "email": user.email});
});

module.exports = router;
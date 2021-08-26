const { messageParser } = require("../commandUtils");

module.exports = {
  type: 'random-response',
  description: 'This is a random response description',
  async execute(message, botModule) {
    try {
      // Determine random number by using the length of the responses array
      let randomPosition = Math.floor(Math.random() * botModule.responses.length);

      // If a response exists in the responses array that correlates to the randomPosition number,
      // then respond with it. 
      if (botModule.responses[randomPosition]) {
        const response = await messageParser(message, botModule.responses[randomPosition].response);
        message.channel.send(response.toString());
      }
    }
    catch (err) {
      message.channel.send(err.message);
    }
  },
};
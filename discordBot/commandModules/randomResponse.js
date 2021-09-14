const { buildResponse } = require("../commandUtils");

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
        const response = await buildResponse(message, botModule.responses[randomPosition]);
        await response();
      }
    }
    catch (err) {
      message.channel.send(err.message);
    }
  },
};
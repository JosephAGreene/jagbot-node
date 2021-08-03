const mongoose = require('mongoose');

/* 
    Single Response is a command module that has just a single response.

    An example use case for ths module would be server rules command.
    E.X. !ServerRules
    Bot Response: 
    1) No Spam
    2) No Invite Links
    3) etc, etc, etc
*/

const singleResponseSchema = new mongoose.Schema({
    moduleType: {
        type: String,
        default: "single-response",
    },
    description: {
      type: String,
      trim: true,
    },
    command: {
        type: String,
        trim: true,
        required: true,
    },
    responseLocation: {
      type: String,
      trim: true,
      default: "server",
    },
    response: {
        type: String,
        trim: true,
        required: true,
    },
});

const SingleResponse = mongoose.model('SingleResponse', singleResponseSchema);
exports.SingleResponse = SingleResponse;
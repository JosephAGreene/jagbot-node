const mongoose = require('mongoose');

/* 
    Collection Response is a cammand module that contains an array of potential responses.
    Command + Keyword = Response

    An example use case for this feature would be a dictionary feature.
    Ex: !define javascript 
    Bot Repsonse: "The propriety name of a high-level, object-oriented scripting language used especially
    to create interactive applications running over the internet"
*/

const collectionResponseSchema = new mongoose.Schema({
    moduleType: {
        type: String,
        default: "collection-response",
    },
    command: {
        type: String,
        lowercase: true,
        trim: true,
        required: true,
    },
    options: [
        {
            keyword: {
                type: String,
                lowercase: true,
                trim: true,
                required: true,
            },
            response: {
                type: String,
                trim: true,
                required: true,
            }
        }
    ],
});

const CollectionResponse = mongoose.model('CollectionResponse', collectionResponseSchema);
exports.CollectionResponse = CollectionResponse;
const mongoose = require('mongoose');

/*
    Word Filter is a scan module that will response when a word 
    is sent that is also detected in the triggerWords array.
*/

const wordFilterSchema = new mongoose.Schema({
    type: {
        type: String,
        default: "word-filter",
    },
    triggerWords: [
        {
            type: String,
            trim: true,
        }
    ],
    deleteUserMessage : {
        type: Boolean,
        default: false
    },
    warnUser : {
        type: Boolean,
        default: false
    },
    warningResponse : {
        type: String,
        trim: true, 
        default: "Naughty words will not be tolerated."
    },
    editUserMessage : {
        type: Boolean,
        default: false
    },
    spamLimit : {
        type: Number,
        default: 5,
    }, 
    spamResponse : {
        type: String,
        trim: true,
        default: "Spamming naughty words will not be tolerated."
    }
});

const WordFilter = mongoose.model('WordFilter', wordFilterSchema);
exports.WordFilter = WordFilter;
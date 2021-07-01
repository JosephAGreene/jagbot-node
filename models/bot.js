const mongoose = require('mongoose');

const customSingleSchema = new mongoose.Schema({
    moduleType: {
        type: String,
        default: "custom-single",
    },
    command: {
        type: String,
        trim: true,
        required: true,
    },
    response: {
        type: String,
        lowercase: true,
        trim: true,
        required: true,
    },
});

const customCollectionSchema = new mongoose.Schema({
    moduleType: {
        type: String,
        default: "custom-collection",
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

const customRandomSchema = new mongoose.Schema({
    moduleType: {
        type: String,
        default: "custom-random",
    },
    command: {
        type: String,
        lowercase: true,
        trim: true,
        required: true,
    },
    responses : [
        {
            type: String,
            trime: true
        }
    ]
});

// Word Filter is currently a scanModule in testing. Not to be used in production.
const wordFilterSchema = new mongoose.Schema({
    moduleType: {
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

const inviteFilterSchema = new mongoose.Schema({
    moduleType: {
        type: String,
        default: "invite-filter",
    },
    deleteLink : {
        type: Boolean,
        default: false
    },
    response : {
        type: String,
        trim: true
    }
});

const botSchema = new mongoose.Schema({
    botToken: {
        type: String,
        trim: true,
        required: true,
    },
    botId: {
        type: String,
        trim: true,
        required: true,
    },
    prefix: {
        type: String,
        trim: true,
        required: true,
    },
    scanModules: [], // Scan Modules are modules that scan and execute on incoming messages if conditions are met. 
    commandModules: [], // Command Modules require a command to induce execution
});
  
const CustomSingle = mongoose.model('CustomSingle', customSingleSchema);
const CustomCollection = mongoose.model('CustomCollection', customCollectionSchema);
const CustomRandom = mongoose.model('CustomRandom', customRandomSchema);
const WordFilter = mongoose.model('WordFilter', wordFilterSchema);
const InviteFilter = mongoose.model('InviteFilter', inviteFilterSchema);
const Bot = mongoose.model('Bot', botSchema);

exports.CustomSingle = CustomSingle;
exports.CustomCollection = CustomCollection;
exports.CustomRandom = CustomRandom;
exports.WordFilter = WordFilter;
exports.InviteFilter = InviteFilter;
exports.Bot = Bot;
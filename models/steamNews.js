const mongoose = require('mongoose');

const steamNewsSchema = new mongoose.Schema({
    moduleType: {
        type: String,
        default: "steam-news",
    },
    command: {
        type: String,
        trim: true,
        required: true,
    },
});

const SteamNews = mongoose.model('SteamNews', steamNewsSchema);
exports.SteamNews = SteamNews;
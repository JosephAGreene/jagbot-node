const mongoose = require('mongoose');

/* 
    Mass Caps Filter is a scan module that provokes a response when
    a message is sent that contains more than the allowed percentage
    of capitalized characters.
*/

const massCapsFilterSchema = new mongoose.Schema({
    type: {
        type: String,
        default: "masscaps-filter",
    },
    deleteMessage : {
        type: Boolean,
        default: false
    },
    response : {
        type: String,
        trim: true
    }
});

const MassCapsFilter = mongoose.model('MassCapsFilter', massCapsFilterSchema);
exports.MassCapsFilter = MassCapsFilter;
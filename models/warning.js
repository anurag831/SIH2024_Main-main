const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const warningSchema = new Schema({
    warningValue: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true }); 

const Warning = mongoose.model('Warning', warningSchema);
module.exports = Warning;

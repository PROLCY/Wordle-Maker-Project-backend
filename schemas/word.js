const mongoose = require('mongoose');

const { Schema } = mongoose;
const wordsSchema = new Schema({
    word: {
        type: String,
        required: true,
        unique: true,
    }
});

module.exports = mongoose.model('Word', wordsSchema);
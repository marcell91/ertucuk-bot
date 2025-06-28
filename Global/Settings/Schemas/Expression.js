const mongoose = require('mongoose');

const model = mongoose.model('Expression-Backup', mongoose.Schema({
    id: String,
    expression: String,
    name: String,
    type: Number,
    url: String,
    description: String,
    tags: String,
    animated: Boolean,
}));

module.exports = model;
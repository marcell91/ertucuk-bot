const mongoose = require('mongoose');

const model = mongoose.model('Role-Backup', mongoose.Schema({
    id: String,
    role: String,
    isDeleted: Boolean,
    deletedTimestamp: Number,
    name: String,
    color: String,
    position: Number,
    permissions: String,
    members: Array,
    icon: String,
    mentionable: Boolean,
    hoist: Boolean,
    channelOverwrites: Array
}));

module.exports = model;
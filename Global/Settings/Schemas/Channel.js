const mongoose = require('mongoose');

const model = mongoose.model('Channel-Backup', mongoose.Schema({
    id: String,
    channel: String,
    isDeleted: Boolean,
    deletedTimestamp: Number,
    name: String,
    type: Number,
    position: Number,
    permissionOverwrites: Array,
    messages: Array,
    bitrate: Number,
    userLimit: Number,
    parentId: String,
    topic: String,
    nsfw: Boolean,
    rateLimitPerUser: Number
}));

module.exports = model;
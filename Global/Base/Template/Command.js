const { PermissionsBitField: { Flags }, EmbedBuilder } = require('discord.js');

module.exports = {
    Name: '',
    Aliases: [''],
    Description: '',
    Usage: '',
    Category: '',
    Cooldown: 0,

    Permissions: {
        User: [],
        Role: []
    },

    Command: {
        Prefix: true,
    },

    messageRun: async (client, message, args, ertu, embed) => { },
};

// INTERACTION COMMAND EXAMPLE

module.exports = {
    Name: '',
    Aliases: [''],
    Description: '',
    Usage: '',
    Category: '',
    Cooldown: 0,

    Permissions: {
        User: [],
        Role: []
    },

    Command: {
        Prefix: true,
        Slash: true,
        Ephemeral: true,
        Options: [],
    },

    messageRun: async (client, message, args, ertu, embed) => { },

    interactionRun: async (client, interaction) => { },
};